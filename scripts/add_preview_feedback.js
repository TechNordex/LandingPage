// Migration: Add preview_feedback column to projects table
require('dotenv').config({ path: '.env.local' })
const { Pool } = require('pg')
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function run() {
  const client = await pool.connect()
  try {
    await client.query(`
      ALTER TABLE projects
      ADD COLUMN IF NOT EXISTS preview_feedback TEXT
    `)
    console.log('✅ preview_feedback column added to projects table')
  } catch (err) {
    console.error('❌ Error running migration:', err)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}
run()
