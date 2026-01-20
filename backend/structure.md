wtms-backend/
│
├── app/
│   ├── __init__.py
│   ├── main.py                      # FastAPI entry point
│   ├── config.py                    # Configuration and env var 
│   ├── database.py                  # Database connection 
│   │
│   ├── models/                      # Pydantic models (DTOs)
│   │   ├── __init__.py
│   │   ├── warehouse.py
│   │   ├── product.py
│   │   ├── inventory.py
│   │   ├── order.py
│   │   ├── shipment.py
│   │   └── customer.py
│   │
│   ├── api/                         # API routes
│   │   ├── __init__.py
│   │   ├── warehouses.py
│   │   ├── products.py
│   │   ├── inventory.py
│   │   ├── orders.py
│   │   ├── shipments.py
│   │   ├── customers.py
│   │   ├── vehicles.py
│   │   ├── drivers.py
│   │   └── analytics.py
│   │
│   ├── services/                    # Business logic layer
│   │   ├── __init__.py
│   │   ├── warehouse_service.py
│   │   ├── inventory_service.py
│   │   ├── order_service.py
│   │   ├── shipment_service.py
│   │   └── analytics_service.py
│   │
│   ├── repositories/                # Database access layer (Raw SQL)
│   │   ├── __init__.py
│   │   ├── base_repository.py
│   │   ├── warehouse_repository.py
│   │   ├── product_repository.py
│   │   ├── inventory_repository.py
│   │   ├── order_repository.py
│   │   ├── shipment_repository.py
│   │   └── analytics_repository.py
│   │
│   └── utils/
│       ├── __init__.py
│       ├── exceptions.py            # Custom exceptions
│       └── validators.py            # Input validators
│
├── sql/
│   ├── schema.sql                   # Database schema DDL
│   ├── sample_data.sql              # Sample data for testing
│   ├── queries.sql                  # Common SQL queries
│   └── performance/
│       ├── indexing.sql             # Index creation scripts
│       └── explain_analyze.md       # Query performance analysis
│
├── tests/
│   ├── __init__.py
│   ├── test_warehouses.py
│   ├── test_inventory.py
│   ├── test_orders.py
│   └── test_shipments.py
│
├── alembic/                         # Database migrations (optional)
│   ├── versions/
│   └── env.py
│
├── .env.example                     # Environment variables template
├── .gitignore
├── requirements.txt                 # Python dependencies
├── README.md
└── docker-compose.yml               # Local PostgreSQL setup (optional)