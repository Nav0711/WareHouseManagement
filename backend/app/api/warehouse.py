from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from app.databse import get_db, Database
from app.repositories.warehouse_repositories import WarehouseRepository
from app.models.warehouse import (
    WarehouseCreate, WarehouseUpdate, WarehouseResponse,
    ZoneCreate, ZoneResponse, BinCreate, BinResponse,
    WarehouseUtilization
)
from app.utils.exceptions import resource_not_found_exception

router = APIRouter(prefix="/warehouses", tags=["Warehouses"])


def get_warehouse_repo(db: Database = Depends(get_db)) -> WarehouseRepository:
    """Dependency for warehouse repository"""
    return WarehouseRepository(db)


# ========== Warehouse Endpoints ==========

@router.post("/", response_model=WarehouseResponse, status_code=status.HTTP_201_CREATED)
async def create_warehouse(
    warehouse: WarehouseCreate,
    repo: WarehouseRepository = Depends(get_warehouse_repo)
):
    """Create a new warehouse"""
    return await repo.create_warehouse(warehouse)


@router.get("/", response_model=List[WarehouseResponse])
async def get_warehouses(
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    repo: WarehouseRepository = Depends(get_warehouse_repo)
):
    """Get all warehouses with optional filtering"""
    return await repo.get_all_warehouses(is_active=is_active, skip=skip, limit=limit)


@router.get("/{warehouse_id}", response_model=WarehouseResponse)
async def get_warehouse(
    warehouse_id: int,
    repo: WarehouseRepository = Depends(get_warehouse_repo)
):
    """Get warehouse by ID"""
    warehouse = await repo.get_warehouse_by_id(warehouse_id)
    if not warehouse:
        raise resource_not_found_exception("Warehouse", str(warehouse_id))
    return warehouse


@router.put("/{warehouse_id}", response_model=WarehouseResponse)
async def update_warehouse(
    warehouse_id: int,
    warehouse: WarehouseUpdate,
    repo: WarehouseRepository = Depends(get_warehouse_repo)
):
    """Update warehouse details"""
    updated = await repo.update_warehouse(warehouse_id, warehouse)
    if not updated:
        raise resource_not_found_exception("Warehouse", str(warehouse_id))
    return updated


@router.delete("/{warehouse_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_warehouse(
    warehouse_id: int,
    repo: WarehouseRepository = Depends(get_warehouse_repo)
):
    """Soft delete warehouse (mark as inactive)"""
    deleted = await repo.delete_warehouse(warehouse_id)
    if not deleted:
        raise resource_not_found_exception("Warehouse", str(warehouse_id))


@router.get("/{warehouse_id}/utilization", response_model=WarehouseUtilization)
async def get_warehouse_utilization(
    warehouse_id: int,
    repo: WarehouseRepository = Depends(get_warehouse_repo)
):
    """Get warehouse capacity utilization metrics"""
    utilization = await repo.get_warehouse_utilization(warehouse_id)
    if not utilization:
        raise resource_not_found_exception("Warehouse", str(warehouse_id))
    return utilization


# ========== Zone Endpoints ==========

@router.post("/{warehouse_id}/zones", response_model=ZoneResponse, status_code=status.HTTP_201_CREATED)
async def create_zone(
    warehouse_id: int,
    zone: ZoneCreate,
    repo: WarehouseRepository = Depends(get_warehouse_repo)
):
    """Create a new zone within a warehouse"""
    # Verify warehouse exists
    warehouse = await repo.get_warehouse_by_id(warehouse_id)
    if not warehouse:
        raise resource_not_found_exception("Warehouse", str(warehouse_id))
    
    zone.warehouse_id = warehouse_id
    return await repo.create_zone(zone)


@router.get("/{warehouse_id}/zones", response_model=List[ZoneResponse])
async def get_warehouse_zones(
    warehouse_id: int,
    repo: WarehouseRepository = Depends(get_warehouse_repo)
):
    """Get all zones for a warehouse"""
    return await repo.get_zones_by_warehouse(warehouse_id)


# ========== Bin Endpoints ==========

@router.post("/zones/{zone_id}/bins", response_model=BinResponse, status_code=status.HTTP_201_CREATED)
async def create_bin(
    zone_id: int,
    bin_data: BinCreate,
    repo: WarehouseRepository = Depends(get_warehouse_repo)
):
    """Create a new bin within a zone"""
    bin_data.zone_id = zone_id
    return await repo.create_bin(bin_data)


@router.get("/zones/{zone_id}/bins", response_model=List[BinResponse])
async def get_zone_bins(
    zone_id: int,
    repo: WarehouseRepository = Depends(get_warehouse_repo)
):
    """Get all bins for a zone"""
    return await repo.get_bins_by_zone(zone_id)