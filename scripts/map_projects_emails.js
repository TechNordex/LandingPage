require('dotenv').config({ path: '.env.local' })
const { Pool } = require('pg')
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function run() {
  const client = await pool.connect()
  try {
    console.log('--- PROJECTS MAPPING ---')
    const res = await client.query(`
      SELECT p.id as project_id, p.name as project_name, u.email as client_email, u.name as client_name, u.role
      FROM projects p
      JOIN portal_users u ON p.client_id = u.id
    `)
    console.table(res.rows)

  } catch (err) {
    console.error(err)
  } finally {
    client.release()
    await pool.end()
  }
}
run()
