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
    let dataDir = path.join(process.cwd(), 'data', 'fca_postgres');

    // In Vercel / AWS Lambda serverless environment, the file system is read-only except /tmp
    if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
      const tmpDir = path.join('/tmp', 'fca_postgres');
      try {
        if (!fs.existsSync(tmpDir)) {
          fs.mkdirSync(tmpDir, { recursive: true });
          if (fs.existsSync(dataDir)) {
            fs.cpSync(dataDir, tmpDir, { recursive: true });
          }
        }
        dataDir = tmpDir;
      } catch (copyErr) {
        console.warn('[DB] Could not copy database to /tmp, falling back to dataDir:', copyErr);
      }
    }

    let pglite: PGlite | null = null;
    try {
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      pglite = new PGlite(dataDir);
    } catch (err) {
      console.warn('[DB] PGlite failed on disk directory, initializing in-memory fallback:', err);
      try {
        pglite = new PGlite();
      } catch (memErr) {
        console.warn('[DB] In-memory PGlite failed, using safe fallback:', memErr);
        pglite = null;
      }
    }

    dbInstance = {
      query: async <T = any>(text: string, params?: any[]) => {
        if (!pglite) return { rows: [] };
        try {
          const res = await pglite.query<T>(text, params);
          return { rows: res.rows };
        } catch (qErr) {
          console.error('[DB Query Error]:', text, qErr);
          return { rows: [] };
        }
      },
      exec: async (text: string) => {
        if (!pglite) return null;
        try {
          return await pglite.exec(text);
        } catch (eErr) {
          console.error('[DB Exec Error]:', eErr);
          return null;
        }
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

    // Auto-seed default admin user if missing
    await db.query(`
      INSERT INTO admin_users (email, name, password_hash, role)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO NOTHING
    `, [
      'admin@fca.edu.au',
      'FCA Academy Administrator',
      '4fd1f9f2d6dfaddf6e5128f801f8f9da315ed5c8e9a49238c67470672018acc0',
      'superadmin'
    ]);
  } catch (err) {
    console.error('[DB] Schema initialization notice:', err);
  }
}
