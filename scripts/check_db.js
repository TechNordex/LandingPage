// Script to check user roles and project status
require('dotenv').config({ path: '.env.local' })
const { Pool } = require('pg')
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function run() {
  const client = await pool.connect()
  try {
    const users = await client.query('SELECT id, email, role FROM users')
    console.log('--- USERS ---')
    console.table(users.rows)

    const projects = await client.query('SELECT id, name, preview_url, preview_status FROM projects')
    console.log('--- PROJECTS ---')
    console.table(projects.rows)
  } catch (err) {
    console.error(err)
  } finally {
    client.release()
    await pool.end()
  }
}
run()
