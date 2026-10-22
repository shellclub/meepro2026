import { execute } from '@/lib/db';

/**
 * Keep products.stock equal to the sum of its active variants' stock.
 * Products without active variants are left untouched.
 */
export async function syncProductStock(productId: number) {
  await execute(
    `UPDATE products p
     SET p.stock = (SELECT COALESCE(SUM(v.stock), 0) FROM product_variants v WHERE v.productId = p.id AND v.isActive = 1)
     WHERE p.id = ? AND EXISTS (SELECT 1 FROM product_variants v WHERE v.productId = p.id AND v.isActive = 1)`,
    [productId]
  );
}
