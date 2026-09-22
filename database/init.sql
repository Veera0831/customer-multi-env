-- ======================================================
-- Customer Database Initialization
-- ======================================================

CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL
);

INSERT INTO customers (name, email)
VALUES
('John Smith', 'john@example.com'),
('Veera Reddy', 'veera@example.com'),
('David Kumar', 'david@example.com'),
('Priya Sharma', 'priya@example.com');

SELECT * FROM customers;