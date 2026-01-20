-- ============================================
-- WAREHOUSE & TRANSPORTATION MANAGEMENT SYSTEM
-- Database Schema (DDL)
-- PostgreSQL
-- ============================================

-- ============================================
-- 1. WAREHOUSES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS warehouses (
    warehouse_id SERIAL PRIMARY KEY,
    warehouse_name VARCHAR(100) NOT NULL UNIQUE,
    location VARCHAR(200) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    country VARCHAR(100) NOT NULL,
    capacity_cubic_meters DECIMAL(12, 2) NOT NULL CHECK (capacity_cubic_meters > 0),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT warehouse_capacity_check CHECK (capacity_cubic_meters > 0)
);

-- ============================================
-- 2. STORAGE ZONES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS zones (
    zone_id SERIAL PRIMARY KEY,
    warehouse_id INTEGER NOT NULL REFERENCES warehouses(warehouse_id) ON DELETE CASCADE,
    zone_name VARCHAR(50) NOT NULL,
    zone_type VARCHAR(20) NOT NULL DEFAULT 'general',
    capacity_cubic_meters DECIMAL(12, 2) NOT NULL CHECK (capacity_cubic_meters > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT zone_type_check CHECK (zone_type IN ('cold_storage', 'dry_storage', 'hazardous', 'general')),
    CONSTRAINT warehouse_zone_unique UNIQUE (warehouse_id, zone_name)
);

-- ============================================
-- 3. STORAGE BINS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS bins (
    bin_id SERIAL PRIMARY KEY,
    zone_id INTEGER NOT NULL REFERENCES zones(zone_id) ON DELETE CASCADE,
    bin_code VARCHAR(20) NOT NULL,
    capacity_cubic_meters DECIMAL(12, 2) NOT NULL CHECK (capacity_cubic_meters > 0),
    is_occupied BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT bin_capacity_check CHECK (capacity_cubic_meters > 0)
);

-- ============================================
-- 4. PRODUCTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS products (
    product_id SERIAL PRIMARY KEY,
    product_code VARCHAR(50) NOT NULL UNIQUE,
    product_name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    unit_price DECIMAL(12, 2) NOT NULL CHECK (unit_price >= 0),
    weight_kg DECIMAL(10, 2) NOT NULL CHECK (weight_kg > 0),
    volume_cubic_meters DECIMAL(12, 4) NOT NULL CHECK (volume_cubic_meters > 0),
    reorder_level INTEGER DEFAULT 10 CHECK (reorder_level >= 0),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 5. INVENTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS inventory (
    inventory_id SERIAL PRIMARY KEY,
    warehouse_id INTEGER NOT NULL REFERENCES warehouses(warehouse_id) ON DELETE RESTRICT,
    product_id INTEGER NOT NULL REFERENCES products(product_id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    reserved_quantity INTEGER NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT warehouse_product_unique UNIQUE (warehouse_id, product_id),
    CONSTRAINT inventory_check CHECK (reserved_quantity <= quantity)
);

-- ============================================
-- 6. STOCK MOVEMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS stock_movements (
    movement_id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(product_id),
    from_warehouse_id INTEGER REFERENCES warehouses(warehouse_id),
    to_warehouse_id INTEGER REFERENCES warehouses(warehouse_id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    movement_type VARCHAR(20) NOT NULL,
    reference_number VARCHAR(100),
    notes TEXT,
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT movement_type_check CHECK (movement_type IN ('inbound', 'outbound', 'transfer', 'adjustment')),
    CONSTRAINT inbound_check CHECK (
        CASE 
            WHEN movement_type = 'inbound' THEN to_warehouse_id IS NOT NULL AND from_warehouse_id IS NULL
            WHEN movement_type = 'outbound' THEN from_warehouse_id IS NOT NULL AND to_warehouse_id IS NULL
            WHEN movement_type = 'transfer' THEN from_warehouse_id IS NOT NULL AND to_warehouse_id IS NOT NULL
            WHEN movement_type = 'adjustment' THEN TRUE
        END
    )
);

-- ============================================
-- 7. CUSTOMERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS customers (
    customer_id SERIAL PRIMARY KEY,
    customer_name VARCHAR(200) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    address VARCHAR(200),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 8. ORDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
    order_id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(customer_id),
    warehouse_id INTEGER NOT NULL REFERENCES warehouses(warehouse_id),
    order_number VARCHAR(50) NOT NULL UNIQUE,
    order_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    required_date DATE,
    status VARCHAR(20) DEFAULT 'pending',
    total_amount DECIMAL(15, 2) DEFAULT 0 CHECK (total_amount >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT order_status_check CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'))
);

-- ============================================
-- 9. ORDER ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(product_id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(12, 2) NOT NULL CHECK (unit_price >= 0),
    line_total DECIMAL(15, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 10. VEHICLES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS vehicles (
    vehicle_id SERIAL PRIMARY KEY,
    vehicle_number VARCHAR(20) NOT NULL UNIQUE,
    vehicle_type VARCHAR(20) NOT NULL,
    capacity_kg DECIMAL(12, 2) NOT NULL CHECK (capacity_kg > 0),
    capacity_cubic_meters DECIMAL(12, 2) NOT NULL CHECK (capacity_cubic_meters > 0),
    last_maintenance_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT vehicle_type_check CHECK (vehicle_type IN ('truck', 'van', 'trailer', 'courier'))
);

-- ============================================
-- 11. DRIVERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS drivers (
    driver_id SERIAL PRIMARY KEY,
    driver_name VARCHAR(200) NOT NULL,
    license_number VARCHAR(50) NOT NULL UNIQUE,
    phone VARCHAR(20),
    email VARCHAR(100),
    hired_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 12. ROUTES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS routes (
    route_id SERIAL PRIMARY KEY,
    origin_city VARCHAR(100) NOT NULL,
    destination_city VARCHAR(100) NOT NULL,
    distance_km DECIMAL(10, 2) NOT NULL CHECK (distance_km > 0),
    estimated_hours DECIMAL(6, 2) NOT NULL CHECK (estimated_hours > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT route_unique UNIQUE (origin_city, destination_city)
);

-- ============================================
-- 13. SHIPMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS shipments (
    shipment_id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(order_id),
    vehicle_id INTEGER NOT NULL REFERENCES vehicles(vehicle_id),
    driver_id INTEGER NOT NULL REFERENCES drivers(driver_id),
    route_id INTEGER NOT NULL REFERENCES routes(route_id),
    shipment_number VARCHAR(50) NOT NULL UNIQUE,
    status VARCHAR(20) DEFAULT 'planned',
    scheduled_departure TIMESTAMP,
    scheduled_arrival TIMESTAMP,
    actual_departure TIMESTAMP,
    actual_arrival TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT shipment_status_check CHECK (status IN ('planned', 'in_transit', 'delivered', 'cancelled')),
    CONSTRAINT departure_arrival_check CHECK (scheduled_departure < scheduled_arrival)
);

-- ============================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ============================================

-- Warehouse indexes
CREATE INDEX idx_warehouses_city ON warehouses(city);
CREATE INDEX idx_warehouses_is_active ON warehouses(is_active);

-- Zone indexes
CREATE INDEX idx_zones_warehouse_id ON zones(warehouse_id);
CREATE INDEX idx_zones_zone_type ON zones(zone_type);

-- Bin indexes
CREATE INDEX idx_bins_zone_id ON bins(zone_id);

-- Product indexes
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_code ON products(product_code);

-- Inventory indexes
CREATE INDEX idx_inventory_warehouse_id ON inventory(warehouse_id);
CREATE INDEX idx_inventory_product_id ON inventory(product_id);

-- Stock movement indexes
CREATE INDEX idx_stock_movements_product_id ON stock_movements(product_id);
CREATE INDEX idx_stock_movements_from_warehouse ON stock_movements(from_warehouse_id);
CREATE INDEX idx_stock_movements_to_warehouse ON stock_movements(to_warehouse_id);
CREATE INDEX idx_stock_movements_type ON stock_movements(movement_type);
CREATE INDEX idx_stock_movements_created_at ON stock_movements(created_at);

-- Customer indexes
CREATE INDEX idx_customers_city ON customers(city);
CREATE INDEX idx_customers_is_active ON customers(is_active);

-- Order indexes
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_warehouse_id ON orders(warehouse_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_order_date ON orders(order_date);
CREATE INDEX idx_orders_number ON orders(order_number);

-- Order items indexes
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- Vehicle indexes
CREATE INDEX idx_vehicles_vehicle_type ON vehicles(vehicle_type);
CREATE INDEX idx_vehicles_is_active ON vehicles(is_active);

-- Driver indexes
CREATE INDEX idx_drivers_is_active ON drivers(is_active);

-- Shipment indexes
CREATE INDEX idx_shipments_order_id ON shipments(order_id);
CREATE INDEX idx_shipments_vehicle_id ON shipments(vehicle_id);
CREATE INDEX idx_shipments_driver_id ON shipments(driver_id);
CREATE INDEX idx_shipments_route_id ON shipments(route_id);
CREATE INDEX idx_shipments_status ON shipments(status);
CREATE INDEX idx_shipments_number ON shipments(shipment_number);

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- View for inventory with details
CREATE OR REPLACE VIEW inventory_with_details AS
SELECT 
    i.inventory_id,
    w.warehouse_id,
    w.warehouse_name,
    w.city,
    p.product_id,
    p.product_code,
    p.product_name,
    i.quantity,
    i.reserved_quantity,
    (i.quantity - i.reserved_quantity) as available_quantity,
    i.last_updated
FROM inventory i
INNER JOIN warehouses w ON i.warehouse_id = w.warehouse_id
INNER JOIN products p ON i.product_id = p.product_id;

-- View for low stock alert
CREATE OR REPLACE VIEW low_stock_alert AS
SELECT 
    p.product_id,
    p.product_code,
    p.product_name,
    i.warehouse_id,
    w.warehouse_name,
    i.quantity,
    p.reorder_level,
    (p.reorder_level - i.quantity) as shortage_qty
FROM inventory i
INNER JOIN products p ON i.product_id = p.product_id
INNER JOIN warehouses w ON i.warehouse_id = w.warehouse_id
WHERE i.quantity <= p.reorder_level
ORDER BY shortage_qty DESC;

-- View for warehouse utilization
CREATE OR REPLACE VIEW warehouse_utilization AS
SELECT 
    w.warehouse_id,
    w.warehouse_name,
    w.city,
    w.capacity_cubic_meters,
    COALESCE(SUM(i.quantity * p.volume_cubic_meters), 0) as used_cubic_meters,
    w.capacity_cubic_meters - COALESCE(SUM(i.quantity * p.volume_cubic_meters), 0) as available_cubic_meters,
    ROUND(
        (COALESCE(SUM(i.quantity * p.volume_cubic_meters), 0) / w.capacity_cubic_meters) * 100, 
        2
    ) as utilization_percentage
FROM warehouses w
LEFT JOIN inventory i ON w.warehouse_id = i.warehouse_id
LEFT JOIN products p ON i.product_id = p.product_id
GROUP BY w.warehouse_id, w.warehouse_name, w.city, w.capacity_cubic_meters;
