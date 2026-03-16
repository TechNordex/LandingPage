const { Pool } = require('pg');
require('dotenv').config();

const db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    console.log('--- Iniciando Migração de Horas ---');
    try {
        await db.query(`
            ALTER TABLE projects ADD COLUMN IF NOT EXISTS estimated_hours INTEGER;
            ALTER TABLE project_updates ADD COLUMN IF NOT EXISTS hours_spent INTEGER;
        `);
        console.log('✅ Colunas estimated_hours e hours_spent adicionadas com sucesso.');
    } catch (err) {
        console.error('❌ Erro na migração:', err);
    } finally {
        await db.end();
        process.exit();
    }
}

migrate();
