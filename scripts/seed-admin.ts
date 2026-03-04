import { execute, queryOne } from '../src/lib/db';
import bcrypt from 'bcryptjs';

async function seedAdmin() {
  try {
    const existingAdmin = await queryOne('SELECT * FROM admin_users WHERE username = ?', ['admin']);
    
    if (existingAdmin) {
      console.log('Admin user already exists.');
      return;
    }

    const hashedPassword = await bcrypt.hash('pwD@2022!', 10);
    
    await execute(
      'INSERT INTO admin_users (username, password, name, role, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
      ['admin', hashedPassword, 'Administrator', 'superadmin', 1]
    );

    console.log('Admin user seeded successfully. Username: admin, Password: pwD@2022!');
  } catch (error) {
    console.error('Error seeding admin user:', error);
  } finally {
    process.exit(0);
  }
}

seedAdmin();
