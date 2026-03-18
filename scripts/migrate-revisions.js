/**
 * Migration: Add revision_of column to project_updates
 * Run: node scripts/migrate-revisions.js
 */
const { Pool } = require('pg')

const db = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres.nzycvzgcektymuhxquhx:nordex%40%23707T@aws-1-sa-east-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false },
})

async function migrate() {
  console.log('🔧 Rodando migração: revision_of...\n')
  try {
    // Add revision_of column (self-referencing FK)
    await db.query(`
      ALTER TABLE project_updates
      ADD COLUMN IF NOT EXISTS revision_of UUID
        REFERENCES project_updates(id) ON DELETE SET NULL;
    `)
    console.log('✅ Coluna revision_of adicionada com sucesso.')

    // Add index for fast lookups
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_project_updates_revision_of
        ON project_updates(revision_of);
    `)
    console.log('✅ Index de busca criado com sucesso.')

    console.log('\n🎉 Migração concluída! Sistema de revisões pronto.')
  } catch (err) {
    console.error('❌ Erro na migração:', err)
    process.exit(1)
  } finally {
    await db.end()
  }
}

migrate()
