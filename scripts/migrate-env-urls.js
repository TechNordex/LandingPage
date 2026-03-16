const { Pool } = require('pg');
require('dotenv').config();

const db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    console.log('--- Iniciando Migração de Ambientes ---');
    try {
        await db.query(`
            ALTER TABLE projects ADD COLUMN IF NOT EXISTS stage_url TEXT;
            ALTER TABLE projects ADD COLUMN IF NOT EXISTS prod_url TEXT;
        `);
        console.log('✅ Colunas stage_url e prod_url adicionadas com sucesso.');
    } catch (err) {
        console.error('❌ Erro na migração:', err);
    } finally {
        await db.end();
        process.exit();
    }
}

migrate();
