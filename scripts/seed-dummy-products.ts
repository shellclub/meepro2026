import prisma from '../src/lib/prisma';

async function main() {
  await prisma.$executeRawUnsafe('USE meepro_petshop');
  console.log('Seeding dummy products...');

  // Create Categories if not exist
  const catCategory = await prisma.category.upsert({
    where: { slug: 'cat-food' },
    update: {},
    create: {
      name: 'อาหารแมว',
      slug: 'cat-food',
    },
  });

  const dogCategory = await prisma.category.upsert({
    where: { slug: 'dog-food' },
    update: {},
    create: {
      name: 'อาหารสุนัข',
      slug: 'dog-food',
    },
  });

  const toyCategory = await prisma.category.upsert({
    where: { slug: 'pet-toy' },
    update: {},
    create: {
      name: 'ของเล่นและคอนโด',
      slug: 'pet-toy',
    },
  });

  // Create Products
  const productsData = [
    {
      name: 'อาหารแมวพรีเมียม MeePro สูตรไก่และมันเทศ',
      slug: 'meepro-cat-food-premium',
      description: 'อาหารแมวเกรดพรีเมียม ปราศจากธัญพืช ช่วยให้ขับถ่ายดี ขนสวยงาม',
      price: 250.0,
      comparePrice: 350.0,
      categoryId: catCategory.id,
      images: ['/assets/img/product/meepro/cat-food.png'],
      weight: '2.5kg'
    },
    {
      name: 'อาหารสุนัขพรีเมียม MeePro สูตรไก่และมันเทศ',
      slug: 'meepro-dog-food-premium',
      description: 'อาหารสุนัขเกรดพรีเมียม บำรุงกระดูกและข้อต่อ มีโปรตีนสูง',
      price: 950.0,
      comparePrice: 1250.0,
      categoryId: dogCategory.id,
      images: ['/assets/img/product/meepro/dog-food.png'],
      weight: '12kg'
    },
    {
      name: 'คอนโดแมวไม้แท้ สไตล์มินิมอล MeePro',
      slug: 'meepro-cat-tree-minimal',
      description: 'คอนโดแมวทำจากไม้แท้ แข็งแรงทนทาน ดีไซน์สไตล์มินิมอล เข้ากับบ้านทุกแบบ',
      price: 2590.0,
      comparePrice: 3200.0,
      categoryId: toyCategory.id,
      images: ['/assets/img/product/meepro/cat-tree.png'],
      weight: '15kg'
    },
    {
      name: 'ของเล่นสุนัข ยางขัดฟัน รูปกระดูก',
      slug: 'meepro-dog-toy-bone',
      description: 'ยางกัดขัดฟันสุนัขสุดทนทาน สีส้มสดใส ปลอดภัย 100%',
      price: 150.0,
      comparePrice: 199.0,
      categoryId: toyCategory.id,
      images: ['/assets/img/product/meepro/dog-toy.png'],
      weight: '300g'
    }
  ];

  for (const p of productsData) {
    const existing = await prisma.product.findUnique({
      where: { slug: p.slug }
    });

    if (!existing) {
      console.log(`Creating ${p.name}`);
      const created = await prisma.product.create({
        data: {
          name: p.name,
          slug: p.slug,
          description: p.description,
          price: p.price,
          comparePrice: p.comparePrice,
          categoryId: p.categoryId,
          weight: p.weight,
        }
      });

      // Add image
      for (const img of p.images) {
        await prisma.productImage.create({
          data: {
            productId: created.id,
            url: img,
            isMain: true
          }
        });
      }
    } else {
      console.log(`Product ${p.name} already exists`);
    }
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
