# Product Requirements Document (PRD)

## Warehouse & Transportation Management System (WTMS)

---

## 1. Document Control

| Item             | Details                                             |
| ---------------- | --------------------------------------------------- |
| Product Name     | Warehouse & Transportation Management System (WTMS) |
| Version          | 1.0                                                 |
| Author           | Navdeep Singh                                       |
| Tech Stack       | PostgreSQL (Cloud), FastAPI, React                  |
| Database Hosting | Neon PostgreSQL                                     |
| Primary Focus    | DBMS design, SQL queries, transactional integrity   |

---

## 2. Purpose & Vision

The Warehouse & Transportation Management System (WTMS) is a business-oriented logistics platform designed to manage warehousing operations and transportation workflows using a cloud-hosted PostgreSQL database.

The system is intentionally **SQL-first**, emphasizing strong Database Management System (DBMS) fundamentals rather than abstracted ORM-based logic. WTMS mirrors real-world logistics and supply-chain systems used by large enterprises and is suitable for academic, portfolio, and interview evaluation.

---

## 3. Objectives

### 3.1 Business Objectives

* Centralize warehouse inventory data
* Track inbound and outbound shipments
* Manage vehicle fleets and transport routes
* Provide operational and analytical business insights

### 3.2 Technical Objectives

* Apply database normalization up to 3NF
* Enforce referential integrity using constraints
* Implement ACID-compliant transactions
* Write and optimize complex SQL queries
* Analyze query performance using `EXPLAIN ANALYZE`

---

## 4. Scope Definition

### 4.1 In-Scope

* Warehouse management
* Inventory tracking
* Order processing
* Transportation and fleet management
* Shipment tracking
* Business analytics and reporting
* Cloud-hosted PostgreSQL database

### 4.2 Out-of-Scope (Phase 1)

* Real-time GPS tracking
* Payment processing
* Machine learning-based demand forecasting
* External ERP integrations

---

## 5. Stakeholders & User Roles

### 5.1 User Roles

| Role               | Description                                  |
| ------------------ | -------------------------------------------- |
| System Admin       | Manages system configuration and master data |
| Warehouse Manager  | Oversees inventory and warehouse operations  |
| Logistics Operator | Manages shipments, routes, and vehicles      |
| Business Analyst   | Accesses reports and performance dashboards  |

---

## 6. Functional Requirements

### 6.1 Warehouse Management

**Description:**
Manage warehouses, storage zones, and bin capacities.

**Requirements:**

* Create, update, and deactivate warehouses
* Define storage zones and bins within warehouses
* Track warehouse capacity utilization

**DBMS Focus:**

* Foreign key constraints
* Aggregation queries

---

### 6.2 Product & Inventory Management

**Description:**
Maintain product catalog and track inventory per warehouse.

**Requirements:**

* Create and update products
* Maintain inventory levels per warehouse
* Prevent negative stock levels

**DBMS Focus:**

* Composite primary keys
* Triggers for data integrity
* Transaction-safe updates

---

### 6.3 Stock Movement Tracking

**Description:**
Log all inventory movements including inbound, outbound, and inter-warehouse transfers.

**Requirements:**

* Record source and destination of stock movement
* Maintain movement timestamps
* Ensure atomic operations

**DBMS Focus:**

* ACID transactions
* Temporal data modeling
* Audit logging

---

### 6.4 Order Management

**Description:**
Handle customer orders fulfilled from warehouses.

**Requirements:**

* Create and manage customer orders
* Assign warehouses for fulfillment
* Update order lifecycle statuses

**DBMS Focus:**

* Multi-table joins
* Subqueries for warehouse selection
* Transaction-safe fulfillment

---

### 6.5 Transportation & Fleet Management

**Description:**
Manage vehicles, drivers, transport routes, and shipments.

**Requirements:**

* Register vehicles and drivers
* Define routes between cities
* Assign shipments to vehicles and routes

**DBMS Focus:**

* Referential integrity
* Indexing strategies

---

### 6.6 Shipment Tracking

**Description:**
Track shipment execution and delivery performance.

**Requirements:**

* Track shipment status (planned, in-transit, delivered)
* Record departure and arrival timestamps

**DBMS Focus:**

* Date and time arithmetic
* Aggregation queries

---

## 7. Non-Functional Requirements

| Category    | Requirement                               |
| ----------- | ----------------------------------------- |
| Performance | Inventory queries under 200 ms            |
| Consistency | Strict ACID compliance                    |
| Scalability | Supports multi-warehouse expansion        |
| Security    | Role-based access control                 |
| Reliability | Automatic rollback on transaction failure |

---

## 8. Data Model Overview

### 8.1 Core Entities

* Warehouses
* Storage Zones and Bins
* Products
* Inventory
* Stock Movements
* Orders and Order Items
* Customers
* Vehicles and Drivers
* Routes and Shipments

### 8.2 Normalization

* All tables follow Third Normal Form (3NF)
* No redundant or derived data stored
* Clear separation of transactional and master data

---

## 9. Key SQL Use Cases

### Inventory Availability

```sql
SELECT product_id, quantity
FROM inventory
WHERE warehouse_id = :warehouse_id;
```

### Transaction-Safe Order Fulfillment

```sql
BEGIN;
UPDATE inventory
SET quantity = quantity - :qty
WHERE warehouse_id = :wid
AND product_id = :pid
AND quantity >= :qty;
COMMIT;
```

### Logistics Analytics

```sql
SELECT route_id,
       AVG(arrival_time - departure_time) AS avg_delivery_time
FROM shipments
GROUP BY route_id;
```

---

## 10. Reporting & Analytics

* Warehouse utilization reports
* Inventory aging analysis
* Shipment delivery performance
* Route efficiency metrics
* Order fulfillment rates

---

## 11. Technology Stack

### Backend

* FastAPI
* asyncpg / psycopg3
* Raw SQL (ORM avoided initially)

### Database

* PostgreSQL 15+
* Hosted on Neon PostgreSQL

### Frontend

* React
* Dashboard-based user interface

---

## 12. Deployment Architecture

```
React (Web Client)
      |
FastAPI (API Layer)
      |
Neon PostgreSQL (Cloud Database)
```

---

## 13. Risks & Mitigation

| Risk                     | Mitigation                      |
| ------------------------ | ------------------------------- |
| Data inconsistency       | Strict constraints and triggers |
| Query performance issues | Indexing and EXPLAIN ANALYZE    |
| Over-complex schema      | Phased feature implementation   |

---

## 14. Success Metrics

* Zero inventory inconsistencies
* All critical queries optimized
* Complete SQL documentation available
* Clear demonstration of DBMS concepts during evaluation

---

## 15. Deliverables

* PRD (this document)
* ER Diagram
* Schema.sql (DDL)
* queries.sql
* indexing.sql
* explain_analyze.md
* FastAPI backend implementation
* React frontend dashboards

---

## 16. Future Enhancements

* Multi-tenant organization support
* Demand forecasting modules
* Route optimization algorithms
* OLAP-style data warehouse schema

---

**End of Document**
