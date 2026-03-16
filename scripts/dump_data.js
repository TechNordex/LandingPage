const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        const users = await pool.query('SELECT id, name, email, role FROM portal_users');
        console.log('\n--- USERS ---');
        console.table(users.rows);

        const projects = await pool.query('SELECT id, name, client_id, preview_status, deleted_at, current_stage FROM projects');
        console.log('\n--- PROJECTS ---');
        console.table(projects.rows);

        const updates = await pool.query('SELECT id, project_id, stage, title FROM project_updates');
        console.log('\n--- UPDATES ---');
        console.table(updates.rows);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

run();
