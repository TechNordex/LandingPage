const { Pool } = require('pg');

async function migrate() {
    const db = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('--- Starting Ultra-Premium Chat Migration ---');

        // 1. chat_messages additions
        const msgCols = await db.query("SELECT column_name FROM information_schema.columns WHERE table_name='chat_messages'");
        const existingMsgCols = msgCols.rows.map(r => r.column_name);

        if (!existingMsgCols.includes('is_edited')) {
            console.log('Adding chat_messages.is_edited...');
            await db.query('ALTER TABLE chat_messages ADD COLUMN is_edited BOOLEAN DEFAULT FALSE');
        }
        if (!existingMsgCols.includes('reply_to_id')) {
            console.log('Adding chat_messages.reply_to_id...');
            // Need to match the ID type of chat_messages.id
            const idTypeRes = await db.query("SELECT data_type FROM information_schema.columns WHERE table_name='chat_messages' AND column_name='id'");
            const idType = idTypeRes.rows[0].data_type;
            console.log(`Matching reply_to_id type with id: ${idType}`);
            await db.query(`ALTER TABLE chat_messages ADD COLUMN reply_to_id ${idType === 'uuid' ? 'UUID' : 'INTEGER'} REFERENCES chat_messages(id)`);
        }

        // 2. chat_participants additions
        const partCols = await db.query("SELECT column_name FROM information_schema.columns WHERE table_name='chat_participants'");
        const existingPartCols = partCols.rows.map(r => r.column_name);

        if (!existingPartCols.includes('last_read_at')) {
            console.log('Adding chat_participants.last_read_at...');
            await db.query('ALTER TABLE chat_participants ADD COLUMN last_read_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP');
        }

        console.log('--- Migration Completed Successfully ---');
    } catch (err) {
        console.error('--- Migration Failed ---');
        console.error(err);
    } finally {
        await db.end();
    }
}

migrate();
