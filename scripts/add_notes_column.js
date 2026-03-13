const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function main() {
    try {
        console.log("Verificando estrutura da tabela 'projects'...");
        await pool.query(`
            ALTER TABLE projects 
            ADD COLUMN IF NOT EXISTS client_notes TEXT DEFAULT '';
        `);
        console.log("Sucesso: Coluna 'client_notes' adicionada/verificada com sucesso.");
    } catch (err) {
        console.error("Erro na migração:", err);
    } finally {
        await pool.end();
    }
}

main();
