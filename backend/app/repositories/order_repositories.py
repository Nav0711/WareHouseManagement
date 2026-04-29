from typing import List, Optional
from app.database import Database
from app.models.orders import (
    CustomerCreate, CustomerUpdate, CustomerResponse,
    OrderCreate, OrderUpdate, OrderResponse,
    OrderItemCreate, OrderItemResponse
)
import logging

logger = logging.getLogger(__name__)

class OrderRepository:
    """Repository for order-related database operations using raw SQL"""
    
    def __init__(self, db: Database):
        self.db = db
        
    # ========== Customer CRUD ==========
    
    async def create_customer(self, customer: CustomerCreate) -> CustomerResponse:
        query = """
            INSERT INTO customers (
                customer_name, email, phone, address, city, state, country, is_active
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING customer_id, customer_name, email, phone, address, city, state, country, is_active, created_at, updated_at
        """
        row = await self.db.fetch_one(
            query,
            customer.customer_name, customer.email, customer.phone, customer.address,
            customer.city, customer.state, customer.country, customer.is_active
        )
        return CustomerResponse(**dict(row))

    async def get_customer(self, customer_id: int) -> Optional[CustomerResponse]:
        query = """
            SELECT customer_id, customer_name, email, phone, address, city, state, country, is_active, created_at, updated_at
            FROM customers WHERE customer_id = $1
        """
        row = await self.db.fetch_one(query, customer_id)
        return CustomerResponse(**dict(row)) if row else None

    async def get_all_customers(self, limit: int = 100, skip: int = 0) -> List[CustomerResponse]:
        query = """
            SELECT customer_id, customer_name, email, phone, address, city, state, country, is_active, created_at, updated_at
            FROM customers ORDER BY customer_id LIMIT $1 OFFSET $2
        """
        rows = await self.db.fetch_all(query, limit, skip)
        return [CustomerResponse(**dict(row)) for row in rows]

    # ========== Order CRUD ==========

    async def create_order(self, order: OrderCreate) -> OrderResponse:
        # Generate an order_number (e.g., ORD-timestamp)
        import time
        order_number = f"ORD-{int(time.time())}"
        
        # Calculate total amount
        total_amount = sum(item.quantity * item.unit_price for item in order.order_items)
        
        query_order = """
            INSERT INTO orders (
                customer_id, warehouse_id, order_number, required_date, status, total_amount
            ) VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING order_id, customer_id, warehouse_id, order_number, order_date, required_date, status, total_amount, created_at, updated_at
        """
        
        # NOTE: Ideally this should be a transaction.
        row = await self.db.fetch_one(
            query_order,
            order.customer_id, order.warehouse_id, order_number, order.required_date, order.status, total_amount
        )
        order_response = dict(row)
        order_response['items'] = []
        
        query_item = """
            INSERT INTO order_items (
                order_id, product_id, quantity, unit_price
            ) VALUES ($1, $2, $3, $4)
            RETURNING order_item_id, order_id, product_id, quantity, unit_price, line_total, created_at
        """
        for item in order.order_items:
            item_row = await self.db.fetch_one(
                query_item,
                order_response['order_id'], item.product_id, item.quantity, item.unit_price
            )
            order_response['items'].append(OrderItemResponse(**dict(item_row)))
            
        return OrderResponse(**order_response)

    async def get_order(self, order_id: int) -> Optional[OrderResponse]:
        query = """
            SELECT order_id, customer_id, warehouse_id, order_number, order_date, required_date, status, total_amount, created_at, updated_at
            FROM orders WHERE order_id = $1
        """
        row = await self.db.fetch_one(query, order_id)
        if not row:
            return None
            
        order_dict = dict(row)
        
        query_items = """
            SELECT order_item_id, order_id, product_id, quantity, unit_price, line_total, created_at
            FROM order_items WHERE order_id = $1
        """
        items_rows = await self.db.fetch_all(query_items, order_id)
        order_dict['items'] = [OrderItemResponse(**dict(item_row)) for item_row in items_rows]
        
        return OrderResponse(**order_dict)

    async def get_all_orders(self, limit: int = 100, skip: int = 0) -> List[OrderResponse]:
        query = """
            SELECT order_id, customer_id, warehouse_id, order_number, order_date, required_date, status, total_amount, created_at, updated_at
            FROM orders ORDER BY order_id DESC LIMIT $1 OFFSET $2
        """
        rows = await self.db.fetch_all(query, limit, skip)
        return [OrderResponse(**dict(row)) for row in rows]
