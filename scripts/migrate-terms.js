// Migration: Add terms_accepted_at column to portal_users
// Run: node scripts/migrate-terms.js

const { Pool } = require('pg')

const db = new Pool({
  connectionString: 'postgresql://postgres.nzycvzgcektymuhxquhx:nordex%40%23707T@aws-1-sa-east-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false },
})

async function migrate() {
  console.log('🔧 Aplicando migração: terms_accepted_at...\n')
  try {
    await db.query(`
      ALTER TABLE portal_users 
      ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ DEFAULT NULL
    `)
    console.log('✅ Coluna terms_accepted_at adicionada à portal_users')
    console.log('\n🎉 Migração concluída com sucesso!')
  } catch (err) {
    console.error('❌ Erro na migração:', err)
  } finally {
    await db.end()
  }
}

migrate()
