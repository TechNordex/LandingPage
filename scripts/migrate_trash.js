const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        console.log('Checking/Updating schema...');
        await pool.query(`
            ALTER TABLE projects 
            ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
        `);
        console.log('Column deleted_at ensured in projects table.');
        
        const res = await pool.query(`
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'projects' AND column_name = 'deleted_at'
        `);
        console.log('Verification:', res.rows.length > 0 ? 'Column exists' : 'Column MISSING');
        
    } catch (err) {
        console.error('Error during migration:', err);
    } finally {
        await pool.end();
    }
}

run();
