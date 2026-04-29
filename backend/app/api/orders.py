from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.database import db
from app.models.orders import (
    CustomerCreate, CustomerResponse,
    OrderCreate, OrderResponse
)
from app.repositories.order_repositories import OrderRepository

router = APIRouter(prefix="/orders", tags=["Orders & Customers"])

def get_order_repo():
    return OrderRepository(db)

# ========== Customers ==========

@router.post("/customers", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
async def create_customer(customer: CustomerCreate, repo: OrderRepository = Depends(get_order_repo)):
    """Register a new customer"""
    try:
        return await repo.create_customer(customer)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/customers", response_model=List[CustomerResponse])
async def list_customers(limit: int = 100, skip: int = 0, repo: OrderRepository = Depends(get_order_repo)):
    """List all customers"""
    return await repo.get_all_customers(limit=limit, skip=skip)

# ========== Orders ==========

@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(order: OrderCreate, repo: OrderRepository = Depends(get_order_repo)):
    """Create a new order with items"""
    try:
        return await repo.create_order(order)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("", response_model=List[OrderResponse])
async def list_orders(limit: int = 100, skip: int = 0, repo: OrderRepository = Depends(get_order_repo)):
    """List all orders"""
    return await repo.get_all_orders(limit=limit, skip=skip)

@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(order_id: int, repo: OrderRepository = Depends(get_order_repo)):
    """Get order details by ID"""
    order = await repo.get_order(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order
