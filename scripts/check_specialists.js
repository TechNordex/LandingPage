require('dotenv').config({ path: '.env.local' })
const { Pool } = require('pg')
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function run() {
  const client = await pool.connect()
  try {
    const res = await client.query(`
      SELECT id, name, position, bio 
      FROM portal_users 
      WHERE name ILIKE '%Gustavo%' OR name ILIKE '%Deyvid%' OR name ILIKE '%Adson%'
    `)
    console.log('--- SPECIALISTS ---')
    console.log(JSON.stringify(res.rows, null, 2))
  } catch (err) {
    console.error(err)
  } finally {
    client.release()
    await pool.end()
  }
}
run()
