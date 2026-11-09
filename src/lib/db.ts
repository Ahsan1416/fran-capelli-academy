import { PGlite } from '@electric-sql/pglite';
import pg from 'pg';
import path from 'path';
import fs from 'fs';

// Unified Database Client Interface
export interface DBClient {
  query: <T = any>(text: string, params?: any[]) => Promise<{ rows: T[] }>;
  exec: (text: string) => Promise<any>;
}

let dbInstance: DBClient | null = null;

export async function getDB(): Promise<DBClient> {
  if (dbInstance) return dbInstance;

  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl && (databaseUrl.startsWith('postgres://') || databaseUrl.startsWith('postgresql://'))) {
    // Standard PostgreSQL server (Docker, Neon, Supabase, AWS RDS, local PG)
    console.log('[DB] Connecting to PostgreSQL via standard connection string');
    const pool = new pg.Pool({
      connectionString: databaseUrl,
      ssl: process.env.NODE_ENV === 'production' && !databaseUrl.includes('localhost') ? { rejectUnauthorized: false } : undefined,
    });
    dbInstance = {
      query: async (text: string, params?: any[]) => {
        const client = await pool.connect();
        try {
          const res = await client.query(text, params);
          return { rows: res.rows };
        } finally {
          client.release();
        }
      },
      exec: async (text: string) => {
        const client = await pool.connect();
        try {
          return await client.query(text);
        } finally {
          client.release();
        }
      }
    };
  } else {
    // Embedded 100% PostgreSQL Engine (PGlite) storing data in ./data/fca_postgres
    const dataDir = path.join(process.cwd(), 'data', 'fca_postgres');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const pglite = new PGlite(dataDir);
    dbInstance = {
      query: async <T = any>(text: string, params?: any[]) => {
        const res = await pglite.query<T>(text, params);
        return { rows: res.rows };
      },
      exec: async (text: string) => {
        return await pglite.exec(text);
      }
    };
  }

  // Ensure tables exist on boot
  await ensureSchema(dbInstance);

  return dbInstance;
}

async function ensureSchema(db: DBClient) {
  try {
    const check = await db.query(`SELECT 1 FROM information_schema.tables WHERE table_name = 'site_settings' LIMIT 1`);
    if (check.rows.length === 0) {
      console.log('[DB] Running initial PostgreSQL schema migration...');
      const schemaSqlPath = path.join(process.cwd(), 'scripts', 'schema.sql');
      if (fs.existsSync(schemaSqlPath)) {
        const sql = fs.readFileSync(schemaSqlPath, 'utf8');
        await db.exec(sql);
        console.log('[DB] Schema successfully created.');
      }
    }
  } catch (err) {
    console.error('[DB] Schema initialization notice:', err);
  }
}
