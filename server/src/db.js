import pg from 'pg';
const { Pool } = pg;
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');
export const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : undefined });
export async function initDb() {
  await pool.query(`CREATE TABLE IF NOT EXISTS leads (
    id BIGSERIAL PRIMARY KEY, name VARCHAR(120) NOT NULL, email VARCHAR(254) NOT NULL,
    phone VARCHAR(30), company VARCHAR(160), service VARCHAR(80) NOT NULL,
    budget VARCHAR(60), message VARCHAR(2000) NOT NULL, status VARCHAR(20) NOT NULL DEFAULT 'new'
      CHECK (status IN ('new','contacted','qualified','closed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);
}
