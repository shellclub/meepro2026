import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as mariadb from 'mariadb';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const isProd = process.env.NODE_ENV === 'production' || !process.env.USE_XAMPP_SOCKET;
  const poolConfig = isProd
    ? {
      host: process.env.DB_HOST || '127.0.0.1', // Default to localhost if not specified
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'meepro_petshop',
      connectionLimit: 10,
    }
    : {
      socketPath: '/Applications/XAMPP/xamppfiles/var/mysql/mysql.sock',
      user: 'root',
      password: '',
      database: 'meepro_petshop',
      connectionLimit: 5,
    };

  const pool = mariadb.createPool(poolConfig as any);
  const adapter = new PrismaMariaDb(pool as any);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
