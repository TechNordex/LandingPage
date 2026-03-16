const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        console.log('Adding created_by to project_updates...');
        
        await pool.query(`
            ALTER TABLE project_updates 
            ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES portal_users(id) ON DELETE SET NULL;
        `);
        console.log('Column created_by added to project_updates.');

    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await pool.end();
    }
}

run();
