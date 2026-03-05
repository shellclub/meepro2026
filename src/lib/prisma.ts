import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Fix for XAMPP local sockets, build the URL dynamically if needed
function createPrismaClient() {
  if (process.env.NODE_ENV !== 'production' && process.env.USE_XAMPP_SOCKET) {
    return new PrismaClient({
      datasources: {
        db: {
          url: 'mysql://root:@localhost:3306/meepro_petshop?socket=/Applications/XAMPP/xamppfiles/var/mysql/mysql.sock',
        },
      },
    });
  }
  return new PrismaClient({});
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
