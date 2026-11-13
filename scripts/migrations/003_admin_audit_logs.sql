-- Admin activity log: who changed what, when. Append-only; no foreign keys so a log row
-- survives deletion of the admin user or the record it describes.
-- Idempotent (CREATE TABLE IF NOT EXISTS) and touches no existing table, so it is safe to re-run on every deploy.

CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  adminId INT NULL,
  username VARCHAR(100) NOT NULL,
  action VARCHAR(40) NOT NULL,
  entity VARCHAR(40) NOT NULL,
  entityId VARCHAR(64) NULL,
  summary VARCHAR(500) NOT NULL,
  changes LONGTEXT NULL,
  ip VARCHAR(64) NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_created (createdAt),
  KEY idx_admin (adminId, createdAt),
  KEY idx_entity (entity, entityId)
);
