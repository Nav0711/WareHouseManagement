
from typing import List, Optional
from app.databse import Database
from app.models.warehouse import (
    WarehouseCreate, WarehouseUpdate, WarehouseResponse,
    ZoneCreate, ZoneUpdate, ZoneResponse,
    BinCreate, BinUpdate, BinResponse,
    WarehouseUtilization
)
import logging

logger = logging.getLogger(__name__)


class WarehouseRepository:
    """Repository for warehouse-related database operations using raw SQL"""
    
    def __init__(self, db: Database):
        self.db = db
    
    # ========== Warehouse CRUD ==========
    
    async def create_warehouse(self, warehouse: WarehouseCreate) -> WarehouseResponse:
        """Create a new warehouse"""
        query = """
            INSERT INTO warehouses (
                warehouse_name, location, city, state, country, capacity_cubic_meters
            ) VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING warehouse_id, warehouse_name, location, city, state, country,
                      capacity_cubic_meters, is_active, created_at, updated_at
        """
        
        row = await self.db.fetch_one(
            query,
            warehouse.warehouse_name,
            warehouse.location,
            warehouse.city,
            warehouse.state,
            warehouse.country,
            warehouse.capacity_cubic_meters
        )
        
        return WarehouseResponse(**dict(row))
    
    async def get_warehouse_by_id(self, warehouse_id: int) -> Optional[WarehouseResponse]:
        """Get warehouse by ID"""
        query = """
            SELECT warehouse_id, warehouse_name, location, city, state, country,
                   capacity_cubic_meters, is_active, created_at, updated_at
            FROM warehouses
            WHERE warehouse_id = $1
        """
        
        row = await self.db.fetch_one(query, warehouse_id)
        return WarehouseResponse(**dict(row)) if row else None
    
    async def get_all_warehouses(
        self, 
        is_active: Optional[bool] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[WarehouseResponse]:
        """Get all warehouses with optional filtering"""
        if is_active is not None:
            query = """
                SELECT warehouse_id, warehouse_name, location, city, state, country,
                       capacity_cubic_meters, is_active, created_at, updated_at
                FROM warehouses
                WHERE is_active = $1
                ORDER BY warehouse_id
                LIMIT $2 OFFSET $3
            """
            rows = await self.db.fetch_all(query, is_active, limit, skip)
        else:
            query = """
                SELECT warehouse_id, warehouse_name, location, city, state, country,
                       capacity_cubic_meters, is_active, created_at, updated_at
                FROM warehouses
                ORDER BY warehouse_id
                LIMIT $1 OFFSET $2
            """
            rows = await self.db.fetch_all(query, limit, skip)
        
        return [WarehouseResponse(**dict(row)) for row in rows]
    
    async def update_warehouse(
        self, 
        warehouse_id: int, 
        warehouse: WarehouseUpdate
    ) -> Optional[WarehouseResponse]:
        """Update warehouse details"""
        # Build dynamic update query
        update_fields = []
        values = []
        param_count = 1
        
        for field, value in warehouse.model_dump(exclude_unset=True).items():
            if value is not None:
                update_fields.append(f"{field} = ${param_count}")
                values.append(value)
                param_count += 1
        
        if not update_fields:
            return await self.get_warehouse_by_id(warehouse_id)
        
        values.append(warehouse_id)
        query = f"""
            UPDATE warehouses
            SET {', '.join(update_fields)}
            WHERE warehouse_id = ${param_count}
            RETURNING warehouse_id, warehouse_name, location, city, state, country,
                      capacity_cubic_meters, is_active, created_at, updated_at
        """
        
        row = await self.db.fetch_one(query, *values)
        return WarehouseResponse(**dict(row)) if row else None
    
    async def delete_warehouse(self, warehouse_id: int) -> bool:
        """Soft delete warehouse by marking as inactive"""
        query = """
            UPDATE warehouses
            SET is_active = FALSE
            WHERE warehouse_id = $1
        """
        
        result = await self.db.execute(query, warehouse_id)
        return result == "UPDATE 1"
    
    # ========== Zone CRUD ==========
    
    async def create_zone(self, zone: ZoneCreate) -> ZoneResponse:
        """Create a new zone"""
        query = """
            INSERT INTO zones (warehouse_id, zone_name, zone_type, capacity_cubic_meters)
            VALUES ($1, $2, $3, $4)
            RETURNING zone_id, warehouse_id, zone_name, zone_type, 
                      capacity_cubic_meters, created_at
        """
        
        row = await self.db.fetch_one(
            query,
            zone.warehouse_id,
            zone.zone_name,
            zone.zone_type,
            zone.capacity_cubic_meters
        )
        
        return ZoneResponse(**dict(row))
    
    async def get_zones_by_warehouse(self, warehouse_id: int) -> List[ZoneResponse]:
        """Get all zones for a warehouse"""
        query = """
            SELECT zone_id, warehouse_id, zone_name, zone_type,
                   capacity_cubic_meters, created_at
            FROM zones
            WHERE warehouse_id = $1
            ORDER BY zone_name
        """
        
        rows = await self.db.fetch_all(query, warehouse_id)
        return [ZoneResponse(**dict(row)) for row in rows]
    
    # ========== Bin CRUD ==========
    
    async def create_bin(self, bin_data: BinCreate) -> BinResponse:
        """Create a new bin"""
        query = """
            INSERT INTO bins (zone_id, bin_code, capacity_cubic_meters)
            VALUES ($1, $2, $3)
            RETURNING bin_id, zone_id, bin_code, capacity_cubic_meters,
                      is_occupied, created_at
        """
        
        row = await self.db.fetch_one(
            query,
            bin_data.zone_id,
            bin_data.bin_code,
            bin_data.capacity_cubic_meters
        )
        
        return BinResponse(**dict(row))
    
    async def get_bins_by_zone(self, zone_id: int) -> List[BinResponse]:
        """Get all bins for a zone"""
        query = """
            SELECT bin_id, zone_id, bin_code, capacity_cubic_meters,
                   is_occupied, created_at
            FROM bins
            WHERE zone_id = $1
            ORDER BY bin_code
        """
        
        rows = await self.db.fetch_all(query, zone_id)
        return [BinResponse(**dict(row)) for row in rows]
    
    # ========== Analytics ==========
    
    async def get_warehouse_utilization(self, warehouse_id: int) -> Optional[WarehouseUtilization]:
        """Calculate warehouse capacity utilization"""
        query = """
            WITH inventory_stats AS (
                SELECT 
                    COUNT(DISTINCT i.product_id) as product_count,
                    SUM(i.quantity) as total_quantity,
                    SUM(i.quantity * p.volume_cubic_meters) as used_volume
                FROM inventory i
                JOIN products p ON i.product_id = p.product_id
                WHERE i.warehouse_id = $1
            )
            SELECT 
                w.warehouse_id,
                w.warehouse_name,
                w.capacity_cubic_meters as total_capacity,
                COALESCE(s.used_volume, 0) as used_capacity,
                ROUND(
                    (COALESCE(s.used_volume, 0) / w.capacity_cubic_meters * 100)::numeric, 2
                ) as utilization_percentage,
                COALESCE(s.product_count, 0) as total_products,
                COALESCE(s.total_quantity, 0) as total_quantity
            FROM warehouses w
            LEFT JOIN inventory_stats s ON true
            WHERE w.warehouse_id = $1
        """
        
        row = await self.db.fetch_one(query, warehouse_id)
        return WarehouseUtilization(**dict(row)) if row else None