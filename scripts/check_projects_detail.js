const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        console.log('--- PROJECTS LIST ---');
        const res = await pool.query(`
            SELECT id, name, preview_status, deleted_at 
            FROM projects
        `);
        res.rows.forEach(p => {
            console.log(`- [${p.id}] ${p.name} | Status: ${p.preview_status} | Deleted: ${p.deleted_at ? 'YES (' + p.deleted_at + ')' : 'NO'}`);
        });
        console.log('--- END ---');

    } catch (err) {
        console.error('Error during check:', err);
    } finally {
        await pool.end();
    }
}

run();
