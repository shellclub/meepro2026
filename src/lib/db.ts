import * as mariadb from 'mariadb';

const globalForDb = globalThis as unknown as {
  dbPool: mariadb.Pool | undefined;
};

const poolConfig = process.env.NODE_ENV === 'production' || !process.env.USE_XAMPP_SOCKET
  ? {
    host: process.env.DB_HOST || 'mariadb',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'pwD@20200',
    database: process.env.DB_NAME || 'meepro_petshop',
    connectionLimit: 10,
  }
  : {
    socketPath: '/Applications/XAMPP/xamppfiles/var/mysql/mysql.sock',
    user: 'root',
    password: '',
    database: 'meepro_petshop',
    connectionLimit: 10,
  };

export const pool = globalForDb.dbPool ?? mariadb.createPool(poolConfig as any);

if (process.env.NODE_ENV !== 'production') globalForDb.dbPool = pool;

export async function query<T = any>(sql: string, params?: any[]): Promise<T[]> {
  const conn = await pool.getConnection();
  try {
    let rows = await conn.query(sql, params);

    // Helper to deeply convert BigInt to Number
    const convertBigInt = (obj: any): any => {
      if (obj === null || obj === undefined) return obj;
      if (typeof obj === 'bigint') return Number(obj);
      if (Array.isArray(obj)) return obj.map(convertBigInt);
      if (obj instanceof Date) return obj;
      if (typeof obj === 'object') {
        const newObj: any = {};
        for (const key in obj) {
          newObj[key] = convertBigInt(obj[key]);
        }
        return newObj;
      }
      return obj;
    };

    rows = convertBigInt(Array.isArray(rows) ? rows : [rows]);
    return rows;
  } finally {
    conn.release();
  }
}

export async function queryOne<T = any>(sql: string, params?: any[]): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] || null;
}

export async function execute(sql: string, params?: any[]): Promise<any> {
  const conn = await pool.getConnection();
  try {
    return await conn.query(sql, params);
  } finally {
    conn.release();
  }
}

const db = { pool, query, queryOne, execute };
export default db;
