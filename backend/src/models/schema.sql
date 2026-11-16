-- Database Schema for Smart Traffic Management System
-- Compatible with PostgreSQL and SQLite

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) DEFAULT 'Traffic Operator', -- 'Super Admin', 'Traffic Operator'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS intersections (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(200) NOT NULL,
    status VARCHAR(20) DEFAULT 'ONLINE', -- 'ONLINE', 'MAINTENANCE', 'OFFLINE'
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cameras (
    id VARCHAR(36) PRIMARY KEY,
    intersection_id VARCHAR(36) NOT NULL,
    direction VARCHAR(20) NOT NULL, -- 'North', 'South', 'East', 'West'
    source_url VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE', -- 'ACTIVE', 'ERROR', 'OFFLINE'
    FOREIGN KEY (intersection_id) REFERENCES intersections(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS vehicle_detections (
    id VARCHAR(36) PRIMARY KEY,
    camera_id VARCHAR(36) NOT NULL,
    vehicle_type VARCHAR(30) NOT NULL, -- 'car', 'bus', 'truck', 'motorcycle', 'bicycle'
    confidence DECIMAL(4, 3) NOT NULL,
    track_id INT,
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (camera_id) REFERENCES cameras(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS traffic_statistics (
    id VARCHAR(36) PRIMARY KEY,
    camera_id VARCHAR(36) NOT NULL,
    vehicle_count INT NOT NULL,
    pcu_count DECIMAL(6, 2) NOT NULL,
    density_level VARCHAR(20) NOT NULL, -- 'Low', 'Medium', 'High', 'Very High'
    queue_length_meters DECIMAL(6, 2),
    average_waiting_time_sec DECIMAL(6, 2),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (camera_id) REFERENCES cameras(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS signal_timings (
    id VARCHAR(36) PRIMARY KEY,
    intersection_id VARCHAR(36) NOT NULL,
    direction VARCHAR(20) NOT NULL,
    green_duration INT NOT NULL,
    priority_score DECIMAL(5, 4),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (intersection_id) REFERENCES intersections(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS signal_logs (
    id VARCHAR(36) PRIMARY KEY,
    intersection_id VARCHAR(36) NOT NULL,
    active_direction VARCHAR(20) NOT NULL,
    phase_state VARCHAR(20) NOT NULL, -- 'GREEN', 'YELLOW', 'ALL_RED'
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    vehicles_cleared INT DEFAULT 0,
    FOREIGN KEY (intersection_id) REFERENCES intersections(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS emergency_alerts (
    id VARCHAR(36) PRIMARY KEY,
    intersection_id VARCHAR(36) NOT NULL,
    direction VARCHAR(20) NOT NULL,
    vehicle_type VARCHAR(30) NOT NULL, -- 'ambulance', 'fire_truck', 'police'
    status VARCHAR(20) DEFAULT 'ACTIVE', -- 'ACTIVE', 'CLEARED', 'RESOLVED'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cleared_at TIMESTAMP,
    FOREIGN KEY (intersection_id) REFERENCES intersections(id) ON DELETE CASCADE
);
