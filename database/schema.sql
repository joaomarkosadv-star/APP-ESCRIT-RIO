-- Schema do banco de dados — De Carli Advocacia — Sistema Interno
-- Execute este arquivo para criar a estrutura do banco do zero

CREATE DATABASE IF NOT EXISTS `escritorio_db`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `escritorio_db`;

-- Tabela de usuários do sistema
CREATE TABLE IF NOT EXISTS `users` (
  `id`            INT AUTO_INCREMENT PRIMARY KEY,
  `name`          VARCHAR(150) NOT NULL,
  `email`         VARCHAR(150) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `profile`       ENUM('administrador','advogado','financeiro','comercial','estagiario') NOT NULL,
  `is_active`     TINYINT(1) NOT NULL DEFAULT 1,
  `created_at`    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
