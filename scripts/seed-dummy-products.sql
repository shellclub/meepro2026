-- Create Categories
INSERT IGNORE INTO categories (id, name, slug, description, sortOrder, isActive, createdAt, updatedAt)
VALUES
(1001, 'อาหารแมว', 'cat-food', 'หมวดหมู่อาหารแมว', 1, 1, NOW(), NOW()),
(1002, 'อาหารสุนัข', 'dog-food', 'หมวดหมู่อาหารสุนัข', 2, 1, NOW(), NOW()),
(1003, 'ของเล่นและคอนโด', 'pet-toy', 'หมวดหมู่ของเล่นและคอนโดสัตว์เลี้ยง', 3, 1, NOW(), NOW());

-- Create Products
INSERT IGNORE INTO products (id, name, slug, description, shortDesc, price, comparePrice, stock, weight, isFeatured, isActive, status, categoryId, createdAt, updatedAt)
VALUES
(2001, 'อาหารแมวพรีเมียม MeePro สูตรไก่และมันเทศ', 'meepro-cat-food-premium', 'อาหารแมวเกรดพรีเมียม ปราศจากธัญพืช ช่วยให้ขับถ่ายดี ขนสวยงาม', 'อาหารแมวเกรดพรีเมียม', 250.00, 350.00, 100, '2.5kg', 1, 1, 'available', 1001, NOW(), NOW()),
(2002, 'อาหารสุนัขพรีเมียม MeePro สูตรไก่และมันเทศ', 'meepro-dog-food-premium', 'อาหารสุนัขเกรดพรีเมียม บำรุงกระดูกและข้อต่อ มีโปรตีนสูง', 'อาหารสุนัขพรีเมียม', 950.00, 1250.00, 100, '12kg', 1, 1, 'available', 1002, NOW(), NOW()),
(2003, 'คอนโดแมวไม้แท้ สไตล์มินิมอล MeePro', 'meepro-cat-tree-minimal', 'คอนโดแมวทำจากไม้แท้ แข็งแรงทนทาน ดีไซน์สไตล์มินิมอล เข้ากับบ้านทุกแบบ', 'คอนโดแมวไม้แท้', 2590.00, 3200.00, 50, '15kg', 1, 1, 'available', 1003, NOW(), NOW()),
(2004, 'ของเล่นสุนัข ยางขัดฟัน รูปกระดูก', 'meepro-dog-toy-bone', 'ยางกัดขัดฟันสุนัขสุดทนทาน สีส้มสดใส ปลอดภัย 100%', 'ของเล่นสุนัข ยางขัดฟัน', 150.00, 199.00, 200, '300g', 1, 1, 'available', 1003, NOW(), NOW());

-- Create Product Images
-- Note: Replace ON DUPLICATE KEY UPDATE with INSERT IGNORE because it's a simple seeding.
INSERT IGNORE INTO product_images (id, productId, url, isMain, sortOrder)
VALUES
(3001, 2001, '/assets/img/product/meepro/cat-food.png', 1, 0),
(3002, 2002, '/assets/img/product/meepro/dog-food.png', 1, 0),
(3003, 2003, '/assets/img/product/meepro/cat-tree.png', 1, 0),
(3004, 2004, '/assets/img/product/meepro/dog-toy.png', 1, 0);
