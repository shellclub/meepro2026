import prisma from '../src/lib/prisma';

async function main() {
  console.log('🐱 Seeding MeePro Pet Shop database...');

  // ==========================================
  // Brands
  // ==========================================
  const brands = await Promise.all([
    prisma.brand.create({ data: { name: 'Royal Canin', slug: 'royal-canin' } }),
    prisma.brand.create({ data: { name: 'Whiskas', slug: 'whiskas' } }),
    prisma.brand.create({ data: { name: 'Me-O', slug: 'me-o' } }),
    prisma.brand.create({ data: { name: 'Kit Cat', slug: 'kit-cat' } }),
    prisma.brand.create({ data: { name: 'Catit', slug: 'catit' } }),
    prisma.brand.create({ data: { name: 'Purrfect', slug: 'purrfect' } }),
    prisma.brand.create({ data: { name: 'MeePro', slug: 'meepro' } }),
  ]);
  console.log(`✅ Created ${brands.length} brands`);

  // ==========================================
  // Categories
  // ==========================================
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'อาหารแมว',
        slug: 'cat-food',
        description: 'อาหารแมวคุณภาพดี ทั้งอาหารเม็ดและอาหารเปียก',
        image: '/assets/img/categories/cat-food.png',
        sortOrder: 1,
      },
    }),
    prisma.category.create({
      data: {
        name: 'ขนมแมว',
        slug: 'cat-treats',
        description: 'ขนมแมว ขนมขบเคี้ยว สแน็คแมว',
        image: '/assets/img/categories/cat-treats.png',
        sortOrder: 2,
      },
    }),
    prisma.category.create({
      data: {
        name: 'ทรายแมว',
        slug: 'cat-litter',
        description: 'ทรายแมวคุณภาพดี ดูดซับกลิ่น จับก้อนเร็ว',
        image: '/assets/img/categories/cat-litter.png',
        sortOrder: 3,
      },
    }),
    prisma.category.create({
      data: {
        name: 'ของเล่นแมว',
        slug: 'cat-toys',
        description: 'ของเล่นแมว หนูปลอม ลูกบอล ลวดล่อแมว',
        image: '/assets/img/categories/cat-toys.png',
        sortOrder: 4,
      },
    }),
    prisma.category.create({
      data: {
        name: 'อุปกรณ์อาบน้ำ',
        slug: 'grooming',
        description: 'แชมพู ครีมอาบน้ำ แปรงหวี สำหรับแมว',
        image: '/assets/img/categories/grooming.png',
        sortOrder: 5,
      },
    }),
    prisma.category.create({
      data: {
        name: 'ที่นอนแมว',
        slug: 'cat-beds',
        description: 'ที่นอนแมว เบาะแมว บ้านแมว คอนโดแมว',
        image: '/assets/img/categories/cat-beds.png',
        sortOrder: 6,
      },
    }),
    prisma.category.create({
      data: {
        name: 'อุปกรณ์ให้อาหาร',
        slug: 'feeding',
        description: 'ชามอาหาร ที่ให้น้ำ เครื่องให้อาหารอัตโนมัติ',
        image: '/assets/img/categories/feeding.png',
        sortOrder: 7,
      },
    }),
  ]);
  console.log(`✅ Created ${categories.length} categories`);

  // ==========================================
  // Products
  // ==========================================
  const products = [
    // อาหารแมว
    {
      name: 'Royal Canin Indoor Adult อาหารแมวโต เลี้ยงในบ้าน',
      slug: 'royal-canin-indoor-adult',
      description: 'อาหารแมวโตที่เลี้ยงในบ้าน อายุ 1-7 ปี สูตรควบคุมน้ำหนัก ลดกลิ่นอุจจาระ เสริมสร้างระบบทางเดินอาหาร',
      shortDesc: 'อาหารแมวโต เลี้ยงในบ้าน ควบคุมน้ำหนัก',
      sku: 'RC-IDA-2KG',
      price: 690,
      comparePrice: 790,
      stock: 50,
      weight: '2 kg',
      unit: 'ถุง',
      isFeatured: true,
      status: 'available',
      rating: 4.8,
      reviewCount: 156,
      salesCount: 320,
      categoryId: categories[0].id,
      brandId: brands[0].id,
      tags: 'อาหารแมว,แมวโต,indoor,royal canin',
    },
    {
      name: 'Whiskas อาหารแมว รสปลาทู',
      slug: 'whiskas-mackerel',
      description: 'อาหารแมว Whiskas รสปลาทู สูตรครบถ้วนสำหรับแมวโต มีวิตามินและแร่ธาตุ เสริมสร้างสุขภาพ',
      shortDesc: 'อาหารแมว Whiskas รสปลาทู สูตรครบถ้วน',
      sku: 'WK-MCK-3KG',
      price: 299,
      comparePrice: 350,
      stock: 100,
      weight: '3 kg',
      unit: 'ถุง',
      isFeatured: true,
      status: 'available',
      rating: 4.5,
      reviewCount: 230,
      salesCount: 550,
      categoryId: categories[0].id,
      brandId: brands[1].id,
      tags: 'อาหารแมว,whiskas,ปลาทู',
    },
    {
      name: 'Me-O อาหารแมว รสทูน่า',
      slug: 'meo-tuna',
      description: 'อาหารแมว Me-O รสทูน่า โปรตีนสูงจากเนื้อปลาทูน่า บำรุงขนเงางาม เสริมทอรีนบำรุงสายตา',
      shortDesc: 'อาหารแมว Me-O รสทูน่า โปรตีนสูง',
      sku: 'MO-TN-1.2KG',
      price: 185,
      comparePrice: 220,
      stock: 80,
      weight: '1.2 kg',
      unit: 'ถุง',
      isFeatured: false,
      status: 'available',
      rating: 4.3,
      reviewCount: 89,
      salesCount: 200,
      categoryId: categories[0].id,
      brandId: brands[2].id,
      tags: 'อาหารแมว,meo,ทูน่า',
    },
    {
      name: 'Royal Canin Kitten อาหารลูกแมว',
      slug: 'royal-canin-kitten',
      description: 'อาหารลูกแมว Royal Canin สูตรเสริมภูมิคุ้มกัน รองรับระบบย่อยอาหาร สำหรับลูกแมวอายุ 4-12 เดือน',
      shortDesc: 'อาหารลูกแมว เสริมภูมิคุ้มกัน',
      sku: 'RC-KIT-2KG',
      price: 750,
      comparePrice: 850,
      stock: 35,
      weight: '2 kg',
      unit: 'ถุง',
      isFeatured: true,
      status: 'available',
      rating: 4.9,
      reviewCount: 198,
      salesCount: 410,
      categoryId: categories[0].id,
      brandId: brands[0].id,
      tags: 'อาหารแมว,ลูกแมว,kitten,royal canin',
    },
    // ขนมแมว
    {
      name: 'Me-O Creamy Treats ขนมแมวเลีย รสทูน่า',
      slug: 'meo-creamy-tuna',
      description: 'ขนมแมวเลีย Me-O Creamy Treats รสทูน่า ขนมแมวที่แมวชอบที่สุด ให้เป็นรางวัล หรือผสมกับอาหาร แพ็ค 4 ซอง',
      shortDesc: 'ขนมแมวเลีย รสทูน่า 4 ซอง',
      sku: 'MO-CRM-TN-4P',
      price: 35,
      comparePrice: 45,
      stock: 200,
      weight: '60 g',
      unit: 'แพ็ค',
      isFeatured: true,
      status: 'available',
      rating: 4.7,
      reviewCount: 340,
      salesCount: 890,
      categoryId: categories[1].id,
      brandId: brands[2].id,
      tags: 'ขนมแมว,ขนมแมวเลีย,ทูน่า,meo',
    },
    {
      name: 'Kit Cat Purr Puree ขนมแมวเลีย รสไก่',
      slug: 'kitcat-purr-puree-chicken',
      description: 'ขนมแมวเลีย Kit Cat Purr Puree รสไก่ ทำจากเนื้อไก่แท้ ไม่มีสารกันบูด ปลอดภัยสำหรับแมว แพ็ค 4 ซอง',
      shortDesc: 'ขนมแมวเลีย รสไก่ จากเนื้อไก่แท้',
      sku: 'KC-PP-CK-4P',
      price: 49,
      comparePrice: 59,
      stock: 150,
      weight: '60 g',
      unit: 'แพ็ค',
      isFeatured: false,
      status: 'available',
      rating: 4.6,
      reviewCount: 220,
      salesCount: 670,
      categoryId: categories[1].id,
      brandId: brands[3].id,
      tags: 'ขนมแมว,ขนมแมวเลีย,ไก่,kit cat',
    },
    // ทรายแมว
    {
      name: 'Kit Cat Soybean Litter ทรายแมวเต้าหู้',
      slug: 'kitcat-soybean-litter',
      description: 'ทรายแมวเต้าหู้ Kit Cat ผลิตจากกากถั่วเหลือง ธรรมชาติ 100% ทิ้งลงชักโครกได้ จับก้อนดี ดูดซับกลิ่นเยี่ยม',
      shortDesc: 'ทรายแมวเต้าหู้ ธรรมชาติ ทิ้งลงชักโครกได้',
      sku: 'KC-SBL-7L',
      price: 199,
      comparePrice: 250,
      stock: 60,
      weight: '7 L',
      unit: 'ถุง',
      isFeatured: true,
      status: 'available',
      rating: 4.6,
      reviewCount: 180,
      salesCount: 450,
      categoryId: categories[2].id,
      brandId: brands[3].id,
      tags: 'ทรายแมว,เต้าหู้,kit cat,ธรรมชาติ',
    },
    {
      name: 'Purrfect ทรายแมวภูเขาไฟ กลิ่นลาเวนเดอร์',
      slug: 'purrfect-bentonite-lavender',
      description: 'ทรายแมวภูเขาไฟ Purrfect กลิ่นลาเวนเดอร์ จับก้อนเร็ว ดูดซับกลิ่น ฝุ่นน้อย เม็ดละเอียด',
      shortDesc: 'ทรายแมวภูเขาไฟ กลิ่นลาเวนเดอร์ ฝุ่นน้อย',
      sku: 'PF-BNT-LV-10L',
      price: 159,
      comparePrice: 199,
      stock: 40,
      weight: '10 L',
      unit: 'ถุง',
      isFeatured: false,
      status: 'available',
      rating: 4.4,
      reviewCount: 95,
      salesCount: 280,
      categoryId: categories[2].id,
      brandId: brands[5].id,
      tags: 'ทรายแมว,ภูเขาไฟ,ลาเวนเดอร์,purrfect',
    },
    // ของเล่นแมว
    {
      name: 'Catit ลวดล่อแมว พร้อมขนนก',
      slug: 'catit-feather-teaser',
      description: 'ลวดล่อแมว Catit มาพร้อมขนนกสีสันสดใส กระตุ้นสัญชาตญาณการล่า ช่วยให้แมวได้ออกกำลัง ด้ามจับถนัดมือ',
      shortDesc: 'ลวดล่อแมว พร้อมขนนก ด้ามจับถนัดมือ',
      sku: 'CT-FTR-01',
      price: 129,
      comparePrice: 159,
      stock: 70,
      weight: '50 g',
      unit: 'ชิ้น',
      isFeatured: false,
      status: 'available',
      rating: 4.5,
      reviewCount: 120,
      salesCount: 340,
      categoryId: categories[3].id,
      brandId: brands[4].id,
      tags: 'ของเล่นแมว,ลวดล่อแมว,ขนนก,catit',
    },
    {
      name: 'MeePro หนูของเล่น แคทนิป 3 ตัว',
      slug: 'meepro-catnip-mouse-3pack',
      description: 'หนูของเล่นแมว MeePro บรรจุแคทนิปภายใน แมวชอบมาก! แพ็ค 3 ตัว สีสันน่ารัก ทนทาน เย็บแน่น',
      shortDesc: 'หนูของเล่นแมว แคทนิป แพ็ค 3 ตัว',
      sku: 'MP-MSE-3P',
      price: 89,
      comparePrice: 120,
      stock: 120,
      weight: '30 g',
      unit: 'แพ็ค',
      isFeatured: true,
      status: 'available',
      rating: 4.7,
      reviewCount: 88,
      salesCount: 230,
      categoryId: categories[3].id,
      brandId: brands[6].id,
      tags: 'ของเล่นแมว,หนูของเล่น,แคทนิป,meepro',
    },
    {
      name: 'Catit ลูกบอลกระดิ่ง ของเล่นแมว 4 ลูก',
      slug: 'catit-jingle-ball-4pack',
      description: 'ลูกบอลกระดิ่งสำหรับแมว Catit แพ็ค 4 ลูก สีสันสดใส มีกระดิ่งเสียงกรุ๊งกริ๊ง ดึงดูดแมวให้เล่นสนุก',
      shortDesc: 'ลูกบอลกระดิ่ง ของเล่นแมว 4 ลูก',
      sku: 'CT-JBL-4P',
      price: 79,
      comparePrice: 99,
      stock: 90,
      weight: '80 g',
      unit: 'แพ็ค',
      isFeatured: false,
      status: 'available',
      rating: 4.3,
      reviewCount: 65,
      salesCount: 160,
      categoryId: categories[3].id,
      brandId: brands[4].id,
      tags: 'ของเล่นแมว,ลูกบอล,กระดิ่ง,catit',
    },
    // อุปกรณ์อาบน้ำ
    {
      name: 'MeePro แชมพูแมว สูตรอ่อนโยน กลิ่นดอกไม้',
      slug: 'meepro-cat-shampoo-floral',
      description: 'แชมพูแมว MeePro สูตรอ่อนโยน กลิ่นดอกไม้ ผลิตจากสารสกัดธรรมชาติ ไม่ระคายเคืองผิว บำรุงขนนุ่มเงางาม pH สมดุล',
      shortDesc: 'แชมพูแมว สูตรอ่อนโยน กลิ่นดอกไม้',
      sku: 'MP-SHP-FL-500',
      price: 189,
      comparePrice: 249,
      stock: 45,
      weight: '500 ml',
      unit: 'ขวด',
      isFeatured: true,
      status: 'available',
      rating: 4.8,
      reviewCount: 135,
      salesCount: 380,
      categoryId: categories[4].id,
      brandId: brands[6].id,
      tags: 'แชมพูแมว,อาบน้ำแมว,ดอกไม้,meepro',
    },
    {
      name: 'Purrfect ครีมนวดขนแมว สูตรขนนุ่ม',
      slug: 'purrfect-conditioner-soft',
      description: 'ครีมนวดขนแมว Purrfect สูตรขนนุ่ม ลดขนพันกัน บำรุงเส้นขนจากรากถึงปลาย มีวิตามิน E และน้ำมันมะพร้าว',
      shortDesc: 'ครีมนวดขนแมว สูตรขนนุ่ม ลดขนพันกัน',
      sku: 'PF-CND-ST-300',
      price: 169,
      comparePrice: 220,
      stock: 30,
      weight: '300 ml',
      unit: 'ขวด',
      isFeatured: false,
      status: 'available',
      rating: 4.5,
      reviewCount: 72,
      salesCount: 190,
      categoryId: categories[4].id,
      brandId: brands[5].id,
      tags: 'ครีมนวดขน,แมว,ขนนุ่ม,purrfect',
    },
    // ที่นอนแมว
    {
      name: 'MeePro เบาะนอนแมว ทรงกลม ขนนุ่ม',
      slug: 'meepro-round-bed-fluffy',
      description: 'เบาะนอนแมว MeePro ทรงกลม ขนปุยนุ่ม ให้ความอบอุ่น แมวชอบขดนอน ซักเครื่องได้ มีหลายสีให้เลือก ขนาด 50 ซม.',
      shortDesc: 'เบาะนอนแมว ทรงกลม ขนนุ่มปุย',
      sku: 'MP-BED-RD-50',
      price: 390,
      comparePrice: 490,
      stock: 25,
      weight: '500 g',
      unit: 'ชิ้น',
      isFeatured: true,
      status: 'available',
      rating: 4.9,
      reviewCount: 210,
      salesCount: 520,
      categoryId: categories[5].id,
      brandId: brands[6].id,
      tags: 'ที่นอนแมว,เบาะแมว,ขนนุ่ม,meepro',
    },
    {
      name: 'Catit Vesper คอนโดแมว 3 ชั้น',
      slug: 'catit-vesper-condo-3tier',
      description: 'คอนโดแมว Catit Vesper 3 ชั้น มีเสาลับเล็บ มีพื้นที่ซ่อนตัว และที่นอนด้านบน ไม้แท้คุณภาพดี ดีไซน์สวย เข้ากับทุกห้อง',
      shortDesc: 'คอนโดแมว 3 ชั้น มีเสาลับเล็บ',
      sku: 'CT-VSP-3T',
      price: 2490,
      comparePrice: 2990,
      stock: 10,
      weight: '8 kg',
      unit: 'ชิ้น',
      isFeatured: false,
      status: 'available',
      rating: 4.7,
      reviewCount: 45,
      salesCount: 65,
      categoryId: categories[5].id,
      brandId: brands[4].id,
      tags: 'คอนโดแมว,เสาลับเล็บ,catit,vesper',
    },
    // อุปกรณ์ให้อาหาร
    {
      name: 'Catit Pixi น้ำพุแมว สแตนเลส',
      slug: 'catit-pixi-fountain',
      description: 'น้ำพุแมว Catit Pixi สแตนเลส 2.5 ลิตร ระบบกรองน้ำ 3 ชั้น น้ำสะอาดตลอดวัน เงียบ ใช้พลังงานต่ำ กระตุ้นให้แมวดื่มน้ำ',
      shortDesc: 'น้ำพุแมว สแตนเลส 2.5 ลิตร ระบบกรอง 3 ชั้น',
      sku: 'CT-PXF-SS-25',
      price: 1290,
      comparePrice: 1590,
      stock: 15,
      weight: '1.2 kg',
      unit: 'ชิ้น',
      isFeatured: true,
      status: 'available',
      rating: 4.8,
      reviewCount: 95,
      salesCount: 180,
      categoryId: categories[6].id,
      brandId: brands[4].id,
      tags: 'น้ำพุแมว,สแตนเลส,catit,pixi',
    },
    {
      name: 'MeePro ชามอาหารแมว เซรามิก ยกสูง',
      slug: 'meepro-ceramic-bowl-raised',
      description: 'ชามอาหารแมว MeePro เซรามิก ยกสูง 15 องศา ช่วยลดอาการอาเจียน ผิวเรียบล้างง่าย มีฐานกันลื่น ดีไซน์น่ารักลายแมว',
      shortDesc: 'ชามอาหารแมว เซรามิก ยกสูง ลดอาเจียน',
      sku: 'MP-BWL-CR-RD',
      price: 249,
      comparePrice: 320,
      stock: 40,
      weight: '400 g',
      unit: 'ชิ้น',
      isFeatured: false,
      status: 'available',
      rating: 4.6,
      reviewCount: 75,
      salesCount: 200,
      categoryId: categories[6].id,
      brandId: brands[6].id,
      tags: 'ชามอาหาร,เซรามิก,ยกสูง,meepro',
    },
    {
      name: 'Whiskas อาหารเปียกแมว รสปลาซาร์ดีน',
      slug: 'whiskas-wet-sardine',
      description: 'อาหารเปียกแมว Whiskas รสปลาซาร์ดีน ในน้ำเกรวี่ เนื้อปลาแท้ อร่อย มีประโยชน์ เหมาะสำหรับแมวทุกสายพันธุ์',
      shortDesc: 'อาหารเปียกแมว รสซาร์ดีน ในน้ำเกรวี่',
      sku: 'WK-WET-SD-80',
      price: 22,
      comparePrice: 29,
      stock: 300,
      weight: '80 g',
      unit: 'ซอง',
      isFeatured: false,
      status: 'available',
      rating: 4.4,
      reviewCount: 180,
      salesCount: 750,
      categoryId: categories[0].id,
      brandId: brands[1].id,
      tags: 'อาหารเปียก,แมว,ซาร์ดีน,whiskas',
    },
    {
      name: 'MeePro แปรงหวีขนแมว สลิคเกอร์',
      slug: 'meepro-slicker-brush',
      description: 'แปรงหวีขนแมว MeePro แบบสลิคเกอร์ ช่วยรวบขนที่หลุดร่วง ลดขนพันกัน ปลายเข็มปลอดภัย ด้ามจับยางกันลื่น',
      shortDesc: 'แปรงหวีขนแมว สลิคเกอร์ ลดขนร่วง',
      sku: 'MP-BRS-SLK',
      price: 119,
      comparePrice: 150,
      stock: 55,
      weight: '100 g',
      unit: 'ชิ้น',
      isFeatured: false,
      status: 'available',
      rating: 4.3,
      reviewCount: 42,
      salesCount: 110,
      categoryId: categories[4].id,
      brandId: brands[6].id,
      tags: 'แปรงหวีขน,แมว,สลิคเกอร์,meepro',
    },
  ];

  for (const product of products) {
    const created = await prisma.product.create({
      data: {
        ...product,
        images: {
          create: [
            {
              url: `/assets/img/products/${product.slug}_1.jpg`,
              alt: product.name,
              sortOrder: 0,
              isMain: true,
            },
            {
              url: `/assets/img/products/${product.slug}_2.jpg`,
              alt: product.name,
              sortOrder: 1,
              isMain: false,
            },
          ],
        },
      },
    });
    console.log(`  📦 Created product: ${created.name}`);
  }
  console.log(`✅ Created ${products.length} products`);

  // ==========================================
  // Product Variants (สำหรับบางสินค้า)
  // ==========================================
  // Royal Canin Indoor - variants ขนาด
  const rcIndoor = await prisma.product.findUnique({ where: { slug: 'royal-canin-indoor-adult' } });
  if (rcIndoor) {
    await prisma.productVariant.createMany({
      data: [
        { productId: rcIndoor.id, name: 'ขนาด', value: '400 g', priceAdjust: -490, stock: 30, sku: 'RC-IDA-400G' },
        { productId: rcIndoor.id, name: 'ขนาด', value: '2 kg', priceAdjust: 0, stock: 50, sku: 'RC-IDA-2KG' },
        { productId: rcIndoor.id, name: 'ขนาด', value: '4 kg', priceAdjust: 610, stock: 20, sku: 'RC-IDA-4KG' },
        { productId: rcIndoor.id, name: 'ขนาด', value: '10 kg', priceAdjust: 1810, stock: 10, sku: 'RC-IDA-10KG' },
      ],
    });
  }

  // Kit Cat Soybean Litter - variants กลิ่น
  const kcLitter = await prisma.product.findUnique({ where: { slug: 'kitcat-soybean-litter' } });
  if (kcLitter) {
    await prisma.productVariant.createMany({
      data: [
        { productId: kcLitter.id, name: 'กลิ่น', value: 'ไม่มีกลิ่น', priceAdjust: 0, stock: 20, sku: 'KC-SBL-7L-OG' },
        { productId: kcLitter.id, name: 'กลิ่น', value: 'ชาเขียว', priceAdjust: 10, stock: 15, sku: 'KC-SBL-7L-GT' },
        { productId: kcLitter.id, name: 'กลิ่น', value: 'ลาเวนเดอร์', priceAdjust: 10, stock: 15, sku: 'KC-SBL-7L-LV' },
        { productId: kcLitter.id, name: 'กลิ่น', value: 'พีช', priceAdjust: 10, stock: 10, sku: 'KC-SBL-7L-PC' },
      ],
    });
  }

  // MeePro เบาะนอน - variants สี
  const bed = await prisma.product.findUnique({ where: { slug: 'meepro-round-bed-fluffy' } });
  if (bed) {
    await prisma.productVariant.createMany({
      data: [
        { productId: bed.id, name: 'สี', value: 'เทา', priceAdjust: 0, stock: 10 },
        { productId: bed.id, name: 'สี', value: 'ครีม', priceAdjust: 0, stock: 8 },
        { productId: bed.id, name: 'สี', value: 'ชมพู', priceAdjust: 0, stock: 7 },
      ],
    });
  }

  console.log('✅ Created product variants');

  // ==========================================
  // Banners
  // ==========================================
  await prisma.banner.createMany({
    data: [
      {
        title: 'อาหารแมวคุณภาพ ลดสูงสุด 30%',
        subtitle: 'Royal Canin, Whiskas, Me-O และอีกมากมาย',
        image: '/assets/img/banners/banner-1.jpg',
        link: '/shop?category=cat-food',
        sortOrder: 1,
      },
      {
        title: 'ของเล่นแมว มาใหม่!',
        subtitle: 'ลวดล่อแมว หนูแคทนิป ลูกบอล สนุกสนานทั้งวัน',
        image: '/assets/img/banners/banner-2.jpg',
        link: '/shop?category=cat-toys',
        sortOrder: 2,
      },
      {
        title: 'ทรายแมวเต้าหู้ ธรรมชาติ 100%',
        subtitle: 'ปลอดภัย ทิ้งลงชักโครกได้ จับก้อนดี',
        image: '/assets/img/banners/banner-3.jpg',
        link: '/shop?category=cat-litter',
        sortOrder: 3,
      },
    ],
  });
  console.log('✅ Created banners');

  // ==========================================
  // Site Config
  // ==========================================
  await prisma.siteConfig.createMany({
    data: [
      { key: 'shop_name', value: 'MeePro Pet Shop', group: 'general' },
      { key: 'shop_description', value: 'ร้านขายอาหารสัตว์และอุปกรณ์สำหรับเลี้ยงสัตว์ เน้นสินค้าสำหรับแมว', group: 'general' },
      { key: 'shop_phone', value: '02-xxx-xxxx', group: 'contact' },
      { key: 'shop_email', value: 'contact@meepro.co.th', group: 'contact' },
      { key: 'shop_address', value: 'กรุงเทพมหานคร', group: 'contact' },
      { key: 'shop_line', value: '@meepropetshop', group: 'contact' },
      { key: 'shop_facebook', value: 'MeeProPetShop', group: 'social' },
      { key: 'currency', value: '฿', group: 'payment' },
      { key: 'currency_code', value: 'THB', group: 'payment' },
      { key: 'free_shipping_min', value: '500', group: 'shipping' },
      { key: 'shipping_fee', value: '50', group: 'shipping' },
    ],
  });
  console.log('✅ Created site configs');

  console.log('\n🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
