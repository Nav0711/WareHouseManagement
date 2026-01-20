from fastapi import HTTPException, status


class WTMSException(Exception):
    """Base exception for WTMS"""
    pass


class ResourceNotFoundError(WTMSException):
    """Resource not found in database"""
    def __init__(self, resource: str, identifier: str):
        self.message = f"{resource} with identifier '{identifier}' not found"
        super().__init__(self.message)


class InsufficientStockError(WTMSException):
    """Insufficient inventory for operation"""
    def __init__(self, product_id: int, warehouse_id: int, available: int, required: int):
        self.message = (
            f"Insufficient stock for product {product_id} in warehouse {warehouse_id}. "
            f"Available: {available}, Required: {required}"
        )
        super().__init__(self.message)


class InvalidOperationError(WTMSException):
    """Invalid business operation"""
    def __init__(self, message: str):
        self.message = message
        super().__init__(self.message)


class DatabaseError(WTMSException):
    """Database operation failed"""
    def __init__(self, operation: str, details: str):
        self.message = f"Database {operation} failed: {details}"
        super().__init__(self.message)


def resource_not_found_exception(resource: str, identifier: str):
    """HTTP exception for resource not found"""
    return HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"{resource} with identifier '{identifier}' not found"
    )


def insufficient_stock_exception(product_id: int, warehouse_id: int, available: int, required: int):
    """HTTP exception for insufficient stock"""
    return HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=(
            f"Insufficient stock for product {product_id} in warehouse {warehouse_id}. "
            f"Available: {available}, Required: {required}"
        )
    )


def invalid_operation_exception(message: str):
    """HTTP exception for invalid operations"""
    return HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=message
    )


def database_exception(operation: str, details: str):
    """HTTP exception for database errors"""
    return HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=f"Database {operation} failed: {details}"
    )