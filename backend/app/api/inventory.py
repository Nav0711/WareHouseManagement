from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from app.databse import get_db, Database
from app.repositories.inventory_repositories import InventoryRepository
from app.models.inventory import (
    InventoryWithDetails, InventoryResponse,
    StockMovementInbound, StockMovementOutbound, StockMovementTransfer,
    StockMovementResponse, StockMovementWithDetails, LowStockAlert
)
from app.utils.exceptions import (
    InsufficientStockError,
    insufficient_stock_exception,
    database_exception
)
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/inventory", tags=["Inventory"])


def get_inventory_repo(db: Database = Depends(get_db)) -> InventoryRepository:
    """Dependency for inventory repository"""
    return InventoryRepository(db)


# ========== Inventory Endpoints ==========

@router.get("/", response_model=List[InventoryWithDetails])
async def get_inventory(
    warehouse_id: Optional[int] = Query(None, description="Filter by warehouse"),
    product_id: Optional[int] = Query(None, description="Filter by product"),
    repo: InventoryRepository = Depends(get_inventory_repo)
):
    """Get inventory with optional filters"""
    return await repo.get_inventory(warehouse_id=warehouse_id, product_id=product_id)


@router.get("/{warehouse_id}/{product_id}", response_model=InventoryResponse)
async def get_specific_inventory(
    warehouse_id: int,
    product_id: int,
    repo: InventoryRepository = Depends(get_inventory_repo)
):
    """Get inventory for specific warehouse-product combination"""
    inventory = await repo.get_inventory_by_warehouse_product(warehouse_id, product_id)
    if not inventory:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No inventory found for warehouse {warehouse_id} and product {product_id}"
        )
    return inventory


# ========== Stock Movement Endpoints ==========

@router.post("/movements/inbound", response_model=StockMovementResponse, status_code=status.HTTP_201_CREATED)
async def create_inbound_movement(
    movement: StockMovementInbound,
    repo: InventoryRepository = Depends(get_inventory_repo)
):
    """
    Process inbound stock movement (receiving goods).
    This operation is ACID-compliant and will update inventory atomically.
    """
    try:
        return await repo.process_inbound_movement(movement)
    except Exception as e:
        logger.error(f"Inbound movement failed: {e}")
        raise database_exception("inbound movement", str(e))


@router.post("/movements/outbound", response_model=StockMovementResponse, status_code=status.HTTP_201_CREATED)
async def create_outbound_movement(
    movement: StockMovementOutbound,
    repo: InventoryRepository = Depends(get_inventory_repo)
):
    """
    Process outbound stock movement (shipping goods).
    Validates available stock before processing.
    Transaction will rollback if insufficient stock.
    """
    try:
        return await repo.process_outbound_movement(movement)
    except InsufficientStockError as e:
        raise insufficient_stock_exception(
            movement.product_id,
            movement.from_warehouse_id,
            0,  # Will be calculated in exception
            movement.quantity
        )
    except Exception as e:
        logger.error(f"Outbound movement failed: {e}")
        raise database_exception("outbound movement", str(e))


@router.post("/movements/transfer", response_model=StockMovementResponse, status_code=status.HTTP_201_CREATED)
async def create_transfer_movement(
    movement: StockMovementTransfer,
    repo: InventoryRepository = Depends(get_inventory_repo)
):
    """
    Process inter-warehouse transfer.
    Atomically decreases stock from source and increases in destination.
    Validates available stock at source warehouse.
    """
    try:
        return await repo.process_transfer_movement(movement)
    except InsufficientStockError as e:
        raise insufficient_stock_exception(
            movement.product_id,
            movement.from_warehouse_id,
            0,
            movement.quantity
        )
    except Exception as e:
        logger.error(f"Transfer movement failed: {e}")
        raise database_exception("transfer movement", str(e))


@router.get("/movements", response_model=List[StockMovementWithDetails])
async def get_stock_movements(
    product_id: Optional[int] = Query(None, description="Filter by product"),
    warehouse_id: Optional[int] = Query(None, description="Filter by warehouse"),
    movement_type: Optional[str] = Query(None, description="Filter by movement type"),
    limit: int = Query(100, ge=1, le=500),
    repo: InventoryRepository = Depends(get_inventory_repo)
):
    """Get stock movement history with optional filters"""
    return await repo.get_stock_movements(
        product_id=product_id,
        warehouse_id=warehouse_id,
        movement_type=movement_type,
        limit=limit
    )


# ========== Analytics Endpoints ==========

@router.get("/alerts/low-stock", response_model=List[LowStockAlert])
async def get_low_stock_alerts(
    repo: InventoryRepository = Depends(get_inventory_repo)
):
    """Get products that are below their reorder level"""
    return await repo.get_low_stock_alerts()