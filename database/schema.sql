# ResQHub - Database Schema
# Target: MySQL 8.0+

CREATE DATABASE IF NOT EXISTS resqhub_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE resqhub_db;

-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('student', 'warden', 'staff') NOT NULL DEFAULT 'student',
    phone VARCHAR(20) NULL,
    hostel_block VARCHAR(50) NULL,
    room_number VARCHAR(30) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Maintenance Staff Specialization table
CREATE TABLE IF NOT EXISTS maintenance_staff (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    specialization VARCHAR(100) NOT NULL DEFAULT 'General Maintenance',
    CONSTRAINT fk_staff_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Complaints table
CREATE TABLE IF NOT EXISTS complaints (
    id INT AUTO_INCREMENT PRIMARY KEY,
    complaint_id VARCHAR(30) NOT NULL UNIQUE,
    student_id INT NOT NULL,
    category ENUM('Plumbing', 'Electrical', 'Water', 'Wi-Fi/Internet', 'Furniture', 'Cleaning', 'Other') NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    image_url VARCHAR(255) NULL,
    priority ENUM('Low', 'Medium', 'High', 'Emergency') NOT NULL DEFAULT 'Medium',
    status ENUM('Submitted', 'Acknowledged', 'Assigned', 'In Progress', 'Resolved', 'Closed') NOT NULL DEFAULT 'Submitted',
    assigned_to INT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    resolved_at DATETIME NULL,
    CONSTRAINT fk_complaint_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_complaint_staff FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Emergency Alerts table
CREATE TABLE IF NOT EXISTS emergency_alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    emergency_type ENUM('Medical', 'Fire', 'Security', 'Electrical Hazard', 'Other') NOT NULL,
    description TEXT NULL,
    hostel_block VARCHAR(50) NOT NULL,
    room_number VARCHAR(30) NOT NULL,
    status ENUM('Alert Sent', 'Acknowledged', 'Response in Progress', 'Resolved') NOT NULL DEFAULT 'Alert Sent',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    acknowledged_at DATETIME NULL,
    resolved_at DATETIME NULL,
    CONSTRAINT fk_emergency_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Complaint History table
CREATE TABLE IF NOT EXISTS complaint_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    complaint_id INT NOT NULL,
    old_status VARCHAR(50) NOT NULL,
    new_status VARCHAR(50) NOT NULL,
    changed_by INT NOT NULL,
    remarks TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_history_complaint FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
    CONSTRAINT fk_history_user FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('emergency', 'complaint', 'system') NOT NULL DEFAULT 'complaint',
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Indexes for performance
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_student ON complaints(student_id);
CREATE INDEX idx_complaints_assigned ON complaints(assigned_to);
CREATE INDEX idx_emergencies_status ON emergency_alerts(status);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read);
