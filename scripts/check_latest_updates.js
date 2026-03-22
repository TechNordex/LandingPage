require('dotenv').config({ path: '.env.local' })
const { Pool } = require('pg')
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function run() {
  const client = await pool.connect()
  try {
    console.log('--- LATEST 10 PROJECT UPDATES ---')
    const updates = await client.query(`
      SELECT u.id, u.title, u.created_at, p.name as project, pu.email as client_email
      FROM project_updates u
      JOIN projects p ON u.project_id = p.id
      JOIN portal_users pu ON p.client_id = pu.id
      ORDER BY u.created_at DESC
      LIMIT 10
    `)
    console.table(updates.rows)

  } catch (err) {
    console.error(err)
  } finally {
    client.release()
    await pool.end()
  }
}
run()
