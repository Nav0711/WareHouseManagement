from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime


# ========== Inventory Models ==========

class InventoryBase(BaseModel):
    """Base inventory schema"""
    warehouse_id: int = Field(..., gt=0)
    product_id: int = Field(..., gt=0)
    quantity: int = Field(..., ge=0)


class InventoryCreate(InventoryBase):
    """Schema for creating inventory"""
    pass


class InventoryUpdate(BaseModel):
    """Schema for updating inventory"""
    quantity: Optional[int] = Field(None, ge=0)
    reserved_quantity: Optional[int] = Field(None, ge=0)


class InventoryResponse(InventoryBase):
    """Schema for inventory response"""
    reserved_quantity: int
    available_quantity: int
    last_updated: datetime
    
    class Config:
        from_attributes = True


class InventoryWithDetails(BaseModel):
    """Inventory with warehouse and product details"""
    warehouse_id: int
    warehouse_name: str
    product_id: int
    product_name: str
    product_code: str
    quantity: int
    reserved_quantity: int
    available_quantity: int
    last_updated: datetime


# ========== Stock Movement Models ==========

class StockMovementBase(BaseModel):
    """Base stock movement schema"""
    product_id: int = Field(..., gt=0)
    quantity: int = Field(..., gt=0)
    movement_type: str = Field(..., pattern="^(inbound|outbound|transfer|adjustment)$")
    reference_number: Optional[str] = Field(None, max_length=100)
    notes: Optional[str] = None
    created_by: Optional[str] = Field(None, max_length=100)


class StockMovementInbound(StockMovementBase):
    """Schema for inbound stock movement"""
    to_warehouse_id: int = Field(..., gt=0)
    movement_type: str = Field(default="inbound", pattern="^inbound$")


class StockMovementOutbound(StockMovementBase):
    """Schema for outbound stock movement"""
    from_warehouse_id: int = Field(..., gt=0)
    movement_type: str = Field(default="outbound", pattern="^outbound$")


class StockMovementTransfer(StockMovementBase):
    """Schema for transfer stock movement"""
    from_warehouse_id: int = Field(..., gt=0)
    to_warehouse_id: int = Field(..., gt=0)
    movement_type: str = Field(default="transfer", pattern="^transfer$")
    
    @field_validator('to_warehouse_id')
    def validate_different_warehouses(cls, v, info):
        if 'from_warehouse_id' in info.data and v == info.data['from_warehouse_id']:
            raise ValueError('Transfer must be between different warehouses')
        return v


class StockMovementAdjustment(StockMovementBase):
    """Schema for inventory adjustment"""
    warehouse_id: int = Field(..., gt=0)
    adjustment_quantity: int  # Can be negative
    movement_type: str = Field(default="adjustment", pattern="^adjustment$")


class StockMovementResponse(BaseModel):
    """Schema for stock movement response"""
    movement_id: int
    product_id: int
    from_warehouse_id: Optional[int]
    to_warehouse_id: Optional[int]
    quantity: int
    movement_type: str
    reference_number: Optional[str]
    notes: Optional[str]
    movement_date: datetime
    created_by: Optional[str]
    
    class Config:
        from_attributes = True


class StockMovementWithDetails(BaseModel):
    """Stock movement with product and warehouse details"""
    movement_id: int
    product_name: str
    product_code: str
    from_warehouse_name: Optional[str]
    to_warehouse_name: Optional[str]
    quantity: int
    movement_type: str
    reference_number: Optional[str]
    movement_date: datetime
    created_by: Optional[str]


# ========== Low Stock Alert ==========

class LowStockAlert(BaseModel):
    """Low stock alert schema"""
    warehouse_id: int
    warehouse_name: str
    product_id: int
    product_name: str
    product_code: str
    current_quantity: int
    reorder_level: int
    shortage: int