require('dotenv').config({ path: '.env.local' })
const { Pool } = require('pg')
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function run() {
  const client = await pool.connect()
  try {
    console.log('--- ALL PORTAL USERS ---')
    const users = await client.query('SELECT id, email, name, role FROM portal_users')
    console.table(users.rows)

  } catch (err) {
    console.error(err)
  } finally {
    client.release()
    await pool.end()
  }
}
run()
