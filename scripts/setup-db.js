// Run this once to set up the database:
// node scripts/setup-db.js

const { Pool } = require('pg')

const db = new Pool({
  connectionString: 'postgresql://postgres.nzycvzgcektymuhxquhx:nordex%40%23707T@aws-1-sa-east-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false },
})

async function setup() {
  console.log('🔧 Configurando banco de dados Nordex Portal...\n')

  try {
    await db.query('CREATE EXTENSION IF NOT EXISTS pgcrypto')
    console.log('✅ pgcrypto ativado')

    await db.query(`
      CREATE TABLE IF NOT EXISTS portal_users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT DEFAULT 'client' CHECK (role IN ('client', 'admin')),
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `)
    console.log('✅ Tabela portal_users criada')

    await db.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        client_id UUID NOT NULL REFERENCES portal_users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        description TEXT,
        preview_url TEXT,
        current_stage INTEGER DEFAULT 1 CHECK (current_stage BETWEEN 1 AND 6),
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      )
    `)
    console.log('✅ Tabela projects criada')

    await db.query(`
      CREATE TABLE IF NOT EXISTS project_updates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        stage INTEGER NOT NULL,
        title TEXT NOT NULL,
        message TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `)
    console.log('✅ Tabela project_updates criada')

    await db.query(`
      INSERT INTO portal_users (email, password_hash, name, role)
      VALUES (
        'admin@nordextech.com',
        crypt('NordexAdmin@2024', gen_salt('bf', 10)),
        'Admin Nordex',
        'admin'
      ) ON CONFLICT (email) DO NOTHING
    `)
    console.log('✅ Admin criado: admin@nordextech.com / NordexAdmin@2024')

    console.log('\n🎉 Setup concluído! O portal está pronto.')
  } catch (err) {
    console.error('❌ Erro no setup:', err)
  } finally {
    await db.end()
  }
}

setup()
