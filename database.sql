-- ====================================
-- Medical Center Database Schema
-- MySQL Database Structure
-- ====================================

-- Create Database
CREATE DATABASE IF NOT EXISTS medical_center_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE medical_center_db;

-- ===== 1. Users/Patients Table =====
CREATE TABLE patients (
    id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    phone_secondary VARCHAR(20),
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other'),
    nationality VARCHAR(50),
    id_number VARCHAR(50) UNIQUE,
    address VARCHAR(255),
    city VARCHAR(100),
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    medical_history LONGTEXT,
    allergies LONGTEXT,
    current_medications LONGTEXT,
    insurance_provider VARCHAR(100),
    insurance_number VARCHAR(50),
    password_hash VARCHAR(255) NOT NULL,
    status ENUM('active', 'inactive', 'archived') DEFAULT 'active',
    last_login DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT,
    updated_by INT,

    INDEX idx_email (email),
    INDEX idx_phone (phone),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===== 2. Staff Table =====
CREATE TABLE staff (
    id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    specialization VARCHAR(100),
    role ENUM('doctor', 'nurse', 'technician', 'admin', 'receptionist') NOT NULL,
    department VARCHAR(100),
    license_number VARCHAR(50),
    license_expiry DATE,
    employment_date DATE,
    status ENUM('active', 'inactive', 'on_leave') DEFAULT 'active',
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_department (department)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===== 3. Services Table =====
CREATE TABLE services (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description LONGTEXT,
    category ENUM('emergency', 'laboratory', 'radiology', 'other') NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    duration_minutes INT DEFAULT 30,
    requires_appointment BOOLEAN DEFAULT TRUE,
    requires_fasting BOOLEAN DEFAULT FALSE,
    requires_preparation VARCHAR(500),
    status ENUM('available', 'unavailable', 'discontinued') DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_category (category),
    INDEX idx_status (status),
    UNIQUE KEY uk_name_category (name, category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===== 4. Appointments/Bookings Table =====
CREATE TABLE appointments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT NOT NULL,
    service_id INT NOT NULL,
    staff_id INT,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    appointment_datetime DATETIME GENERATED ALWAYS AS
        (TIMESTAMP(appointment_date, appointment_time)) STORED,
    status ENUM('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show') DEFAULT 'scheduled',
    notes TEXT,
    reminder_sent BOOLEAN DEFAULT FALSE,
    reminder_sent_at DATETIME,
    cancellation_reason VARCHAR(255),
    cancelled_at DATETIME,
    cancelled_by INT,
    completed_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE RESTRICT,
    FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE SET NULL,

    INDEX idx_patient_id (patient_id),
    INDEX idx_service_id (service_id),
    INDEX idx_appointment_date (appointment_date),
    INDEX idx_appointment_datetime (appointment_datetime),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===== 5. Laboratory Tests Table =====
CREATE TABLE lab_tests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    appointment_id INT NOT NULL,
    test_name VARCHAR(150) NOT NULL,
    test_code VARCHAR(50),
    specimen_type VARCHAR(100),
    specimen_collected_at DATETIME,
    specimen_collected_by INT,
    status ENUM('ordered', 'received', 'processing', 'completed', 'cancelled') DEFAULT 'ordered',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    FOREIGN KEY (specimen_collected_by) REFERENCES staff(id),

    INDEX idx_appointment_id (appointment_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===== 6. Lab Results Table =====
CREATE TABLE lab_results (
    id INT PRIMARY KEY AUTO_INCREMENT,
    lab_test_id INT NOT NULL,
    patient_id INT NOT NULL,
    test_parameter VARCHAR(150),
    result_value VARCHAR(100),
    unit VARCHAR(50),
    normal_range VARCHAR(100),
    reference_range VARCHAR(100),
    status ENUM('normal', 'abnormal', 'critical') DEFAULT 'normal',
    notes TEXT,
    reviewed_by INT,
    reviewed_at DATETIME,
    verified BOOLEAN DEFAULT FALSE,
    verified_by INT,
    verified_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (lab_test_id) REFERENCES lab_tests(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES staff(id),
    FOREIGN KEY (verified_by) REFERENCES staff(id),

    INDEX idx_patient_id (patient_id),
    INDEX idx_lab_test_id (lab_test_id),
    INDEX idx_status (status),
    INDEX idx_verified (verified)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===== 7. Radiology Exams Table =====
CREATE TABLE radiology_exams (
    id INT PRIMARY KEY AUTO_INCREMENT,
    appointment_id INT NOT NULL,
    patient_id INT NOT NULL,
    exam_type VARCHAR(100) NOT NULL,
    exam_code VARCHAR(50),
    modality ENUM('xray', 'ultrasound', 'ct', 'mri', 'mammography', 'other') NOT NULL,
    body_part VARCHAR(100),
    exam_date DATETIME,
    exam_performed_by INT,
    status ENUM('ordered', 'in_progress', 'completed', 'cancelled') DEFAULT 'ordered',
    images_count INT DEFAULT 0,
    images_stored_location VARCHAR(255),
    image_quality_reviewed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (exam_performed_by) REFERENCES staff(id),

    INDEX idx_patient_id (patient_id),
    INDEX idx_appointment_id (appointment_id),
    INDEX idx_modality (modality),
    INDEX idx_exam_date (exam_date),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===== 8. Radiology Reports Table =====
CREATE TABLE radiology_reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    radiology_exam_id INT NOT NULL,
    patient_id INT NOT NULL,
    radiologist_id INT,
    report_text LONGTEXT,
    findings LONGTEXT,
    impressions LONGTEXT,
    recommendations LONGTEXT,
    status ENUM('draft', 'completed', 'reviewed', 'approved') DEFAULT 'draft',
    reviewed_by INT,
    reviewed_at DATETIME,
    approved_by INT,
    approved_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (radiology_exam_id) REFERENCES radiology_exams(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (radiologist_id) REFERENCES staff(id),
    FOREIGN KEY (reviewed_by) REFERENCES staff(id),
    FOREIGN KEY (approved_by) REFERENCES staff(id),

    INDEX idx_patient_id (patient_id),
    INDEX idx_radiology_exam_id (radiology_exam_id),
    INDEX idx_status (status),
    INDEX idx_approved_at (approved_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===== 9. Emergency Visits Table =====
CREATE TABLE emergency_visits (
    id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT NOT NULL,
    arrival_time DATETIME NOT NULL,
    triage_level ENUM('red', 'yellow', 'green', 'blue') DEFAULT 'yellow',
    chief_complaint VARCHAR(255),
    vital_signs_temp DECIMAL(5, 2),
    vital_signs_bp VARCHAR(10),
    vital_signs_heart_rate INT,
    vital_signs_oxygen_sat DECIMAL(5, 2),
    assigned_doctor_id INT,
    treatment_provided LONGTEXT,
    discharge_time DATETIME,
    disposition ENUM('admitted', 'discharged', 'transferred', 'ama') DEFAULT 'discharged',
    destination VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_doctor_id) REFERENCES staff(id),

    INDEX idx_patient_id (patient_id),
    INDEX idx_arrival_time (arrival_time),
    INDEX idx_triage_level (triage_level),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===== 10. Payments Table =====
CREATE TABLE payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    appointment_id INT,
    patient_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'ILS',
    payment_method ENUM('cash', 'card', 'bank_transfer', 'insurance', 'check') NOT NULL,
    payment_gateway_id VARCHAR(100),
    status ENUM('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded') DEFAULT 'pending',
    transaction_id VARCHAR(100) UNIQUE,
    reference_number VARCHAR(50),
    description VARCHAR(255),
    paid_at DATETIME,
    refunded_at DATETIME,
    refund_amount DECIMAL(10, 2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,

    INDEX idx_patient_id (patient_id),
    INDEX idx_status (status),
    INDEX idx_paid_at (paid_at),
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===== 11. Medical Records/Documents Table =====
CREATE TABLE medical_documents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT NOT NULL,
    appointment_id INT,
    document_type ENUM('lab_report', 'radiology_report', 'prescription', 'medical_certificate', 'discharge_summary', 'other') NOT NULL,
    document_title VARCHAR(255),
    document_path VARCHAR(255),
    file_size INT,
    mime_type VARCHAR(50),
    uploaded_by INT,
    visibility ENUM('private', 'patient', 'shared') DEFAULT 'patient',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL,
    FOREIGN KEY (uploaded_by) REFERENCES staff(id),

    INDEX idx_patient_id (patient_id),
    INDEX idx_document_type (document_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===== 12. Contact Messages Table =====
CREATE TABLE contact_messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    subject VARCHAR(255),
    message LONGTEXT NOT NULL,
    status ENUM('new', 'read', 'replied', 'closed') DEFAULT 'new',
    reply_message LONGTEXT,
    replied_by INT,
    replied_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (replied_by) REFERENCES staff(id),

    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===== 13. Audit Log Table =====
CREATE TABLE audit_log (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    user_type ENUM('patient', 'staff') NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INT,
    changes LONGTEXT,
    ip_address VARCHAR(45),
    user_agent VARCHAR(255),
    status ENUM('success', 'failure') DEFAULT 'success',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_user_id (user_id),
    INDEX idx_user_type (user_type),
    INDEX idx_action (action),
    INDEX idx_entity_type (entity_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===== 14. Settings Table =====
CREATE TABLE settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value LONGTEXT,
    setting_type ENUM('string', 'integer', 'boolean', 'json') DEFAULT 'string',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_setting_key (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===== Insert Sample Services =====
INSERT INTO services (name, code, description, category, price, duration_minutes, requires_fasting) VALUES
('الفحص الأولي للطوارئ', 'ER-001', 'فحص أولي سريع وتقييم الحالة', 'emergency', 0, 15, FALSE),
('فحص الدم العام', 'LAB-001', 'فحص شامل لمكونات الدم', 'laboratory', 50, 10, TRUE),
('فحص البول', 'LAB-002', 'تحليل عينة البول', 'laboratory', 30, 5, FALSE),
('قياس الكوليسترول', 'LAB-003', 'قياس مستويات الكوليسترول', 'laboratory', 60, 10, TRUE),
('قياس السكري', 'LAB-004', 'فحص مستوى السكر في الدم', 'laboratory', 40, 10, TRUE),
('الفحص الشامل', 'LAB-005', 'فحص كامل للكبد والكلى والدم', 'laboratory', 200, 30, TRUE),
('أشعة عادية (X-ray)', 'RAD-001', 'تصوير بالأشعة السينية', 'radiology', 40, 20, FALSE),
('الموجات فوق الصوتية', 'RAD-002', 'فحص بالموجات فوق الصوتية', 'radiology', 100, 25, FALSE),
('أشعة مقطعية (CT)', 'RAD-003', 'تصوير مقطعي محوسب', 'radiology', 300, 45, FALSE),
('رنين مغناطيسي (MRI)', 'RAD-004', 'تصوير بالرنين المغناطيسي', 'radiology', 500, 60, FALSE);

-- ===== Insert Default Settings =====
INSERT INTO settings (setting_key, setting_value, setting_type) VALUES
('clinic_name', 'مركز يطا الطبي', 'string'),
('clinic_email', 'info@yatta-medical.ps', 'string'),
('clinic_phone', '+970-XXXXXXX', 'string'),
('clinic_address', 'يطا، فلسطين', 'string'),
('clinic_hours_open', '08:00', 'string'),
('clinic_hours_close', '20:00', 'string'),
('emergency_hours_open', '00:00', 'string'),
('emergency_hours_close', '23:59', 'string'),
('currency', 'ILS', 'string'),
('timezone', 'Asia/Jerusalem', 'string'),
('appointment_reminder_hours', '24', 'integer'),
('max_appointments_per_day', '100', 'integer'),
('enable_online_payments', '1', 'boolean'),
('enable_patient_portal', '1', 'boolean'),
('data_retention_days', '2555', 'integer');

-- ===== Create Indexes for Performance =====
CREATE INDEX idx_appointments_datetime ON appointments(appointment_datetime);
CREATE INDEX idx_patients_email ON patients(email);
CREATE INDEX idx_staff_email ON staff(email);
CREATE INDEX idx_payments_status_date ON payments(status, paid_at);
CREATE INDEX idx_radiology_patient_date ON radiology_exams(patient_id, exam_date);
CREATE INDEX idx_lab_patient_date ON lab_tests(patient_id, created_at);

-- ===== Security - Create Views for Data Protection =====

-- View for patient's own data (for portal access)
CREATE VIEW v_patient_data AS
SELECT
    id, first_name, last_name, email, phone,
    date_of_birth, gender, address, city,
    emergency_contact_name, emergency_contact_phone,
    insurance_provider, insurance_number,
    created_at, updated_at
FROM patients
WHERE status = 'active';

-- View for appointments (protected)
CREATE VIEW v_appointments_summary AS
SELECT
    a.id, a.patient_id, a.appointment_date, a.appointment_time,
    s.name as service_name, s.category as service_category,
    a.status, a.notes, a.created_at
FROM appointments a
JOIN services s ON a.service_id = s.id
WHERE a.status != 'cancelled';

-- ===== Database Permissions Template =====
-- Note: Uncomment and configure based on your setup

-- Create application user (read-only for some operations)
-- CREATE USER 'medical_app'@'localhost' IDENTIFIED BY 'secure_password_here';
-- GRANT SELECT, INSERT, UPDATE ON medical_center_db.* TO 'medical_app'@'localhost';
-- GRANT SELECT ON medical_center_db.v_patient_data TO 'medical_app'@'localhost';

-- Create admin user (full access)
-- CREATE USER 'medical_admin'@'localhost' IDENTIFIED BY 'admin_secure_password';
-- GRANT ALL PRIVILEGES ON medical_center_db.* TO 'medical_admin'@'localhost';

-- Refresh privileges
-- FLUSH PRIVILEGES;

-- ===== Backup and Recovery =====
-- Regular backups are recommended:
-- mysqldump -u root -p medical_center_db > backup_`date +%Y%m%d_%H%M%S`.sql

-- Recovery from backup:
-- mysql -u root -p medical_center_db < backup_file.sql

-- ===== Database Statistics =====
SELECT
    'Medical Center Database' as database_name,
    table_schema,
    COUNT(*) as table_count,
    SUM(data_length + index_length) / 1024 / 1024 as size_mb
FROM information_schema.tables
WHERE table_schema = 'medical_center_db'
GROUP BY table_schema;