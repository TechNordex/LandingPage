const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const fs = require('fs');

async function run() {
    try {
        const out = [];
        const users = await pool.query('SELECT id, name, email, role FROM portal_users');
        out.push('\n--- USERS ---');
        users.rows.forEach(r => out.push(JSON.stringify(r)));

        const projects = await pool.query('SELECT id, name, client_id, preview_status, deleted_at, current_stage FROM projects');
        out.push('\n--- PROJECTS ---');
        projects.rows.forEach(r => out.push(JSON.stringify(r)));

        const updates = await pool.query('SELECT id, project_id, stage, title, status FROM project_updates');
        out.push('\n--- UPDATES ---');
        updates.rows.forEach(r => out.push(JSON.stringify(r)));

        fs.writeFileSync('dump_v2.txt', out.join('\n'));
        console.log('Dump saved to dump_v2.txt');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

run();
