-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL
);

-- Insert default admin user if not exists
INSERT IGNORE INTO users (username, password, email, role, is_active)
VALUES ('admin', 'admin', 'admin@example.com', 'admin', TRUE);

-- Insert default regular user if not exists
INSERT IGNORE INTO users (username, password, email, role, is_active)
VALUES ('user', 'user', 'user@example.com', 'user', TRUE);
