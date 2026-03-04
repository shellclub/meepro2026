import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as mariadb from 'mariadb';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const pool = mariadb.createPool({
    socketPath: '/Applications/XAMPP/xamppfiles/var/mysql/mysql.sock',
    user: 'root',
    password: '',
    database: 'meepro_petshop',
    connectionLimit: 5,
  });
  const adapter = new PrismaMariaDb(pool);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
