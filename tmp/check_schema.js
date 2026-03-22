const { Client } = require('pg');
require('dotenv').config();

async function check() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    try {
        await client.connect();
        const res = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'project_updates' AND column_name = 'hours_spent'");
        console.log('RESULT:', res.rows[0]);
    } catch (e) {
        console.log('ERROR:', e.message);
    } finally {
        await client.end();
    }
}
check();
