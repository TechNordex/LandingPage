const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        console.log('Checking projects preview_status...');
        const res = await pool.query(`
            SELECT id, name, preview_status, deleted_at 
            FROM projects
        `);
        console.log('Projects:', JSON.stringify(res.rows, null, 2));

    } catch (err) {
        console.error('Error during check:', err);
    } finally {
        await pool.end();
    }
}

run();
