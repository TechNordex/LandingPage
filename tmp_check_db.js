const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function main() {
  try {
    const res = await pool.query(`
      SELECT conname, contype, pg_get_constraintdef(c.oid)
      FROM pg_constraint c
      JOIN pg_namespace n ON n.oid = c.connamespace
      WHERE conrelid = 'chat_participants'::regclass
    `);
    fs.writeFileSync('con.json', JSON.stringify(res.rows, null, 2), 'utf8');
  } catch (err) {
    fs.writeFileSync('err.txt', String(err), 'utf8');
  } finally {
    await pool.end();
  }
}

main();
