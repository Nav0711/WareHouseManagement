-- ============================================
-- COMMON SQL QUERIES FOR WTMS
-- Demonstrates various SQL concepts and operations
-- ============================================

-- ============================================
-- 1. BASIC QUERIES
-- ============================================

-- Get all active warehouses
SELECT warehouse_id, warehouse_name, city, capacity_cubic_meters
FROM warehouses
WHERE is_active = TRUE
ORDER BY warehouse_name;

-- Get all products with price above 10000
SELECT product_code, product_name, unit_price, category
FROM products
WHERE unit_price > 10000 AND is_active = TRUE
ORDER BY unit_price DESC;

-- ============================================
-- 2. JOIN QUERIES
-- ============================================

-- Inventory with warehouse and product details
SELECT 
    w.warehouse_name,
    w.city,
    p.product_code,
    p.product_name,
    i.quantity,
    i.reserved_quantity,
    (i.quantity - i.reserved_quantity) as available_quantity
FROM inventory i
INNER JOIN warehouses w ON i.warehouse_id = w.warehouse_id
INNER JOIN products p ON i.product_id = p.product_id
WHERE w.is_active = TRUE
ORDER BY w.warehouse_name, p.product_name;

-- Orders with customer details
SELECT 
    o.order_number,
    c.customer_name,
    o.order_date,
    o.status,
    w.warehouse_name,
    COUNT(oi.order_item_id) as total_items,
    SUM(oi.line_total) as order_total
FROM orders o
INNER JOIN customers c ON o.customer_id = c.customer_id
INNER JOIN warehouses w ON o.warehouse_id = w.warehouse_id
LEFT JOIN order_items oi ON o.order_id = oi.order_id
GROUP BY o.order_id, o.order_number, c.customer_name, o.order_date, o.status, w.warehouse_name
ORDER BY o.order_date DESC;

-- Shipments with vehicle and driver details
SELECT 
    s.shipment_number,
    o.order_number,
    v.vehicle_number,
    v.vehicle_type,
    d.driver_name,
    r.origin_city,
    r.destination_city,
    r.distance_km,
    s.status,
    s.scheduled_departure,
    s.actual_departure
FROM shipments s
INNER JOIN orders o ON s.order_id = o.order_id
INNER JOIN vehicles v ON s.vehicle_id = v.vehicle_id
INNER JOIN drivers d ON s.driver_id = d.driver_id
INNER JOIN routes r ON s.route_id = r.route_id
ORDER BY s.scheduled_departure DESC;

-- ============================================
-- 3. AGGREGATION QUERIES
-- ============================================

-- Total inventory value by warehouse
SELECT 
    w.warehouse_id,
    w.warehouse_name,
    COUNT(DISTINCT i.product_id) as product_count,
    SUM(i.quantity) as total_quantity,
    SUM(i.quantity * p.unit_price) as total_inventory_value
FROM warehouses w
LEFT JOIN inventory i ON w.warehouse_id = i.warehouse_id
LEFT JOIN products p ON i.product_id = p.product_id
WHERE w.is_active = TRUE
GROUP BY w.warehouse_id, w.warehouse_name
ORDER BY total_inventory_value DESC NULLS LAST;

-- Product category analysis
SELECT 
    p.category,
    COUNT(*) as product_count,
    SUM(i.quantity) as total_stock,
    AVG(p.unit_price) as avg_price,
    MIN(p.unit_price) as min_price,
    MAX(p.unit_price) as max_price
FROM products p
LEFT JOIN inventory i ON p.product_id = i.product_id
WHERE p.is_active = TRUE
GROUP BY p.category
ORDER BY total_stock DESC NULLS LAST;

-- Order statistics by customer
SELECT 
    c.customer_name,
    COUNT(DISTINCT o.order_id) as total_orders,
    SUM(oi.quantity) as total_items_ordered,
    SUM(oi.line_total) as total_spent,
    AVG(oi.line_total) as avg_order_value
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
LEFT JOIN order_items oi ON o.order_id = oi.order_id
GROUP BY c.customer_id, c.customer_name
HAVING COUNT(DISTINCT o.order_id) > 0
ORDER BY total_spent DESC;

-- ============================================
-- 4. SUBQUERIES
-- ============================================

-- Products with below-average inventory
SELECT 
    p.product_name,
    i.quantity,
    (SELECT AVG(quantity) FROM inventory) as avg_inventory
FROM products p
INNER JOIN inventory i ON p.product_id = i.product_id
WHERE i.quantity < (SELECT AVG(quantity) FROM inventory)
ORDER BY i.quantity;

-- Warehouses with most product variety
SELECT 
    w.warehouse_name,
    w.city,
    product_count,
    total_quantity
FROM warehouses w
INNER JOIN (
    SELECT 
        warehouse_id,
        COUNT(DISTINCT product_id) as product_count,
        SUM(quantity) as total_quantity
    FROM inventory
    GROUP BY warehouse_id
) inv ON w.warehouse_id = inv.warehouse_id
WHERE product_count = (
    SELECT MAX(product_count)
    FROM (
        SELECT COUNT(DISTINCT product_id) as product_count
        FROM inventory
        GROUP BY warehouse_id
    ) sub
);

-- ============================================
-- 5. COMMON TABLE EXPRESSIONS (CTEs)
-- ============================================

-- Warehouse utilization report with CTEs
WITH warehouse_capacity AS (
    SELECT 
        warehouse_id,
        warehouse_name,
        capacity_cubic_meters
    FROM warehouses
    WHERE is_active = TRUE
),
inventory_usage AS (
    SELECT 
        i.warehouse_id,
        SUM(i.quantity * p.volume_cubic_meters) as used_volume,
        COUNT(DISTINCT i.product_id) as product_count,
        SUM(i.quantity) as total_items
    FROM inventory i
    INNER JOIN products p ON i.product_id = p.product_id
    GROUP BY i.warehouse_id
)
SELECT 
    wc.warehouse_name,
    wc.capacity_cubic_meters,
    COALESCE(iu.used_volume, 0) as used_volume,
    COALESCE(iu.product_count, 0) as product_count,
    COALESCE(iu.total_items, 0) as total_items,
    ROUND(
        (COALESCE(iu.used_volume, 0) / wc.capacity_cubic_meters * 100)::numeric, 
        2
    ) as utilization_percentage
FROM warehouse_capacity wc
LEFT JOIN inventory_usage iu ON wc.warehouse_id = iu.warehouse_id
ORDER BY utilization_percentage DESC;

-- Stock movement summary
WITH movement_summary AS (
    SELECT 
        product_id,
        movement_type,
        COUNT(*) as movement_count,
        SUM(quantity) as total_quantity
    FROM stock_movements
    WHERE movement_date >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY product_id, movement_type
)
SELECT 
    p.product_name,
    p.product_code,
    ms.movement_type,
    ms.movement_count,
    ms.total_quantity
FROM movement_summary ms
INNER JOIN products p ON ms.product_id = p.product_id
ORDER BY p.product_name, ms.movement_type;

-- ============================================
-- 6. WINDOW FUNCTIONS
-- ============================================

-- Rank products by inventory quantity within each warehouse
SELECT 
    w.warehouse_name,
    p.product_name,
    i.quantity,
    RANK() OVER (PARTITION BY w.warehouse_id ORDER BY i.quantity DESC) as rank_in_warehouse,
    SUM(i.quantity) OVER (PARTITION BY w.warehouse_id) as warehouse_total
FROM inventory i
INNER JOIN warehouses w ON i.warehouse_id = w.warehouse_id
INNER JOIN products p ON i.product_id = p.product_id
ORDER BY w.warehouse_name, rank_in_warehouse;

-- Running total of stock movements
SELECT 
    movement_date,
    product_id,
    movement_type,
    quantity,
    SUM(quantity) OVER (
        PARTITION BY product_id 
        ORDER BY movement_date 
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) as running_total
FROM stock_movements
WHERE product_id = 1
ORDER BY movement_date;

-- ============================================
-- 7. DATE & TIME QUERIES
-- ============================================

-- Shipments by delivery performance
SELECT 
    shipment_number,
    scheduled_arrival,
    actual_arrival,
    EXTRACT(EPOCH FROM (actual_arrival - scheduled_arrival)) / 3600 as delay_hours,
    CASE 
        WHEN actual_arrival IS NULL THEN 'In Progress'
        WHEN actual_arrival <= scheduled_arrival THEN 'On Time'
        WHEN actual_arrival <= scheduled_arrival + INTERVAL '2 hours' THEN 'Slightly Delayed'
        ELSE 'Delayed'
    END as delivery_status
FROM shipments
WHERE actual_arrival IS NOT NULL
ORDER BY scheduled_arrival DESC;

-- Stock movements in the last 7 days
SELECT 
    DATE(movement_date) as movement_day,
    movement_type,
    COUNT(*) as movement_count,
    SUM(quantity) as total_quantity
FROM stock_movements
WHERE movement_date >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(movement_date), movement_type
ORDER BY movement_day DESC, movement_type;

-- ============================================
-- 8. TRANSACTION EXAMPLES
-- ============================================

-- Process order fulfillment (ACID Transaction)
BEGIN;

-- Reserve inventory
UPDATE inventory
SET reserved_quantity = reserved_quantity + 10
WHERE warehouse_id = 1 AND product_id = 1
  AND (quantity - reserved_quantity) >= 10;

-- Create order
INSERT INTO orders (customer_id, warehouse_id, order_number, status)
VALUES (1, 1, 'ORD-2025-NEW', 'confirmed');

-- Add order items
INSERT INTO order_items (order_id, product_id, quantity, unit_price)
VALUES (
    (SELECT order_id FROM orders WHERE order_number = 'ORD-2025-NEW'),
    1,
    10,
    45000.00
);

COMMIT;

-- ============================================
-- 9. LOW STOCK ALERTS
-- ============================================

-- Critical low stock alert
SELECT 
    w.warehouse_name,
    p.product_code,
    p.product_name,
    i.quantity as current_stock,
    p.reorder_level,
    (p.reorder_level - i.quantity) as shortage,
    ROUND(
        ((p.reorder_level - i.quantity)::numeric / p.reorder_level::numeric * 100),
        2
    ) as shortage_percentage
FROM inventory i
INNER JOIN products p ON i.product_id = p.product_id
INNER JOIN warehouses w ON i.warehouse_id = w.warehouse_id
WHERE i.quantity < p.reorder_level
  AND p.is_active = TRUE
  AND w.is_active = TRUE
ORDER BY shortage_percentage DESC, shortage DESC;

-- ============================================
-- 10. PERFORMANCE ANALYTICS
-- ============================================

-- Route performance analysis
SELECT 
    r.origin_city,
    r.destination_city,
    r.distance_km,
    r.estimated_hours,
    COUNT(s.shipment_id) as total_shipments,
    AVG(
        EXTRACT(EPOCH FROM (s.actual_arrival - s.actual_departure)) / 3600
    ) as avg_actual_hours,
    AVG(
        EXTRACT(EPOCH FROM (s.actual_arrival - s.scheduled_arrival)) / 3600
    ) as avg_delay_hours
FROM routes r
LEFT JOIN shipments s ON r.route_id = s.route_id
WHERE s.actual_arrival IS NOT NULL AND s.actual_departure IS NOT NULL
GROUP BY r.route_id, r.origin_city, r.destination_city, r.distance_km, r.estimated_hours
HAVING COUNT(s.shipment_id) > 0
ORDER BY avg_delay_hours DESC;

-- Driver performance
SELECT 
    d.driver_name,
    COUNT(s.shipment_id) as total_shipments,
    SUM(CASE WHEN s.status = 'delivered' THEN 1 ELSE 0 END) as completed_shipments,
    ROUND(
        (SUM(CASE WHEN s.status = 'delivered' THEN 1 ELSE 0 END)::numeric / 
         COUNT(s.shipment_id)::numeric * 100),
        2
    ) as completion_rate,
    AVG(
        CASE 
            WHEN s.actual_arrival IS NOT NULL AND s.actual_departure IS NOT NULL
            THEN EXTRACT(EPOCH FROM (s.actual_arrival - s.actual_departure)) / 3600
        END
    ) as avg_trip_hours
FROM drivers d
LEFT JOIN shipments s ON d.driver_id = s.driver_id
GROUP BY d.driver_id, d.driver_name
HAVING COUNT(s.shipment_id) > 0
ORDER BY completion_rate DESC, total_shipments DESC;