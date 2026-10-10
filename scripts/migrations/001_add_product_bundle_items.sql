-- Adds bundle/kit support: a bundle is a normal row in `products` (ประเภทSKU = "Bundle SKU"),
-- composed of other products via this junction table.
--
-- Applied automatically on every deploy (.github/workflows/deploy.yml runs every file in
-- scripts/migrations/*.sql against the production DB after the containers come up; CREATE
-- TABLE IF NOT EXISTS makes re-running it a no-op).
--
-- To apply it manually instead (e.g. before the next deploy, or on a local/staging DB):
--   mysql -u root -p meepro_petshop < scripts/migrations/001_add_product_bundle_items.sql
-- or against the production container directly:
--   ssh <server> 'docker exec -i meepro-mariadb mariadb -u root -p"$DB_PASSWORD" meepro_petshop' < scripts/migrations/001_add_product_bundle_items.sql

CREATE TABLE IF NOT EXISTS product_bundle_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bundleProductId INT NOT NULL,
  componentProductId INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  costRatio DECIMAL(6,4) NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_bundle_component (bundleProductId, componentProductId),
  KEY idx_component (componentProductId),
  CONSTRAINT fk_bundle_product FOREIGN KEY (bundleProductId) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT fk_component_product FOREIGN KEY (componentProductId) REFERENCES products(id) ON DELETE CASCADE
);
