import { PGlite } from '@electric-sql/pglite';
import pg from 'pg';
import fs from 'fs';
import path from 'path';

async function migrate() {
  console.log('--- Running Fran Capelli Academy PostgreSQL Migrations ---');
  const dbUrl = process.env.DATABASE_URL;
  const schemaPath = path.join(process.cwd(), 'scripts', 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  if (dbUrl && (dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://'))) {
    console.log('Connecting to PostgreSQL server:', dbUrl);
    const pool = new pg.Pool({ connectionString: dbUrl });
    const client = await pool.connect();
    try {
      await client.query(schemaSql);
      console.log('Migrations executed successfully on external PostgreSQL.');
    } finally {
      client.release();
      await pool.end();
    }
  } else {
    const dataDir = path.join(process.cwd(), 'data', 'fca_postgres');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    console.log('Connecting to Embedded PostgreSQL (PGlite) at:', dataDir);
    const pglite = new PGlite(dataDir);
    try {
      await pglite.exec(schemaSql);
      console.log('Migrations executed successfully on local PostgreSQL.');
    } finally {
      await pglite.close();
    }
  }
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});

