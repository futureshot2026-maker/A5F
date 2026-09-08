<?php
/**
 * Medical Center Website Configuration
 * قاعدة الإعدادات - نسخة مثال
 *
 * انسخ هذا الملف إلى config.php وعدّل البيانات
 */

// ===== Database Configuration =====
define('DB_HOST', 'localhost');
define('DB_USER', 'medical_app');
define('DB_PASS', 'secure_password_here');
define('DB_NAME', 'medical_center_db');
define('DB_PORT', 3306);
define('DB_CHARSET', 'utf8mb4');

// ===== Site Configuration =====
define('SITE_URL', 'https://yatta-medical.ps');
define('SITE_NAME', 'مركز طبي يطا');
define('SITE_EMAIL', 'info@yatta-medical.ps');
define('SITE_PHONE', '+970-XXXXXXX');
define('SITE_ADDRESS', 'يطا، فلسطين');

// ===== Security Configuration =====
define('ENCRYPTION_KEY', 'your-random-encryption-key-here-min-32-chars');
define('JWT_SECRET', 'your-jwt-secret-key-here-min-32-chars');
define('HASH_ALGORITHM', 'bcrypt');
define('HASH_COST', 12); // bcrypt cost (higher = more secure but slower)

// ===== Session Configuration =====
define('SESSION_LIFETIME', 3600); // 1 hour in seconds
define('SESSION_SECURE', true); // Only send over HTTPS
define('SESSION_HTTP_ONLY', true); // JS cannot access cookies
define('SESSION_SAME_SITE', 'Strict'); // CSRF protection

// ===== Email Configuration =====
define('EMAIL_HOST', 'smtp.gmail.com'); // or your email provider
define('EMAIL_PORT', 587);
define('EMAIL_USER', 'your-email@gmail.com');
define('EMAIL_PASS', 'your-email-password');
define('EMAIL_FROM', 'noreply@yatta-medical.ps');
define('EMAIL_FROM_NAME', 'مركز يطا الطبي');

// ===== SMS Configuration (Twillio or similar) =====
define('SMS_ENABLED', false);
define('SMS_PROVIDER', 'twillio'); // twillio, vonage, etc
define('SMS_API_KEY', 'your-sms-api-key');
define('SMS_API_SECRET', 'your-sms-api-secret');

// ===== Payment Gateway Configuration =====
define('PAYMENT_GATEWAY', 'stripe'); // stripe, paypal, 2checkout
define('PAYMENT_API_KEY', 'pk_test_your_stripe_key');
define('PAYMENT_SECRET_KEY', 'sk_test_your_stripe_secret');
define('PAYMENT_CURRENCY', 'ILS'); // Israeli Shekel or your currency

// ===== File Upload Configuration =====
define('MAX_UPLOAD_SIZE', 52428800); // 50MB in bytes
define('ALLOWED_FILE_TYPES', ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx']);
define('UPLOAD_DIR', __DIR__ . '/uploads/');
define('TEMP_DIR', __DIR__ . '/temp/');

// ===== Backup Configuration =====
define('BACKUP_ENABLED', true);
define('BACKUP_FREQUENCY', 'daily'); // daily, weekly, monthly
define('BACKUP_RETENTION_DAYS', 90); // Keep backups for 90 days
define('BACKUP_PATH', __DIR__ . '/backups/');

// ===== Logging Configuration =====
define('LOG_ENABLED', true);
define('LOG_LEVEL', 'INFO'); // DEBUG, INFO, WARNING, ERROR, CRITICAL
define('LOG_DIR', __DIR__ . '/logs/');
define('LOG_MAX_SIZE', 104857600); // 100MB

// ===== Error Handling =====
define('DEBUG_MODE', false); // Set to true only in development
define('SHOW_ERRORS', DEBUG_MODE);
define('LOG_ERRORS', true);

// ===== Security Headers =====
define('ENABLE_CSP', true); // Content Security Policy
define('ENABLE_HSTS', true); // HTTP Strict Transport Security
define('ENABLE_X_FRAME_OPTIONS', true);
define('ENABLE_X_CONTENT_TYPE', true);

// ===== CORS Configuration =====
define('CORS_ENABLED', true);
define('CORS_ORIGINS', ['https://yatta-medical.ps', 'https://www.yatta-medical.ps']);
define('CORS_METHODS', ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']);
define('CORS_CREDENTIALS', true);

// ===== Rate Limiting =====
define('RATE_LIMIT_ENABLED', true);
define('RATE_LIMIT_REQUESTS', 100); // max requests
define('RATE_LIMIT_WINDOW', 3600); // per 1 hour

// ===== Google Analytics (Optional) =====
define('GA_ENABLED', false);
define('GA_TRACKING_ID', 'UA-XXXXXXXXX-X');

// ===== Google reCAPTCHA (Optional) =====
define('RECAPTCHA_ENABLED', true);
define('RECAPTCHA_SITE_KEY', 'your-recaptcha-site-key');
define('RECAPTCHA_SECRET_KEY', 'your-recaptcha-secret-key');

// ===== Two-Factor Authentication =====
define('2FA_ENABLED', true);
define('2FA_PROVIDER', 'google-authenticator'); // google-authenticator, authy

// ===== API Configuration =====
define('API_VERSION', 'v1');
define('API_RATE_LIMIT', 1000); // per hour
define('API_TIMEOUT', 30); // seconds

// ===== Frontend Configuration =====
define('FRONTEND_ENV', 'production'); // production, staging, development
define('ENABLE_PWA', true); // Progressive Web App
define('ENABLE_OFFLINE_MODE', true);

// ===== Database Connection Function =====
function getDatabaseConnection() {
    try {
        $dsn = sprintf(
            'mysql:host=%s;port=%d;dbname=%s;charset=%s',
            DB_HOST,
            DB_PORT,
            DB_NAME,
            DB_CHARSET
        );

        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ];

        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        return $pdo;

    } catch (PDOException $e) {
        error_log('Database Connection Error: ' . $e->getMessage());
        die('Database connection failed');
    }
}

// ===== Helper Functions =====

/**
 * Encrypt sensitive data
 */
function encryptData($data) {
    $cipher = 'AES-256-CBC';
    $key = hash('sha256', ENCRYPTION_KEY, true);
    $iv = openssl_random_pseudo_bytes(openssl_cipher_iv_length($cipher));

    $encrypted = openssl_encrypt($data, $cipher, $key, false, $iv);
    return base64_encode($iv . $encrypted);
}

/**
 * Decrypt sensitive data
 */
function decryptData($data) {
    $cipher = 'AES-256-CBC';
    $key = hash('sha256', ENCRYPTION_KEY, true);

    $data = base64_decode($data);
    $iv = substr($data, 0, openssl_cipher_iv_length($cipher));
    $encrypted = substr($data, openssl_cipher_iv_length($cipher));

    return openssl_decrypt($encrypted, $cipher, $key, false, $iv);
}

/**
 * Hash password using bcrypt
 */
function hashPassword($password) {
    return password_hash($password, PASSWORD_BCRYPT, ['cost' => HASH_COST]);
}

/**
 * Verify password
 */
function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}

/**
 * Generate JWT Token
 */
function generateJWT($data, $expiresIn = 3600) {
    $header = json_encode(['alg' => 'HS256', 'typ' => 'JWT']);
    $payload = json_encode(array_merge($data, ['exp' => time() + $expiresIn]));

    $header = base64_encode($header);
    $payload = base64_encode($payload);

    $signature = base64_encode(hash_hmac('sha256', "$header.$payload", JWT_SECRET, true));

    return "$header.$payload.$signature";
}

/**
 * Verify JWT Token
 */
function verifyJWT($token) {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return false;

    list($header, $payload, $signature) = $parts;

    $validSignature = base64_encode(hash_hmac('sha256', "$header.$payload", JWT_SECRET, true));

    if ($signature !== $validSignature) return false;

    $data = json_decode(base64_decode($payload), true);

    if ($data['exp'] < time()) return false;

    return $data;
}

/**
 * Set security headers
 */
function setSecurityHeaders() {
    if (ENABLE_CSP) {
        header("Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;");
    }

    if (ENABLE_HSTS) {
        header("Strict-Transport-Security: max-age=31536000; includeSubDomains; preload");
    }

    if (ENABLE_X_FRAME_OPTIONS) {
        header("X-Frame-Options: DENY");
    }

    if (ENABLE_X_CONTENT_TYPE) {
        header("X-Content-Type-Options: nosniff");
    }

    header("X-UA-Compatible: IE=Edge");
    header("Referrer-Policy: strict-origin-when-cross-origin");
    header("Permissions-Policy: geolocation=(), microphone=(), camera=()");
}

// Set security headers on every request
setSecurityHeaders();

// Initialize PHP session with secure settings
ini_set('session.cookie_secure', SESSION_SECURE ? 1 : 0);
ini_set('session.cookie_httponly', SESSION_HTTP_ONLY ? 1 : 0);
ini_set('session.cookie_samesite', SESSION_SAME_SITE);

// Enable error logging
if (LOG_ERRORS) {
    ini_set('log_errors', 1);
    ini_set('error_log', LOG_DIR . 'errors.log');
}

// Timezone
date_default_timezone_set('Asia/Jerusalem');

// Display errors only in debug mode
if (!DEBUG_MODE) {
    ini_set('display_errors', 0);
    error_reporting(E_ALL);
}

?>
