const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function main() {
  try {
    await pool.query(`
      ALTER TABLE chat_messages 
      ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS reply_to_id UUID REFERENCES chat_messages(id) ON DELETE SET NULL;
    `);

    fs.writeFileSync('db_fix.json', JSON.stringify({ success: true }), 'utf8');
  } catch (err) {
    fs.writeFileSync('db_fix.json', JSON.stringify({ success: false, error: String(err) }), 'utf8');
  } finally {
    await pool.end();
  }
}

main();
