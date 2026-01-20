-- ============================================
-- SAMPLE DATA FOR WTMS
-- ============================================

-- Warehouses
INSERT INTO warehouses (warehouse_name, location, city, state, country, capacity_cubic_meters) VALUES
('Central Distribution Center', '123 Industrial Park Rd', 'Mumbai', 'Maharashtra', 'India', 50000.00),
('North Regional Hub', '456 Logistics Ave', 'Delhi', 'Delhi', 'India', 35000.00),
('South Fulfillment Center', '789 Warehouse Lane', 'Chennai', 'Tamil Nadu', 'India', 40000.00),
('West Coast Depot', '321 Commerce Blvd', 'Pune', 'Maharashtra', 'India', 30000.00);

-- Storage Zones
INSERT INTO zones (warehouse_id, zone_name, zone_type, capacity_cubic_meters) VALUES
(1, 'Zone-A', 'general', 15000.00),
(1, 'Zone-B', 'cold_storage', 10000.00),
(1, 'Zone-C', 'dry_storage', 20000.00),
(2, 'Zone-A', 'general', 12000.00),
(2, 'Zone-B', 'hazardous', 8000.00),
(3, 'Zone-A', 'dry_storage', 18000.00),
(3, 'Zone-B', 'general', 15000.00);

-- Storage Bins
INSERT INTO bins (zone_id, bin_code, capacity_cubic_meters) VALUES
(1, 'A-001', 100.00),
(1, 'A-002', 100.00),
(1, 'A-003', 150.00),
(2, 'B-001', 80.00),
(2, 'B-002', 80.00),
(3, 'C-001', 200.00),
(4, 'A-001', 120.00);

-- Products
INSERT INTO products (product_code, product_name, description, category, unit_price, weight_kg, volume_cubic_meters, reorder_level) VALUES
('ELEC-001', 'Smartphone Model X', 'Latest smartphone with 5G capability', 'Electronics', 45000.00, 0.20, 0.002, 50),
('ELEC-002', 'Laptop Pro 15', 'High-performance laptop for professionals', 'Electronics', 85000.00, 2.00, 0.008, 30),
('ELEC-003', 'Wireless Earbuds', 'Premium noise-canceling earbuds', 'Electronics', 12000.00, 0.05, 0.001, 100),
('HOME-001', 'LED TV 55 inch', 'Smart LED TV with 4K resolution', 'Home Appliances', 55000.00, 15.00, 0.300, 20),
('HOME-002', 'Refrigerator 300L', 'Energy-efficient refrigerator', 'Home Appliances', 35000.00, 60.00, 1.200, 15),
('FASH-001', 'Cotton T-Shirt', 'Premium cotton casual t-shirt', 'Fashion', 800.00, 0.20, 0.001, 200),
('FASH-002', 'Denim Jeans', 'Classic fit denim jeans', 'Fashion', 1500.00, 0.50, 0.002, 150),
('BOOK-001', 'Database Systems Textbook', 'Comprehensive guide to DBMS', 'Books', 1200.00, 1.00, 0.005, 50),
('FOOD-001', 'Organic Rice 5kg', 'Premium quality organic rice', 'Food & Grocery', 400.00, 5.00, 0.006, 500),
('FOOD-002', 'Cooking Oil 1L', 'Refined cooking oil', 'Food & Grocery', 180.00, 1.00, 0.001, 300);

-- Customers
INSERT INTO customers (customer_name, email, phone, address, city, state, country) VALUES
('Rajesh Electronics Ltd', 'contact@rajeshelectronics.com', '+91-9876543210', '45 Market Street', 'Mumbai', 'Maharashtra', 'India'),
('TechWorld Retail', 'orders@techworld.in', '+91-9876543211', '12 Tech Plaza', 'Bangalore', 'Karnataka', 'India'),
('HomeStyle Furnishings', 'info@homestyle.co.in', '+91-9876543212', '78 Home Avenue', 'Delhi', 'Delhi', 'India'),
('QuickMart Supermarket', 'procurement@quickmart.in', '+91-9876543213', '90 Commerce Road', 'Chennai', 'Tamil Nadu', 'India'),
('Fashion Hub', 'sales@fashionhub.in', '+91-9876543214', '23 Fashion Street', 'Pune', 'Maharashtra', 'India');

-- Vehicles
INSERT INTO vehicles (vehicle_number, vehicle_type, capacity_kg, capacity_cubic_meters, last_maintenance_date) VALUES
('MH-01-AB-1234', 'truck', 10000.00, 50.00, '2024-12-15'),
('DL-02-CD-5678', 'truck', 12000.00, 60.00, '2024-12-20'),
('TN-03-EF-9012', 'van', 5000.00, 25.00, '2025-01-05'),
('MH-04-GH-3456', 'trailer', 20000.00, 100.00, '2024-11-30'),
('KA-05-IJ-7890', 'truck', 10000.00, 50.00, '2025-01-10');

-- Drivers
INSERT INTO drivers (driver_name, license_number, phone, email, hired_date) VALUES
('Amit Kumar', 'DL-2020-001234', '+91-9876000001', 'amit.kumar@wtms.com', '2020-01-15'),
('Priya Sharma', 'DL-2019-005678', '+91-9876000002', 'priya.sharma@wtms.com', '2019-06-20'),
('Rahul Singh', 'MH-2021-009012', '+91-9876000003', 'rahul.singh@wtms.com', '2021-03-10'),
('Sunita Patel', 'TN-2020-003456', '+91-9876000004', 'sunita.patel@wtms.com', '2020-08-25'),
('Vikram Reddy', 'KA-2022-007890', '+91-9876000005', 'vikram.reddy@wtms.com', '2022-01-05');

-- Routes
INSERT INTO routes (origin_city, destination_city, distance_km, estimated_hours) VALUES
('Mumbai', 'Delhi', 1450.00, 24.00),
('Mumbai', 'Chennai', 1340.00, 22.00),
('Mumbai', 'Pune', 150.00, 3.00),
('Delhi', 'Mumbai', 1450.00, 24.00),
('Delhi', 'Bangalore', 2150.00, 36.00),
('Chennai', 'Mumbai', 1340.00, 22.00),
('Chennai', 'Bangalore', 350.00, 6.00),
('Pune', 'Mumbai', 150.00, 3.00);

-- Initial Inventory
INSERT INTO inventory (warehouse_id, product_id, quantity) VALUES
(1, 1, 150),  -- Central DC: Smartphones
(1, 2, 80),   -- Central DC: Laptops
(1, 3, 250),  -- Central DC: Earbuds
(1, 4, 45),   -- Central DC: TVs
(1, 9, 1200), -- Central DC: Rice
(1, 10, 800), -- Central DC: Cooking Oil
(2, 1, 100),  -- North Hub: Smartphones
(2, 2, 50),   -- North Hub: Laptops
(2, 6, 500),  -- North Hub: T-Shirts
(2, 7, 400),  -- North Hub: Jeans
(3, 3, 180),  -- South FC: Earbuds
(3, 4, 30),   -- South FC: TVs
(3, 5, 25),   -- South FC: Refrigerators
(3, 8, 120),  -- South FC: Books
(4, 6, 350),  -- West Depot: T-Shirts
(4, 7, 280),  -- West Depot: Jeans
(4, 9, 800),  -- West Depot: Rice
(4, 10, 600); -- West Depot: Cooking Oil

-- Sample Stock Movements
INSERT INTO stock_movements (product_id, to_warehouse_id, quantity, movement_type, reference_number, notes, created_by) VALUES
(1, 1, 150, 'inbound', 'PO-2025-001', 'Initial stock purchase', 'admin'),
(2, 1, 80, 'inbound', 'PO-2025-002', 'Initial stock purchase', 'admin'),
(6, 2, 500, 'inbound', 'PO-2025-003', 'Seasonal stock', 'admin'),
(9, 1, 1200, 'inbound', 'PO-2025-004', 'Bulk grocery purchase', 'admin');

-- Sample Orders
INSERT INTO orders (customer_id, warehouse_id, order_number, order_date, required_date, status, total_amount) VALUES
(1, 1, 'ORD-2025-001', '2025-01-15 10:00:00', '2025-01-20', 'confirmed', 500000.00),
(2, 2, 'ORD-2025-002', '2025-01-16 11:30:00', '2025-01-22', 'processing', 350000.00),
(4, 1, 'ORD-2025-003', '2025-01-17 14:00:00', '2025-01-23', 'confirmed', 85000.00),
(5, 4, 'ORD-2025-004', '2025-01-18 09:00:00', '2025-01-25', 'pending', 125000.00);

-- Sample Order Items
INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
(1, 1, 10, 45000.00),  -- Order 1: 10 Smartphones
(1, 2, 2, 85000.00),   -- Order 1: 2 Laptops
(2, 1, 5, 45000.00),   -- Order 2: 5 Smartphones
(2, 3, 15, 12000.00),  -- Order 2: 15 Earbuds
(3, 2, 1, 85000.00),   -- Order 3: 1 Laptop
(4, 6, 100, 800.00),   -- Order 4: 100 T-Shirts
(4, 7, 80, 1500.00);   -- Order 4: 80 Jeans

-- Sample Shipments
INSERT INTO shipments (order_id, vehicle_id, driver_id, route_id, shipment_number, status, scheduled_departure, scheduled_arrival) VALUES
(1, 1, 1, 1, 'SHIP-2025-001', 'planned', '2025-01-20 08:00:00', '2025-01-21 08:00:00'),
(2, 2, 2, 1, 'SHIP-2025-002', 'in_transit', '2025-01-19 06:00:00', '2025-01-20 06:00:00'),
(3, 3, 3, 3, 'SHIP-2025-003', 'planned', '2025-01-21 10:00:00', '2025-01-21 13:00:00');

-- Update shipment with actual times
UPDATE shipments
SET actual_departure = '2025-01-19 06:15:00'
WHERE shipment_id = 2;

-- Verify data
SELECT 'Warehouses' as entity, COUNT(*) as count FROM warehouses
UNION ALL
SELECT 'Products', COUNT(*) FROM products
UNION ALL
SELECT 'Customers', COUNT(*) FROM customers
UNION ALL
SELECT 'Inventory Records', COUNT(*) FROM inventory
UNION ALL
SELECT 'Orders', COUNT(*) FROM orders
UNION ALL
SELECT 'Order Items', COUNT(*) FROM order_items
UNION ALL
SELECT 'Shipments', COUNT(*) FROM shipments;