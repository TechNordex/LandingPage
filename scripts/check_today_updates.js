require('dotenv').config({ path: '.env.local' })
const { Pool } = require('pg')
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function run() {
  const client = await pool.connect()
  try {
    const today = new Date().toISOString().split('T')[0];
    console.log('--- UPDATES CREATED TODAY (', today, ') ---')
    const updates = await client.query(`
      SELECT u.id, u.title, u.created_at, p.name as project, pu.email as client_email
      FROM project_updates u
      JOIN projects p ON u.project_id = p.id
      JOIN portal_users pu ON p.client_id = pu.id
      WHERE u.created_at::text LIKE $1
      ORDER BY u.created_at DESC
    `, [today + '%'])
    console.table(updates.rows)

    if (updates.rows.length === 0) {
        console.log('No updates found for today in the database.')
    }

  } catch (err) {
    console.error(err)
  } finally {
    client.release()
    await pool.end()
  }
}
run()
