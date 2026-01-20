from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime
from decimal import Decimal


# ========== Warehouse Models ==========

class WarehouseBase(BaseModel):
    """Base warehouse schema"""
    warehouse_name: str = Field(..., min_length=1, max_length=100)
    location: str = Field(..., min_length=1, max_length=200)
    city: str = Field(..., min_length=1, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    country: str = Field(..., min_length=1, max_length=100)
    capacity_cubic_meters: Decimal = Field(..., gt=0)


class WarehouseCreate(WarehouseBase):
    """Schema for creating a warehouse"""
    pass


class WarehouseUpdate(BaseModel):
    """Schema for updating a warehouse"""
    warehouse_name: Optional[str] = Field(None, min_length=1, max_length=100)
    location: Optional[str] = Field(None, min_length=1, max_length=200)
    city: Optional[str] = Field(None, min_length=1, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    country: Optional[str] = Field(None, min_length=1, max_length=100)
    capacity_cubic_meters: Optional[Decimal] = Field(None, gt=0)
    is_active: Optional[bool] = None


class WarehouseResponse(WarehouseBase):
    """Schema for warehouse response"""
    warehouse_id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# ========== Zone Models ==========

class ZoneBase(BaseModel):
    """Base zone schema"""
    zone_name: str = Field(..., min_length=1, max_length=50)
    zone_type: str = Field(..., pattern="^(cold_storage|dry_storage|hazardous|general)$")
    capacity_cubic_meters: Decimal = Field(..., gt=0)


class ZoneCreate(ZoneBase):
    """Schema for creating a zone"""
    warehouse_id: int = Field(..., gt=0)


class ZoneUpdate(BaseModel):
    """Schema for updating a zone"""
    zone_name: Optional[str] = Field(None, min_length=1, max_length=50)
    zone_type: Optional[str] = Field(None, pattern="^(cold_storage|dry_storage|hazardous|general)$")
    capacity_cubic_meters: Optional[Decimal] = Field(None, gt=0)


class ZoneResponse(ZoneBase):
    """Schema for zone response"""
    zone_id: int
    warehouse_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


# ========== Bin Models ==========

class BinBase(BaseModel):
    """Base bin schema"""
    bin_code: str = Field(..., min_length=1, max_length=20)
    capacity_cubic_meters: Decimal = Field(..., gt=0)


class BinCreate(BinBase):
    """Schema for creating a bin"""
    zone_id: int = Field(..., gt=0)


class BinUpdate(BaseModel):
    """Schema for updating a bin"""
    bin_code: Optional[str] = Field(None, min_length=1, max_length=20)
    capacity_cubic_meters: Optional[Decimal] = Field(None, gt=0)
    is_occupied: Optional[bool] = None


class BinResponse(BinBase):
    """Schema for bin response"""
    bin_id: int
    zone_id: int
    is_occupied: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


# ========== Warehouse Utilization ==========

class WarehouseUtilization(BaseModel):
    """Warehouse capacity utilization report"""
    warehouse_id: int
    warehouse_name: str
    total_capacity: Decimal
    used_capacity: Decimal
    utilization_percentage: float
    total_products: int
    total_quantity: int