-- One-off cleanup of demo/dummy products. NOT in scripts/migrations/ on purpose:
-- migrations re-run on every deploy, this must be run by hand after checking step 1.
--
-- Rule: a product is "demo" if it has no SKU (products imported from BigSeller /
-- the Excel template always carry a SKU) AND no past order references it.
-- Adjust the WHERE clause in the three places below if your real products have no SKU.
--
-- Run:  docker exec -i meepro-mariadb mariadb -u root -p meepro_petshop < scripts/cleanup-demo-products.sql

-- 1) PREVIEW: review this list first. Stop here if any row is a real product.
SELECT p.id, p.name, p.sku, p.stock, p.createdAt
FROM products p
WHERE (p.sku IS NULL OR p.sku = '')
  AND NOT EXISTS (SELECT 1 FROM order_items oi WHERE oi.productId = p.id)
ORDER BY p.id;

-- 2) DELETE: remove the comment markers (the "-- " prefix) on the block below to execute it.
-- START TRANSACTION;
-- CREATE TEMPORARY TABLE demo_ids AS
--   SELECT p.id FROM products p
--   WHERE (p.sku IS NULL OR p.sku = '')
--     AND NOT EXISTS (SELECT 1 FROM order_items oi WHERE oi.productId = p.id);
-- DELETE FROM product_images        WHERE productId IN (SELECT id FROM demo_ids);
-- DELETE FROM product_variants      WHERE productId IN (SELECT id FROM demo_ids);
-- DELETE FROM product_bundle_items  WHERE bundleProductId IN (SELECT id FROM demo_ids) OR componentProductId IN (SELECT id FROM demo_ids);
-- DELETE FROM products              WHERE id IN (SELECT id FROM demo_ids);
-- DROP TEMPORARY TABLE demo_ids;
-- COMMIT;
