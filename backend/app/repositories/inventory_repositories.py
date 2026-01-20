from typing import List, Optional
from app.databse import Database
from app.models.inventory import (
    InventoryCreate, InventoryUpdate, InventoryResponse, InventoryWithDetails,
    StockMovementInbound, StockMovementOutbound, StockMovementTransfer,
    StockMovementResponse, StockMovementWithDetails, LowStockAlert
)
from app.utils.exceptions import InsufficientStockError
import logging

logger = logging.getLogger(__name__)


class InventoryRepository:
    """Repository for inventory operations with ACID transaction support"""
    
    def __init__(self, db: Database):
        self.db = db
    
    # ========== Inventory CRUD ==========
    
    async def get_inventory(
        self,
        warehouse_id: Optional[int] = None,
        product_id: Optional[int] = None
    ) -> List[InventoryWithDetails]:
        """Get inventory with optional filters"""
        base_query = """
            SELECT 
                i.warehouse_id,
                w.warehouse_name,
                i.product_id,
                p.product_name,
                p.product_code,
                i.quantity,
                i.reserved_quantity,
                (i.quantity - i.reserved_quantity) as available_quantity,
                i.last_updated
            FROM inventory i
            JOIN warehouses w ON i.warehouse_id = w.warehouse_id
            JOIN products p ON i.product_id = p.product_id
            WHERE w.is_active = TRUE AND p.is_active = TRUE
        """
        
        params = []
        conditions = []
        
        if warehouse_id:
            conditions.append(f"i.warehouse_id = ${len(params) + 1}")
            params.append(warehouse_id)
        
        if product_id:
            conditions.append(f"i.product_id = ${len(params) + 1}")
            params.append(product_id)
        
        if conditions:
            base_query += " AND " + " AND ".join(conditions)
        
        base_query += " ORDER BY w.warehouse_name, p.product_name"
        
        rows = await self.db.fetch_all(base_query, *params)
        return [InventoryWithDetails(**dict(row)) for row in rows]
    
    async def get_inventory_by_warehouse_product(
        self,
        warehouse_id: int,
        product_id: int
    ) -> Optional[InventoryResponse]:
        """Get specific inventory record"""
        query = """
            SELECT 
                warehouse_id,
                product_id,
                quantity,
                reserved_quantity,
                (quantity - reserved_quantity) as available_quantity,
                last_updated
            FROM inventory
            WHERE warehouse_id = $1 AND product_id = $2
        """
        
        row = await self.db.fetch_one(query, warehouse_id, product_id)
        return InventoryResponse(**dict(row)) if row else None
    
    async def create_or_update_inventory(
        self,
        warehouse_id: int,
        product_id: int,
        quantity: int
    ) -> InventoryResponse:
        """Create or update inventory using UPSERT"""
        query = """
            INSERT INTO inventory (warehouse_id, product_id, quantity)
            VALUES ($1, $2, $3)
            ON CONFLICT (warehouse_id, product_id)
            DO UPDATE SET 
                quantity = inventory.quantity + EXCLUDED.quantity,
                last_updated = CURRENT_TIMESTAMP
            RETURNING 
                warehouse_id,
                product_id,
                quantity,
                reserved_quantity,
                (quantity - reserved_quantity) as available_quantity,
                last_updated
        """
        
        row = await self.db.fetch_one(query, warehouse_id, product_id, quantity)
        return InventoryResponse(**dict(row))
    
    # ========== Stock Movement Operations with Transactions ==========
    
    async def process_inbound_movement(
        self,
        movement: StockMovementInbound
    ) -> StockMovementResponse:
        """Process inbound stock movement with transaction"""
        async with self.db.transaction() as conn:
            # Insert stock movement record
            movement_query = """
                INSERT INTO stock_movements (
                    product_id, to_warehouse_id, quantity, movement_type,
                    reference_number, notes, created_by
                ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING movement_id, product_id, from_warehouse_id, to_warehouse_id,
                          quantity, movement_type, reference_number, notes,
                          movement_date, created_by
            """
            
            movement_row = await conn.fetchrow(
                movement_query,
                movement.product_id,
                movement.to_warehouse_id,
                movement.quantity,
                movement.movement_type,
                movement.reference_number,
                movement.notes,
                movement.created_by
            )
            
            # Update inventory
            inventory_query = """
                INSERT INTO inventory (warehouse_id, product_id, quantity)
                VALUES ($1, $2, $3)
                ON CONFLICT (warehouse_id, product_id)
                DO UPDATE SET 
                    quantity = inventory.quantity + EXCLUDED.quantity,
                    last_updated = CURRENT_TIMESTAMP
            """
            
            await conn.execute(
                inventory_query,
                movement.to_warehouse_id,
                movement.product_id,
                movement.quantity
            )
            
            return StockMovementResponse(**dict(movement_row))
    
    async def process_outbound_movement(
        self,
        movement: StockMovementOutbound
    ) -> StockMovementResponse:
        """Process outbound stock movement with transaction and validation"""
        async with self.db.transaction() as conn:
            # Check available quantity
            check_query = """
                SELECT quantity, reserved_quantity
                FROM inventory
                WHERE warehouse_id = $1 AND product_id = $2
                FOR UPDATE
            """
            
            inventory_row = await conn.fetchrow(
                check_query,
                movement.from_warehouse_id,
                movement.product_id
            )
            
            if not inventory_row:
                raise InsufficientStockError(
                    movement.product_id,
                    movement.from_warehouse_id,
                    0,
                    movement.quantity
                )
            
            available = inventory_row['quantity'] - inventory_row['reserved_quantity']
            if available < movement.quantity:
                raise InsufficientStockError(
                    movement.product_id,
                    movement.from_warehouse_id,
                    available,
                    movement.quantity
                )
            
            # Insert stock movement record
            movement_query = """
                INSERT INTO stock_movements (
                    product_id, from_warehouse_id, quantity, movement_type,
                    reference_number, notes, created_by
                ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING movement_id, product_id, from_warehouse_id, to_warehouse_id,
                          quantity, movement_type, reference_number, notes,
                          movement_date, created_by
            """
            
            movement_row = await conn.fetchrow(
                movement_query,
                movement.product_id,
                movement.from_warehouse_id,
                movement.quantity,
                movement.movement_type,
                movement.reference_number,
                movement.notes,
                movement.created_by
            )
            
            # Update inventory
            inventory_update = """
                UPDATE inventory
                SET quantity = quantity - $1,
                    last_updated = CURRENT_TIMESTAMP
                WHERE warehouse_id = $2 AND product_id = $3
            """
            
            await conn.execute(
                inventory_update,
                movement.quantity,
                movement.from_warehouse_id,
                movement.product_id
            )
            
            return StockMovementResponse(**dict(movement_row))
    
    async def process_transfer_movement(
        self,
        movement: StockMovementTransfer
    ) -> StockMovementResponse:
        """Process inter-warehouse transfer with transaction"""
        async with self.db.transaction() as conn:
            # Check source warehouse stock
            check_query = """
                SELECT quantity, reserved_quantity
                FROM inventory
                WHERE warehouse_id = $1 AND product_id = $2
                FOR UPDATE
            """
            
            inventory_row = await conn.fetchrow(
                check_query,
                movement.from_warehouse_id,
                movement.product_id
            )
            
            if not inventory_row:
                raise InsufficientStockError(
                    movement.product_id,
                    movement.from_warehouse_id,
                    0,
                    movement.quantity
                )
            
            available = inventory_row['quantity'] - inventory_row['reserved_quantity']
            if available < movement.quantity:
                raise InsufficientStockError(
                    movement.product_id,
                    movement.from_warehouse_id,
                    available,
                    movement.quantity
                )
            
            # Record movement
            movement_query = """
                INSERT INTO stock_movements (
                    product_id, from_warehouse_id, to_warehouse_id, quantity,
                    movement_type, reference_number, notes, created_by
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING movement_id, product_id, from_warehouse_id, to_warehouse_id,
                          quantity, movement_type, reference_number, notes,
                          movement_date, created_by
            """
            
            movement_row = await conn.fetchrow(
                movement_query,
                movement.product_id,
                movement.from_warehouse_id,
                movement.to_warehouse_id,
                movement.quantity,
                movement.movement_type,
                movement.reference_number,
                movement.notes,
                movement.created_by
            )
            
            # Decrease from source
            await conn.execute(
                """
                UPDATE inventory
                SET quantity = quantity - $1, last_updated = CURRENT_TIMESTAMP
                WHERE warehouse_id = $2 AND product_id = $3
                """,
                movement.quantity,
                movement.from_warehouse_id,
                movement.product_id
            )
            
            # Increase in destination
            await conn.execute(
                """
                INSERT INTO inventory (warehouse_id, product_id, quantity)
                VALUES ($1, $2, $3)
                ON CONFLICT (warehouse_id, product_id)
                DO UPDATE SET 
                    quantity = inventory.quantity + EXCLUDED.quantity,
                    last_updated = CURRENT_TIMESTAMP
                """,
                movement.to_warehouse_id,
                movement.product_id,
                movement.quantity
            )
            
            return StockMovementResponse(**dict(movement_row))
    
    # ========== Stock Movement History ==========
    
    async def get_stock_movements(
        self,
        product_id: Optional[int] = None,
        warehouse_id: Optional[int] = None,
        movement_type: Optional[str] = None,
        limit: int = 100
    ) -> List[StockMovementWithDetails]:
        """Get stock movement history"""
        query = """
            SELECT 
                sm.movement_id,
                p.product_name,
                p.product_code,
                w1.warehouse_name as from_warehouse_name,
                w2.warehouse_name as to_warehouse_name,
                sm.quantity,
                sm.movement_type,
                sm.reference_number,
                sm.movement_date,
                sm.created_by
            FROM stock_movements sm
            JOIN products p ON sm.product_id = p.product_id
            LEFT JOIN warehouses w1 ON sm.from_warehouse_id = w1.warehouse_id
            LEFT JOIN warehouses w2 ON sm.to_warehouse_id = w2.warehouse_id
            WHERE 1=1
        """
        
        params = []
        
        if product_id:
            params.append(product_id)
            query += f" AND sm.product_id = ${len(params)}"
        
        if warehouse_id:
            params.append(warehouse_id)
            query += f" AND (sm.from_warehouse_id = ${len(params)} OR sm.to_warehouse_id = ${len(params)})"
        
        if movement_type:
            params.append(movement_type)
            query += f" AND sm.movement_type = ${len(params)}"
        
        query += f" ORDER BY sm.movement_date DESC LIMIT {limit}"
        
        rows = await self.db.fetch_all(query, *params)
        return [StockMovementWithDetails(**dict(row)) for row in rows]
    
    # ========== Analytics ==========
    
    async def get_low_stock_alerts(self) -> List[LowStockAlert]:
        """Get products below reorder level"""
        query = """
            SELECT 
                i.warehouse_id,
                w.warehouse_name,
                i.product_id,
                p.product_name,
                p.product_code,
                i.quantity as current_quantity,
                p.reorder_level,
                (p.reorder_level - i.quantity) as shortage
            FROM inventory i
            JOIN warehouses w ON i.warehouse_id = w.warehouse_id
            JOIN products p ON i.product_id = p.product_id
            WHERE i.quantity < p.reorder_level
              AND w.is_active = TRUE
              AND p.is_active = TRUE
            ORDER BY shortage DESC, w.warehouse_name, p.product_name
        """
        
        rows = await self.db.fetch_all(query)
        return [LowStockAlert(**dict(row)) for row in rows]