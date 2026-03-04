const mariadb = require('mariadb');

async function main() {
  console.log('🌱 เริ่ม Seed ข้อมูลตัวอย่าง MeePro PetShop...\n');

  const conn = await mariadb.createConnection({
    socketPath: '/Applications/XAMPP/xamppfiles/var/mysql/mysql.sock',
    user: 'root',
    password: '',
    database: 'meepro_petshop',
  });

  // ==========================================
  // 1. สร้างหมวดหมู่
  // ==========================================
  console.log('📁 สร้างหมวดหมู่...');
  const categories = [
    { name: 'อาหารแมว', slug: 'cat-food', description: 'อาหารแมวคุณภาพสูง ครบทุกสารอาหาร', sortOrder: 1 },
    { name: 'ขนมแมว', slug: 'cat-treats', description: 'ขนมแมวแสนอร่อย ให้รางวัลน้องเหมียว', sortOrder: 2 },
    { name: 'ทรายแมว', slug: 'cat-litter', description: 'ทรายแมวดับกลิ่น จับตัวเป็นก้อน', sortOrder: 3 },
    { name: 'ของเล่นแมว', slug: 'cat-toys', description: 'ของเล่นช่วยคลายเครียด ออกกำลังกาย', sortOrder: 4 },
    { name: 'อุปกรณ์อาบน้ำ', slug: 'grooming', description: 'แชมพู สบู่ อุปกรณ์ดูแลความสะอาด', sortOrder: 5 },
    { name: 'ที่นอนแมว', slug: 'cat-beds', description: 'ที่นอนแมวนุ่มสบาย หลับสนิท', sortOrder: 6 },
    { name: 'อุปกรณ์ให้อาหาร', slug: 'feeding', description: 'ชามอาหาร น้ำพุแมว อุปกรณ์ให้อาหาร', sortOrder: 7 },
  ];

  for (const cat of categories) {
    const [existing] = await conn.query('SELECT id FROM categories WHERE slug = ?', [cat.slug]);
    if (!existing) {
      await conn.query(
        'INSERT INTO categories (name, slug, description, sortOrder, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, 1, NOW(), NOW())',
        [cat.name, cat.slug, cat.description, cat.sortOrder]
      );
    }
  }
  const catRows = await conn.query('SELECT id, slug FROM categories ORDER BY sortOrder');
  const catMap = {};
  catRows.forEach(r => { catMap[r.slug] = r.id; });
  console.log(`  ✅ หมวดหมู่ ${Object.keys(catMap).length} รายการ`);

  // ==========================================
  // 2. สร้างแบรนด์
  // ==========================================
  console.log('🏷️ สร้างแบรนด์...');
  const brands = [
    { name: 'Royal Canin', slug: 'royal-canin' },
    { name: 'Whiskas', slug: 'whiskas' },
    { name: 'Me-O', slug: 'me-o' },
    { name: 'Catit', slug: 'catit' },
    { name: 'Kit Cat', slug: 'kit-cat' },
    { name: 'Ciao', slug: 'ciao' },
    { name: 'Purrfect', slug: 'purrfect' },
  ];

  for (const br of brands) {
    const [existing] = await conn.query('SELECT id FROM brands WHERE slug = ?', [br.slug]);
    if (!existing) {
      await conn.query('INSERT INTO brands (name, slug, isActive, createdAt, updatedAt) VALUES (?, ?, 1, NOW(), NOW())', [br.name, br.slug]);
    }
  }
  const brandRows = await conn.query('SELECT id, slug FROM brands');
  const brandMap = {};
  brandRows.forEach(r => { brandMap[r.slug] = r.id; });
  console.log(`  ✅ แบรนด์ ${Object.keys(brandMap).length} รายการ`);

  // ==========================================
  // 3. สร้างสินค้า
  // ==========================================
  console.log('📦 สร้างสินค้า...');
  const products = [
    { name: 'Royal Canin Indoor Adult อาหารแมวโต เลี้ยงในบ้าน', slug: 'royal-canin-indoor-adult', price: 690, comparePrice: 790, stock: 150, weight: '2 kg', catSlug: 'cat-food', brandSlug: 'royal-canin', isFeatured: 1, rating: 4.8, reviewCount: 156, salesCount: 320, tags: 'แมวโต,indoor,premium', description: 'อาหารแมวโตเลี้ยงในบ้าน สูตรพิเศษช่วยควบคุมน้ำหนัก ลดกลิ่นอุจจาระ บำรุงขนสวย', shortDesc: 'อาหารแมวโต Indoor สูตรพิเศษ', variants: [{ name: 'น้ำหนัก', value: '2 kg', pa: 0, st: 80 }, { name: 'น้ำหนัก', value: '4 kg', pa: 510, st: 50 }, { name: 'น้ำหนัก', value: '10 kg', pa: 1710, st: 20 }] },
    { name: 'Whiskas อาหารแมว รสปลาทู', slug: 'whiskas-mackerel', price: 299, comparePrice: 350, stock: 200, weight: '3 kg', catSlug: 'cat-food', brandSlug: 'whiskas', isFeatured: 1, rating: 4.5, reviewCount: 230, salesCount: 450, tags: 'แมวโต,ปลาทู,ประหยัด', description: 'อาหารแมวรสปลาทู อร่อยถูกใจน้องเหมียว สารอาหารครบ', shortDesc: 'อาหารแมวรสปลาทู', variants: [{ name: 'น้ำหนัก', value: '1.2 kg', pa: -120, st: 100 }, { name: 'น้ำหนัก', value: '3 kg', pa: 0, st: 80 }] },
    { name: 'Royal Canin Kitten อาหารลูกแมว', slug: 'royal-canin-kitten', price: 599, comparePrice: 680, stock: 100, weight: '2 kg', catSlug: 'cat-food', brandSlug: 'royal-canin', isFeatured: 1, rating: 4.9, reviewCount: 89, salesCount: 180, tags: 'ลูกแมว,kitten,premium', description: 'อาหารลูกแมว อายุ 4-12 เดือน สูตรบำรุงการเจริญเติบโต', shortDesc: 'อาหารลูกแมว 4-12 เดือน', variants: [{ name: 'น้ำหนัก', value: '2 kg', pa: 0, st: 60 }, { name: 'น้ำหนัก', value: '4 kg', pa: 400, st: 40 }] },
    { name: 'Me-O อาหารแมว รสทูน่า', slug: 'me-o-tuna', price: 189, comparePrice: 220, stock: 300, weight: '1.2 kg', catSlug: 'cat-food', brandSlug: 'me-o', isFeatured: 0, rating: 4.2, reviewCount: 342, salesCount: 600, tags: 'ทูน่า,ประหยัด', description: 'อาหารแมวรสทูน่า อร่อยครบอาหาร ราคาประหยัด', shortDesc: 'อาหารแมวรสทูน่า ราคาประหยัด', variants: [] },
    { name: 'Ciao Churu ขนมแมวเลีย รสทูน่า', slug: 'ciao-churu-tuna', price: 89, comparePrice: 110, stock: 500, weight: '56 g', catSlug: 'cat-treats', brandSlug: 'ciao', isFeatured: 1, rating: 4.7, reviewCount: 520, salesCount: 1200, tags: 'ขนมเลีย,ทูน่า,ยอดนิยม', description: 'ขนมแมวเลียยอดนิยม รสทูน่า 4 ซอง ทำจากเนื้อปลาแท้', shortDesc: 'ขนมแมวเลีย 4 ซอง', variants: [{ name: 'รสชาติ', value: 'ทูน่า', pa: 0, st: 200 }, { name: 'รสชาติ', value: 'ไก่', pa: 0, st: 200 }, { name: 'รสชาติ', value: 'ปลาแซลมอน', pa: 10, st: 100 }] },
    { name: 'Kit Cat ขนมแมว Freezebites ไก่', slug: 'kit-cat-freezebites', price: 129, comparePrice: 159, stock: 150, weight: '15 g', catSlug: 'cat-treats', brandSlug: 'kit-cat', isFeatured: 1, rating: 4.6, reviewCount: 78, salesCount: 200, tags: 'ขนม,ไก่,freezedried', description: 'ขนมแมวฟรีซดราย เนื้อไก่แท้ 100% ไม่มีสารเจือปน', shortDesc: 'ขนมแมวเนื้อไก่แท้ 100%', variants: [] },
    { name: 'Whiskas Temptations ขนมแมวกรุบกรอบ', slug: 'whiskas-temptations', price: 79, comparePrice: 99, stock: 250, weight: '75 g', catSlug: 'cat-treats', brandSlug: 'whiskas', isFeatured: 0, rating: 4.3, reviewCount: 180, salesCount: 350, tags: 'ขนม,กรุบกรอบ', description: 'ขนมแมวกรุบข้างนอก นุ่มข้างใน รสชาติที่แมวหลงรัก', shortDesc: 'ขนมแมวกรุบกรอบ', variants: [] },
    { name: 'Kit Cat Soya Clump ทรายแมวเต้าหู้ ลาเวนเดอร์', slug: 'kit-cat-soya-lavender', price: 199, comparePrice: 250, stock: 180, weight: '7 L', catSlug: 'cat-litter', brandSlug: 'kit-cat', isFeatured: 1, rating: 4.4, reviewCount: 95, salesCount: 280, tags: 'ทรายเต้าหู้,ลาเวนเดอร์,ดับกลิ่น', description: 'ทรายแมวเต้าหู้ กลิ่นลาเวนเดอร์ จับตัวเป็นก้อนเร็ว ทิ้งลงชักโครกได้', shortDesc: 'ทรายแมวเต้าหู้ กลิ่นลาเวนเดอร์', variants: [{ name: 'ขนาด', value: '7 L', pa: 0, st: 100 }] },
    { name: 'Catit Play Circuit ของเล่นรางบอล', slug: 'catit-play-circuit', price: 349, comparePrice: 450, stock: 50, weight: '500 g', catSlug: 'cat-toys', brandSlug: 'catit', isFeatured: 1, rating: 4.6, reviewCount: 42, salesCount: 90, tags: 'ของเล่น,รางบอล,ออกกำลังกาย', description: 'ของเล่นรางบอลให้แมวเล่น กระตุ้นสัญชาตญาณ ช่วยออกกำลังกาย', shortDesc: 'ของเล่นรางบอลสำหรับแมว', variants: [] },
    { name: 'ตัวหนูของเล่นแมว (แพ็ค 10)', slug: 'mouse-toy-pack-10', price: 99, comparePrice: 150, stock: 300, weight: '100 g', catSlug: 'cat-toys', brandSlug: 'purrfect', isFeatured: 0, rating: 4.1, reviewCount: 67, salesCount: 150, tags: 'หนู,ของเล่น,ราคาถูก', description: 'ของเล่นตัวหนูจำลอง มีกระดิ่ง แพ็ค 10 ตัว ราคาคุ้ม', shortDesc: 'ตัวหนูของเล่น แพ็ค 10', variants: [{ name: 'สี', value: 'คละสี', pa: 0, st: 300 }] },
    { name: 'แชมพูอาบน้ำแมว สูตรอ่อนโยน', slug: 'gentle-cat-shampoo', price: 179, comparePrice: 220, stock: 120, weight: '500 ml', catSlug: 'grooming', brandSlug: 'purrfect', isFeatured: 0, rating: 4.3, reviewCount: 55, salesCount: 130, tags: 'แชมพู,อาบน้ำ,อ่อนโยน', description: 'แชมพูสูตรอ่อนโยน ไม่ระคายเคืองผิว กลิ่นหอมสดชื่น', shortDesc: 'แชมพูแมวสูตรอ่อนโยน', variants: [] },
    { name: 'ที่นอนแมวทรงโดนัท นุ่มพิเศษ', slug: 'donut-cat-bed', price: 399, comparePrice: 550, stock: 60, weight: '800 g', catSlug: 'cat-beds', brandSlug: 'purrfect', isFeatured: 1, rating: 4.8, reviewCount: 38, salesCount: 75, tags: 'ที่นอน,โดนัท,นุ่ม', description: 'ที่นอนแมวทรงโดนัท เนื้อผ้านุ่มพิเศษ กันลื่น หลับสนิท', shortDesc: 'ที่นอนแมวทรงโดนัท', variants: [{ name: 'สี', value: 'เทา', pa: 0, st: 20 }, { name: 'สี', value: 'ชมพู', pa: 0, st: 20 }, { name: 'สี', value: 'น้ำตาล', pa: 0, st: 20 }] },
    { name: 'Catit Flower น้ำพุแมว 3 ลิตร', slug: 'catit-flower-fountain', price: 890, comparePrice: 1100, stock: 40, weight: '1 kg', catSlug: 'feeding', brandSlug: 'catit', isFeatured: 1, rating: 4.7, reviewCount: 62, salesCount: 95, tags: 'น้ำพุ,ดื่มน้ำ,สุขภาพ', description: 'น้ำพุสำหรับแมว ดีไซน์ดอกไม้ กรองน้ำสะอาด กระตุ้นให้แมวดื่มน้ำ', shortDesc: 'น้ำพุแมว ดีไซน์ดอกไม้', variants: [] },
    { name: 'ชามอาหารแมว สแตนเลส (แพ็คคู่)', slug: 'stainless-bowl-pair', price: 149, comparePrice: 199, stock: 200, weight: '300 g', catSlug: 'feeding', brandSlug: 'purrfect', isFeatured: 0, rating: 4.4, reviewCount: 28, salesCount: 65, tags: 'ชาม,สแตนเลส,ทนทาน', description: 'ชามอาหารแมวสแตนเลส ล้างง่าย ทนทาน กันลื่น แพ็คคู่สุดคุ้ม', shortDesc: 'ชามสแตนเลส แพ็คคู่', variants: [] },
    { name: 'Ciao ขนมแมวเลีย รสไก่', slug: 'ciao-churu-chicken', price: 89, comparePrice: 110, stock: 400, weight: '56 g', catSlug: 'cat-treats', brandSlug: 'ciao', isFeatured: 0, rating: 4.6, reviewCount: 410, salesCount: 900, tags: 'ขนมเลีย,ไก่', description: 'ขนมแมวเลีย รสไก่ อร่อยจนเลียจาน 4 ซอง', shortDesc: 'ขนมแมวเลีย รสไก่', variants: [] },
    { name: 'Royal Canin Urinary Care อาหารแมวดูแลทางเดินปัสสาวะ', slug: 'royal-canin-urinary', price: 799, comparePrice: 890, stock: 80, weight: '2 kg', catSlug: 'cat-food', brandSlug: 'royal-canin', isFeatured: 0, rating: 4.7, reviewCount: 65, salesCount: 110, tags: 'urinary,สุขภาพ,premium', description: 'อาหารแมวสูตรดูแลระบบทางเดินปัสสาวะ ป้องกันนิ่ว', shortDesc: 'อาหารแมว Urinary Care', variants: [] },
  ];

  for (const p of products) {
    const [existing] = await conn.query('SELECT id FROM products WHERE slug = ?', [p.slug]);
    if (!existing) {
      const result = await conn.query(
        `INSERT INTO products (name, slug, description, shortDesc, price, comparePrice, stock, weight, isFeatured, isActive, status, rating, reviewCount, salesCount, categoryId, brandId, tags, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'available', ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [p.name, p.slug, p.description, p.shortDesc, p.price, p.comparePrice, p.stock, p.weight, p.isFeatured, p.rating, p.reviewCount, p.salesCount, catMap[p.catSlug], brandMap[p.brandSlug], p.tags]
      );
      const productId = Number(result.insertId);

      // Insert product image
      await conn.query(
        'INSERT INTO product_images (productId, url, alt, sortOrder, isMain) VALUES (?, ?, ?, 0, 1)',
        [productId, `/assets/img/product-images/${p.slug}.jpg`, p.name]
      );

      // Insert variants
      for (const v of p.variants) {
        await conn.query(
          'INSERT INTO product_variants (productId, name, value, priceAdjust, stock, isActive) VALUES (?, ?, ?, ?, ?, 1)',
          [productId, v.name, v.value, v.pa, v.st]
        );
      }
    }
  }
  console.log(`  ✅ สินค้า ${products.length} รายการ`);

  // ==========================================
  // 4. สร้าง SiteConfig
  // ==========================================
  console.log('⚙️ สร้างค่าตั้งค่า...');
  const configs = [
    { key: 'shop_name', value: 'MeePro PetShop', group: 'shop' },
    { key: 'shop_phone', value: '02-123-4567', group: 'shop' },
    { key: 'shop_email', value: 'contact@meepro.com', group: 'shop' },
    { key: 'available_colors', value: 'ดำ,ขาว,น้ำตาล,เทา,ชมพู,ฟ้า,แดง,เขียว,ส้ม', group: 'product' },
    { key: 'available_sizes', value: 'XS,S,M,L,XL,XXL', group: 'product' },
    { key: 'available_weights', value: '100g,250g,500g,1kg,2kg,3kg,5kg,10kg', group: 'product' },
    { key: 'available_flavors', value: 'ไก่,ปลาทู,ปลาทูน่า,ปลาแซลมอน,เนื้อ,กุ้ง,ทะเล', group: 'product' },
    { key: 'free_shipping_min', value: '500', group: 'shipping' },
    { key: 'shipping_fee', value: '50', group: 'shipping' },
  ];
  for (const c of configs) {
    const [existing] = await conn.query('SELECT id FROM site_configs WHERE `key` = ?', [c.key]);
    if (existing) {
      await conn.query('UPDATE site_configs SET value = ? WHERE `key` = ?', [c.value, c.key]);
    } else {
      await conn.query('INSERT INTO site_configs (`key`, value, `group`) VALUES (?, ?, ?)', [c.key, c.value, c.group]);
    }
  }
  console.log(`  ✅ ค่าตั้งค่า ${configs.length} รายการ`);

  console.log('\n🎉 Seed เสร็จสมบูรณ์!');
  await conn.end();
}

main().catch((e) => { console.error('❌ Error:', e); process.exit(1); });
