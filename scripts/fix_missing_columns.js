const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const db = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function migrate() {
    console.log('--- Iniciando Fix de Colunas em projects ---');
    try {
        await db.query(`
            ALTER TABLE projects ADD COLUMN IF NOT EXISTS stage_url TEXT;
            ALTER TABLE projects ADD COLUMN IF NOT EXISTS prod_url TEXT;
            ALTER TABLE projects ADD COLUMN IF NOT EXISTS estimated_hours INTEGER;
        `);
        console.log('✅ Colunas stage_url, prod_url e estimated_hours adicionadas com sucesso.');
    } catch (err) {
        console.error('❌ Erro na migração:', err);
    } finally {
        await db.end();
        process.exit();
    }
}

migrate();
