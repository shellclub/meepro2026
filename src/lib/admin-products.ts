// Shared by the admin product list, the Excel export and the Excel import so the three
// can never drift apart (same filters, same sort whitelist, same template columns).

export const PRODUCT_HEADERS = [
  "SKU*", "ชื่อสินค้า*", "หมวดหมู่", "แบรนด์", "ราคาขาย*", "ราคาเต็ม", "ราคาทุน",
  "จำนวนสต๊อก*", "น้ำหนัก/ขนาด", "หน่วย", "คำอธิบายสั้น", "คำอธิบายเต็ม",
  "แท็ก", "สถานะ", "สินค้าแนะนำ", "เปิดใช้งาน", "รูปภาพหลัก (URL)", "รูปภาพเพิ่มเติม (URL)",
] as const;

export const VARIANT_HEADERS = [
  "SKU สินค้า*", "ชื่อตัวเลือก*", "ค่า*", "ส่วนต่างราคา", "สต๊อกตัวเลือก", "SKU ตัวเลือก", "เปิดใช้งาน",
] as const;

// Whitelisted sort columns (never interpolate user input into ORDER BY directly).
// Thai names/categories sort with the DB collation; NULL categories always go last.
const SORT_SQL: Record<string, string> = {
  name: 'p.name',
  category: 'c.name IS NULL, c.name',
  status: 'p.isActive',
  price: 'p.price',
  stock: 'p.stock',
  createdAt: 'p.createdAt',
};

export function buildProductFilter(searchParams: URLSearchParams) {
  const search = searchParams.get('search') || '';
  const categoryId = searchParams.get('categoryId') || '';
  const status = searchParams.get('status') || '';

  let where = 'WHERE 1=1';
  const params: any[] = [];
  if (search) { where += ' AND (p.name LIKE ? OR p.sku LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
  if (categoryId === 'none') where += ' AND p.categoryId IS NULL';
  else if (categoryId) { where += ' AND p.categoryId = ?'; params.push(Number(categoryId)); }
  if (status === 'active') where += ' AND p.isActive = 1';
  else if (status === 'inactive') where += ' AND p.isActive = 0';

  const sortParam = searchParams.get('sort') || '';
  const sortKey = SORT_SQL[sortParam] ? sortParam : 'createdAt';
  const dir = searchParams.get('dir') === 'asc' ? 'ASC' : 'DESC';
  // Secondary keys keep pagination stable when the primary key has ties (e.g. many equal prices)
  const orderBy = sortKey === 'name'
    ? `p.name ${dir}, p.id ASC`
    : `${SORT_SQL[sortKey].split(',').map((c) => (c.includes('IS NULL') ? c : `${c.trim()} ${dir}`)).join(', ')}, p.name ASC, p.id ASC`;

  return { where, params, orderBy };
}
