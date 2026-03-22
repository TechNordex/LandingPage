require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    console.log('Creating chat tables...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_conversations (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
          name TEXT,
          type VARCHAR(20) NOT NULL, -- 'direct' or 'group'
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_participants (
          conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,
          user_id UUID REFERENCES portal_users(id) ON DELETE CASCADE,
          last_read_at TIMESTAMP WITH TIME ZONE,
          joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (conversation_id, user_id)
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,
          sender_id UUID REFERENCES portal_users(id) ON DELETE SET NULL,
          content TEXT NOT NULL,
          type VARCHAR(20) DEFAULT 'text',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Creating indexes for performance...');

    // Indexes for frequent queries:
    // 1. Finding messages in a conversation
    await client.query(`CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id);`);
    // 2. Finding conversations of a user
    await client.query(`CREATE INDEX IF NOT EXISTS idx_chat_participants_user_id ON chat_participants(user_id);`);
    // 3. Finding conversations in a project (for group tracking)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_chat_conversations_project_id ON chat_conversations(project_id);`);

    await client.query('COMMIT');
    console.log('Chat schema successfully applied!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error applying schema:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
