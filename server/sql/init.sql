-- Run this against your MySQL instance to create the required tables
CREATE DATABASE IF NOT EXISTS husk;
USE husk;

CREATE TABLE IF NOT EXISTS coconut_inputs (
  id VARCHAR(50) PRIMARY KEY,
  date DATETIME,
  count INT,
  price_per_unit DECIMAL(10,2),
  total_price DECIMAL(10,2),
  client VARCHAR(255),
  payment_status VARCHAR(50) DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS labour_wages (
  id VARCHAR(50) PRIMARY KEY,
  date DATETIME,
  worker_name VARCHAR(255),
  days DECIMAL(6,2),
  rate_per_day DECIMAL(10,2),
  total_wage DECIMAL(10,2)
);

CREATE TABLE IF NOT EXISTS clients (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) UNIQUE
);
