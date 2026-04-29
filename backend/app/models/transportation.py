from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime, date

# ============================================
# VEHICLE MODELS
# ============================================

class VehicleBase(BaseModel):
    vehicle_number: str
    vehicle_type: str
    capacity_kg: float = Field(gt=0)
    capacity_cubic_meters: float = Field(gt=0)
    last_maintenance_date: Optional[date] = None
    is_active: bool = True

class VehicleCreate(VehicleBase):
    pass

class VehicleUpdate(BaseModel):
    vehicle_number: Optional[str] = None
    vehicle_type: Optional[str] = None
    capacity_kg: Optional[float] = Field(None, gt=0)
    capacity_cubic_meters: Optional[float] = Field(None, gt=0)
    last_maintenance_date: Optional[date] = None
    is_active: Optional[bool] = None

class VehicleResponse(VehicleBase):
    vehicle_id: int
    created_at: datetime
    updated_at: datetime

# ============================================
# DRIVER MODELS
# ============================================

class DriverBase(BaseModel):
    driver_name: str
    license_number: str
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    hired_date: date
    is_active: bool = True

class DriverCreate(DriverBase):
    pass

class DriverUpdate(BaseModel):
    driver_name: Optional[str] = None
    license_number: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    hired_date: Optional[date] = None
    is_active: Optional[bool] = None

class DriverResponse(DriverBase):
    driver_id: int
    created_at: datetime
    updated_at: datetime

# ============================================
# ROUTE MODELS
# ============================================

class RouteBase(BaseModel):
    origin_city: str
    destination_city: str
    distance_km: float = Field(gt=0)
    estimated_hours: float = Field(gt=0)

class RouteCreate(RouteBase):
    pass

class RouteUpdate(BaseModel):
    origin_city: Optional[str] = None
    destination_city: Optional[str] = None
    distance_km: Optional[float] = Field(None, gt=0)
    estimated_hours: Optional[float] = Field(None, gt=0)

class RouteResponse(RouteBase):
    route_id: int
    created_at: datetime

# ============================================
# SHIPMENT MODELS
# ============================================

class ShipmentBase(BaseModel):
    order_id: int
    vehicle_id: int
    driver_id: int
    route_id: int
    status: str = Field(default="planned")
    scheduled_departure: Optional[datetime] = None
    scheduled_arrival: Optional[datetime] = None
    actual_departure: Optional[datetime] = None
    actual_arrival: Optional[datetime] = None
    notes: Optional[str] = None

class ShipmentCreate(ShipmentBase):
    pass

class ShipmentUpdate(BaseModel):
    vehicle_id: Optional[int] = None
    driver_id: Optional[int] = None
    route_id: Optional[int] = None
    status: Optional[str] = None
    scheduled_departure: Optional[datetime] = None
    scheduled_arrival: Optional[datetime] = None
    actual_departure: Optional[datetime] = None
    actual_arrival: Optional[datetime] = None
    notes: Optional[str] = None

class ShipmentResponse(ShipmentBase):
    shipment_id: int
    shipment_number: str
    created_at: datetime
    updated_at: datetime
