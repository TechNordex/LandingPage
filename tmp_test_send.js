const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function main() {
  try {
    // 1. Get a conversation and user
    const partRes = await pool.query('SELECT * FROM chat_participants LIMIT 1');
    const part = partRes.rows[0];

    // Simulate sending a message
    const insertRes = await pool.query(
        `INSERT INTO chat_messages (conversation_id, sender_id, content, type, reply_to_id) 
         VALUES ($1, $2, $3, $4, $5) RETURNING id, created_at`,
         [part.conversation_id, part.user_id, 'test content via node', 'text', null]
    );

    fs.writeFileSync('send_test.json', JSON.stringify({
        success: true,
        data: insertRes.rows
    }), 'utf8');

  } catch (err) {
    fs.writeFileSync('send_test.json', JSON.stringify({
        success: false,
        error: String(err)
    }), 'utf8');
  } finally {
    await pool.end();
  }
}

main();
