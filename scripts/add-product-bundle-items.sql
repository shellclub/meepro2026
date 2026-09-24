-- Adds bundle/kit support: a bundle is a normal row in `products` (ประเภทSKU = "Bundle SKU"),
-- composed of other products via this junction table.
-- Run once against the app database (not applied automatically):
--   mysql -u root -p meepro_petshop < scripts/add-product-bundle-items.sql

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
