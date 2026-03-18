const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function checkSchema() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
    });

    try {
        const res = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'project_updates'
        `);
        const columns = res.rows.map(r => r.column_name);
        console.log('Columns in project_updates:', columns);
        
        if (columns.includes('revision_of')) {
            console.log('✅ Column revision_of exists');
        } else {
            console.log('❌ Column revision_of does NOT exist');
        }

        const indexRes = await pool.query(`
            SELECT indexname 
            FROM pg_indexes 
            WHERE tablename = 'project_updates' AND indexname = 'idx_project_updates_revision_of'
        `);
        if (indexRes.rows.length > 0) {
            console.log('✅ Index idx_project_updates_revision_of exists');
        } else {
            console.log('❌ Index idx_project_updates_revision_of does NOT exist');
        }

    } catch (error) {
        console.error('Error checking schema:', error);
    } finally {
        await pool.end();
    }
}

checkSchema();
