const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        const usersCols = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'portal_users'");
        console.log('\n--- PORTAL_USERS COLUMNS ---');
        console.log(usersCols.rows.map(r => r.column_name));

        const projectsCols = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'projects'");
        console.log('\n--- PROJECTS COLUMNS ---');
        console.log(projectsCols.rows.map(r => r.column_name));

        const user = await pool.query('SELECT * FROM portal_users LIMIT 1');
        console.log('\n--- USER SAMPLE ---');
        console.log(user.rows[0]);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

run();
