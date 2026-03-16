const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        const tables = ['portal_users', 'projects', 'project_updates', 'project_assignments'];
        for (const table of tables) {
            const res = await pool.query('SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1', [table]);
            console.log(`\nTABLE: ${table}`);
            res.rows.forEach(r => console.log(` - ${r.column_name} (${r.data_type})`));
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

run();
