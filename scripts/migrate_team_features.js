const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        console.log('Ensuring Team Management columns in portal_users...');
        
        await pool.query(`
            ALTER TABLE portal_users 
            ADD COLUMN IF NOT EXISTS position TEXT DEFAULT 'Membro da Equipe',
            ADD COLUMN IF NOT EXISTS avatar_url TEXT,
            ADD COLUMN IF NOT EXISTS bio TEXT;
        `);
        console.log('Columns added to portal_users.');

        console.log('Creating project_assignments table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS project_assignments (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
                user_id UUID REFERENCES portal_users(id) ON DELETE CASCADE,
                assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                UNIQUE(project_id, user_id)
            );
        `);
        console.log('Table project_assignments ensured.');

    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await pool.end();
    }
}

run();
