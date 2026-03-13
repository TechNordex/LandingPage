const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function main() {
    try {
        console.log("Verificando estrutura da tabela 'project_updates'...");
        await pool.query(`
            ALTER TABLE project_updates 
            ADD COLUMN IF NOT EXISTS client_note TEXT DEFAULT NULL;
        `);
        console.log("Sucesso: Coluna 'client_note' adicionada à tabela project_updates.");
    } catch (err) {
        console.error("Erro na migração:", err);
    } finally {
        await pool.end();
    }
}

main();
