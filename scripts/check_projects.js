const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        console.log('Checking projects table structure...');
        const resDir = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'projects'
        `);
        console.log('Columns:', resDir.rows);
        
        const resProj = await pool.query(`SELECT COUNT(*) FROM projects`);
        console.log('Total projects count:', resProj.rows[0].count);
        
        const resProjData = await pool.query(`SELECT id, name, deleted_at FROM projects LIMIT 10`);
        console.log('Projects Data Sample:', resProjData.rows);

    } catch (err) {
        console.error('Error during check:', err);
    } finally {
        await pool.end();
    }
}

run();
