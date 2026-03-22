const { Pool } = require('pg');

async function migrate() {
    const db = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('Checking for is_edited column...');
        const checkColumn = await db.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='chat_messages' AND column_name='is_edited'
        `);

        if (checkColumn.rows.length === 0) {
            console.log('Adding is_edited column...');
            await db.query('ALTER TABLE chat_messages ADD COLUMN is_edited BOOLEAN DEFAULT FALSE');
            console.log('Column added successfully.');
        } else {
            console.log('Column is_edited already exists.');
        }

    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await db.end();
    }
}

migrate();
