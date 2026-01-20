# Warehouse & Transportation Management System (WTMS)

A SQL-first logistics management system built with FastAPI and PostgreSQL, emphasizing Database Management System (DBMS) fundamentals.

## 🎯 Project Overview

WTMS is designed to demonstrate:
- Database normalization (3NF)
- ACID-compliant transactions
- Complex SQL queries
- Query optimization and indexing
- PostgreSQL-specific features
- Clean architecture with repository pattern

## 🏗️ Architecture

```
┌─────────────────┐
│  React Frontend │
└────────┬────────┘
         │ REST API
┌────────▼────────┐
│  FastAPI Backend│
│  (Raw SQL)      │
└────────┬────────┘
         │
┌────────▼────────┐
│  PostgreSQL     │
│  (Neon Cloud)   │
└─────────────────┘
```

## 🚀 Features

### Warehouse Management
- Multi-warehouse inventory tracking
- Storage zones and bins
- Capacity utilization analytics

### Inventory Operations
- ACID-compliant stock movements
- Inbound/Outbound/Transfer operations
- Low stock alerts
- Movement audit trail

### Order Processing
- Customer order management
- Multi-item orders
- Warehouse assignment
- Order fulfillment tracking

### Transportation
- Fleet management (vehicles & drivers)
- Route planning
- Shipment tracking
- Delivery performance analytics

## 📋 Prerequisites

- Python 3.11+
- PostgreSQL 15+ (Neon Cloud account)
- Git

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/wtms-backend.git
cd wtms-backend
```

### 2. Create Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment

```bash
cp .env.example .env
# Edit .env with your Neon PostgreSQL credentials
```

### 5. Setup Database

**Create Database on Neon:**
1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string

**Initialize Schema:**

```bash
# Connect to your Neon database using psql or their SQL Editor
psql <your-neon-connection-string>

# Run the schema
\i sql/schema.sql

# Load sample data (optional)
\i sql/sample_data.sql
```

### 6. Run the Application

```bash
uvicorn app.main:app --reload
```

API will be available at `http://localhost:8000`

## 📚 API Documentation

Once running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 🔍 Key Endpoints

### Warehouses
- `POST /api/v1/warehouses` - Create warehouse
- `GET /api/v1/warehouses` - List warehouses
- `GET /api/v1/warehouses/{id}` - Get warehouse
- `PUT /api/v1/warehouses/{id}` - Update warehouse
- `GET /api/v1/warehouses/{id}/utilization` - Capacity metrics

### Inventory
- `GET /api/v1/inventory` - List inventory
- `POST /api/v1/inventory/movements/inbound` - Receive goods
- `POST /api/v1/inventory/movements/outbound` - Ship goods
- `POST /api/v1/inventory/movements/transfer` - Transfer stock
- `GET /api/v1/inventory/alerts/low-stock` - Low stock alerts

## 🎓 Learning Objectives Demonstrated

### 1. Database Design
- ✅ Third Normal Form (3NF)
- ✅ Referential integrity with foreign keys
- ✅ Check constraints for business rules
- ✅ Composite primary keys
- ✅ Proper indexing strategy

### 2. SQL Proficiency
- ✅ Complex JOIN queries
- ✅ Aggregate functions (SUM, COUNT, AVG)
- ✅ Subqueries and CTEs
- ✅ Window functions
- ✅ Transaction management

### 3. ACID Compliance
- ✅ Atomic operations
- ✅ Consistency through constraints
- ✅ Isolation levels
- ✅ Durability guarantees

### 4. Query Optimization
- ✅ Strategic indexing
- ✅ EXPLAIN ANALYZE usage
- ✅ Query plan analysis
- ✅ Performance tuning

## 🧪 Testing

```bash
# Run tests
pytest

# With coverage
pytest --cov=app tests/
```

## 📊 Sample Queries

### Get Warehouse Utilization
```sql
SELECT 
    w.warehouse_name,
    w.capacity_cubic_meters,
    SUM(i.quantity * p.volume_cubic_meters) as used_capacity
FROM warehouses w
LEFT JOIN inventory i ON w.warehouse_id = i.warehouse_id
LEFT JOIN products p ON i.product_id = p.product_id
GROUP BY w.warehouse_id, w.warehouse_name, w.capacity_cubic_meters;
```

### Low Stock Alert
```sql
SELECT 
    p.product_name,
    i.quantity,
    p.reorder_level,
    w.warehouse_name
FROM inventory i
JOIN products p ON i.product_id = p.product_id
JOIN warehouses w ON i.warehouse_id = w.warehouse_id
WHERE i.quantity < p.reorder_level
ORDER BY (p.reorder_level - i.quantity) DESC;
```

## 🏗️ Project Structure

```
wtms-backend/
├── app/
│   ├── api/              # API routes
│   ├── models/           # Pydantic models
│   ├── repositories/     # Data access layer (Raw SQL)
│   ├── services/         # Business logic
│   ├── utils/            # Utilities
│   ├── config.py         # Configuration
│   ├── database.py       # DB connection pool
│   └── main.py           # FastAPI app
├── sql/
│   ├── schema.sql        # Database DDL
│   ├── sample_data.sql   # Test data
│   └── queries.sql       # Common queries
├── tests/                # Test suite
├── requirements.txt      # Dependencies
└── README.md            # This file
```

## 🎯 Best Practices Implemented

1. **Repository Pattern**: Clean separation of data access
2. **Dependency Injection**: FastAPI's DI system
3. **Connection Pooling**: Efficient database connections
4. **Error Handling**: Custom exceptions and HTTP responses
5. **Type Safety**: Pydantic models for validation
6. **Logging**: Structured application logging
7. **CORS**: Proper cross-origin configuration

## 🔐 Security Considerations

- Use environment variables for secrets
- Implement API authentication (JWT recommended)
- Enable SSL for database connections
- Input validation via Pydantic
- SQL injection prevention (parameterized queries)

## 📈 Performance Tips

1. Use connection pooling (configured in `database.py`)
2. Add indexes on frequently queried columns
3. Use `EXPLAIN ANALYZE` for query optimization
4. Implement pagination for large result sets
5. Consider read replicas for analytics

## 🤝 Contributing

This is a learning project. Feel free to:
- Add new features
- Improve queries
- Optimize performance
- Add tests

## 📝 License

MIT License - feel free to use for learning and portfolio purposes.

## 🙏 Acknowledgments

- Built with FastAPI
- Database: PostgreSQL (Neon)
- Designed for DBMS learning and interview preparation

## 📧 Contact

For questions or feedback: [your-email@example.com]

---

**Happy Learning! 🎓**