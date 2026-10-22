-- One-off cleanup: keep only products that came from the BigSeller import.
-- NOT in scripts/migrations/ on purpose: migrations re-run on every deploy, this must be run by hand.
--
-- Rule: BigSeller / Excel-template imports always carry a SKU, so every product with no SKU is
-- treated as demo data and removed, INCLUDING their order history (order_items, and orders left empty).
--
-- Run:  docker exec -i meepro-mariadb mariadb -u root -p meepro_petshop < scripts/cleanup-demo-products.sql

-- 1) PREVIEW: check this list first. Stop here if any row is a real product.
SELECT p.id, p.name, p.sku, p.stock, p.createdAt,
       (SELECT COUNT(*) FROM order_items oi WHERE oi.productId = p.id) AS orderLines
FROM products p
WHERE p.sku IS NULL OR p.sku = ''
ORDER BY p.id;

-- 2) DELETE: remove the "-- " prefix from the block below to execute it.
-- START TRANSACTION;
-- CREATE TEMPORARY TABLE demo_ids AS SELECT id FROM products WHERE sku IS NULL OR sku = '';
-- DELETE FROM order_items          WHERE productId IN (SELECT id FROM demo_ids);
-- DELETE FROM orders               WHERE id NOT IN (SELECT DISTINCT orderId FROM order_items);
-- DELETE FROM product_images       WHERE productId IN (SELECT id FROM demo_ids);
-- DELETE FROM product_variants     WHERE productId IN (SELECT id FROM demo_ids);
-- DELETE FROM product_bundle_items WHERE bundleProductId IN (SELECT id FROM demo_ids) OR componentProductId IN (SELECT id FROM demo_ids);
-- DELETE FROM products             WHERE id IN (SELECT id FROM demo_ids);
-- DROP TEMPORARY TABLE demo_ids;
-- COMMIT;
