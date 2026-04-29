from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime, date

# ============================================
# CUSTOMER MODELS
# ============================================

class CustomerBase(BaseModel):
    customer_name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    is_active: bool = True

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(BaseModel):
    customer_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    is_active: Optional[bool] = None

class CustomerResponse(CustomerBase):
    customer_id: int
    created_at: datetime
    updated_at: datetime

# ============================================
# ORDER ITEM MODELS
# ============================================

class OrderItemBase(BaseModel):
    product_id: int
    quantity: int = Field(gt=0)
    unit_price: float = Field(ge=0)

class OrderItemCreate(OrderItemBase):
    pass

class OrderItemResponse(OrderItemBase):
    order_item_id: int
    order_id: int
    line_total: float
    created_at: datetime

# ============================================
# ORDER MODELS
# ============================================

class OrderBase(BaseModel):
    customer_id: int
    warehouse_id: int
    required_date: Optional[date] = None
    status: str = Field(default="pending")

class OrderCreate(OrderBase):
    order_items: List[OrderItemCreate]

class OrderUpdate(BaseModel):
    required_date: Optional[date] = None
    status: Optional[str] = None

class OrderResponse(OrderBase):
    order_id: int
    order_number: str
    order_date: datetime
    total_amount: float
    created_at: datetime
    updated_at: datetime
    items: Optional[List[OrderItemResponse]] = None
