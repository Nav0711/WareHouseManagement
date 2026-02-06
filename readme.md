# Warehouse & Transportation Management System (WTMS)

![Version](https://img.shields.io/badge/version-1.0-blue.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-316192.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688.svg)
![React](https://img.shields.io/badge/React-18+-61DAFB.svg)

A SQL-first logistics platform designed to manage warehousing operations and transportation workflows using cloud-hosted PostgreSQL. Built with strong DBMS fundamentals, ACID compliance, and real-world enterprise logistics patterns.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Database Design](#database-design)
- [Getting Started](#getting-started)
- [Usage Examples](#usage-examples)
- [Performance](#performance)
- [Project Structure](#project-structure)
- [Development Roadmap](#development-roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

WTMS is a business-oriented logistics platform that emphasizes **SQL-first development** and **strong DBMS fundamentals** rather than ORM abstraction. The system mirrors real-world supply chain operations used by large enterprises and is designed for:

- ✅ Academic projects and portfolio demonstrations
- ✅ Technical interview preparation
- ✅ Learning advanced database concepts
- ✅ Building production-grade logistics systems

### Business Objectives

- Centralize warehouse inventory data
- Track inbound and outbound shipments
- Manage vehicle fleets and transport routes
- Provide operational and analytical business insights

### Technical Objectives

- Apply database normalization (3NF)
- Enforce referential integrity with constraints
- Implement ACID-compliant transactions
- Write and optimize complex SQL queries
- Analyze query performance using `EXPLAIN ANALYZE`

---

## ✨ Key Features

### Warehouse Management
- Multi-warehouse support with zones and bins
- Real-time capacity tracking
- Location-based inventory organization

### Inventory Control
- Product catalog management
- Real-time stock level tracking
- Automatic stock movement logging
- Prevention of negative inventory

### Order Processing
- Customer order management
- Intelligent warehouse assignment
- Multi-item order support
- Order lifecycle tracking

### Transportation & Fleet
- Vehicle and driver registration
- Route management between cities
- Shipment assignment and tracking
- Delivery performance analytics

### Analytics & Reporting
- Warehouse utilization reports
- Inventory aging analysis
- Shipment delivery performance
- Route efficiency metrics
- Order fulfillment rates

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│         React Web Client                │
│  (Dashboards & User Interface)          │
└──────────────┬──────────────────────────┘
               │ HTTP/REST
               ▼
┌─────────────────────────────────────────┐
│         FastAPI Backend                 │
│  (Business Logic & API Layer)           │
│  • Raw SQL Queries                      │
│  • Transaction Management               │
│  • Business Rules Enforcement           │
└──────────────┬──────────────────────────┘
               │ asyncpg/psycopg3
               ▼
┌─────────────────────────────────────────┐
│    Neon PostgreSQL (Cloud Database)     │
│  • ACID Transactions                    │
│  • Constraints & Triggers               │
│  • Indexes & Query Optimization         │
└─────────────────────────────────────────┘
```

---

## 💻 Technology Stack

### Backend
- **FastAPI** - Modern Python web framework
- **asyncpg** / **psycopg3** - PostgreSQL drivers
- **Raw SQL** - Direct database queries (ORM avoided)

### Database
- **PostgreSQL 15+** - Primary database
- **Neon PostgreSQL** - Cloud hosting platform

### Frontend
- **React 18+** - UI framework
- **Dashboard-based interface** - Operational views

### Development Tools
- **pgAdmin** / **DBeaver** - Database management
- **Git** - Version control
- **Docker** (optional) - Containerization

---

## 🗄️ Database Design

### Core Entities

The system follows **Third Normal Form (3NF)** with clear separation of concerns:

#### Master Data
- `warehouses` - Warehouse locations and metadata
- `storage_zones` - Zones within warehouses
- `storage_bins` - Individual storage locations
- `products` - Product catalog
- `customers` - Customer information
- `vehicles` - Fleet vehicles
- `drivers` - Driver information
- `routes` - Transportation routes

#### Transactional Data
- `inventory` - Current stock levels per warehouse
- `stock_movements` - Audit trail of all inventory changes
- `orders` - Customer orders
- `order_items` - Individual items in orders
- `shipments` - Transportation shipments

### Key Design Principles

- ✅ Full referential integrity with foreign keys
- ✅ No redundant or derived data
- ✅ Atomic operations with transactions
- ✅ Temporal data tracking (timestamps)
- ✅ Audit logging for all movements

---

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- Node.js 16+
- PostgreSQL 15+ (or Neon account)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/wtms.git
   cd wtms
   ```

2. **Set up the database**
   ```bash
   # Create database on Neon or local PostgreSQL
   createdb wtms
   
   # Run schema
   psql -d wtms -f database/schema.sql
   
   # Load sample data (optional)
   psql -d wtms -f database/seed_data.sql
   ```

3. **Configure backend**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   
   # Create .env file
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Start backend server**
   ```bash
   uvicorn main:app --reload
   # API available at http://localhost:8000
   ```

5. **Configure frontend**
   ```bash
   cd frontend
   npm install
   
   # Create .env file
   cp .env.example .env
   ```

6. **Start frontend**
   ```bash
   npm start
   # App available at http://localhost:3000
   ```

### Environment Variables

**Backend (.env)**
```env
DATABASE_URL=postgresql://user:password@host:5432/wtms
DATABASE_HOST=your-neon-host.neon.tech
DATABASE_NAME=wtms
DATABASE_USER=your_user
DATABASE_PASSWORD=your_password
DATABASE_PORT=5432
```

**Frontend (.env)**
```env
REACT_APP_API_URL=http://localhost:8000
```

---

## 📝 Usage Examples

### Inventory Query
```sql
-- Check available inventory in a warehouse
SELECT 
    p.product_name,
    i.quantity,
    i.last_updated
FROM inventory i
JOIN products p ON i.product_id = p.product_id
WHERE i.warehouse_id = 1
  AND i.quantity > 0
ORDER BY p.product_name;
```

### Transaction-Safe Order Fulfillment
```sql
-- Fulfill an order with inventory deduction
BEGIN;

-- Check inventory availability
SELECT quantity 
FROM inventory
WHERE warehouse_id = 1 
  AND product_id = 101
  AND quantity >= 50
FOR UPDATE;

-- Deduct inventory
UPDATE inventory
SET quantity = quantity - 50,
    last_updated = CURRENT_TIMESTAMP
WHERE warehouse_id = 1
  AND product_id = 101;

-- Log the movement
INSERT INTO stock_movements (
    product_id, 
    warehouse_id, 
    movement_type, 
    quantity, 
    reference_id
)
VALUES (101, 1, 'OUTBOUND', -50, 'ORDER-2024-001');

COMMIT;
```

### Delivery Performance Analytics
```sql
-- Calculate average delivery time by route
SELECT 
    r.route_name,
    COUNT(s.shipment_id) as total_shipments,
    AVG(s.arrival_time - s.departure_time) as avg_delivery_time,
    MIN(s.arrival_time - s.departure_time) as best_time,
    MAX(s.arrival_time - s.departure_time) as worst_time
FROM shipments s
JOIN routes r ON s.route_id = r.route_id
WHERE s.status = 'DELIVERED'
  AND s.arrival_time IS NOT NULL
GROUP BY r.route_id, r.route_name
ORDER BY avg_delivery_time;
```

---

## ⚡ Performance

### Query Optimization

All critical queries are optimized using:
- Strategic indexing on foreign keys and filter columns
- Query analysis with `EXPLAIN ANALYZE`
- Partitioning for large tables (optional)

**Target Performance:**
- Inventory queries: < 200ms
- Order processing: < 500ms
- Analytics queries: < 2s

### Example Index Strategy
```sql
-- Composite index for inventory lookups
CREATE INDEX idx_inventory_warehouse_product 
ON inventory(warehouse_id, product_id);

-- Index for shipment tracking
CREATE INDEX idx_shipments_status_route 
ON shipments(status, route_id);

-- Index for order date filtering
CREATE INDEX idx_orders_date 
ON orders(order_date DESC);
```

---

## 📁 Project Structure

```
wtms/
├── README.md
├── PRD.md
├── database/
│   ├── schema.sql              # DDL statements
│   ├── seed_data.sql           # Sample data
│   ├── queries.sql             # Common queries
│   ├── indexing.sql            # Index definitions
│   ├── triggers.sql            # Database triggers
│   └── explain_analyze.md      # Query performance analysis
├── backend/
│   ├── main.py                 # FastAPI application
│   ├── requirements.txt
│   ├── config.py               # Configuration
│   ├── database.py             # Database connection
│   ├── routers/
│   │   ├── warehouses.py
│   │   ├── inventory.py
│   │   ├── orders.py
│   │   └── shipments.py
│   ├── models/                 # Pydantic models
│   └── services/               # Business logic
├── frontend/
│   ├── package.json
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/           # API calls
│       └── utils/
├── docs/
│   ├── ER_Diagram.png
│   ├── API_Documentation.md
│   └── User_Guide.md
└── tests/
    ├── test_inventory.py
    ├── test_orders.py
    └── test_shipments.py
```

---

## 🗺️ Development Roadmap

### Phase 1 (Current)
- ✅ Core database schema
- ✅ Warehouse and inventory management
- ✅ Order processing
- ✅ Transportation tracking
- ✅ Basic analytics

### Phase 2 (Planned)
- ⬜ Multi-tenant organization support
- ⬜ Advanced analytics dashboard
- ⬜ Batch processing capabilities
- ⬜ API rate limiting

### Phase 3 (Future)
- ⬜ Real-time GPS tracking integration
- ⬜ Route optimization algorithms
- ⬜ Demand forecasting with ML
- ⬜ External ERP integrations
- ⬜ OLAP-style data warehouse

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow SQL best practices (uppercase keywords, meaningful names)
- Write transaction-safe code
- Add indexes for new query patterns
- Document complex queries
- Include unit tests for business logic

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Navdeep Singh**

- GitHub: [@navdeepsingh](https://github.com/navdeepsingh)
- LinkedIn: [navdeepsingh](https://linkedin.com/in/navdeepsingh)

---

## 🙏 Acknowledgments

- Inspired by real-world enterprise logistics systems
- Built as a learning project focusing on DBMS fundamentals
- Designed for academic and portfolio demonstration purposes

---

## 📧 Support

For questions or support, please:
- Open an issue on GitHub
- Contact: navdeep@example.com

---

**⭐ If you find this project helpful, please consider giving it a star!**