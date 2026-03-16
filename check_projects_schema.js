require('dotenv').config({ path: '.env.local' })
const { Pool } = require('pg')
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function run() {
  const client = await pool.connect()
  try {
    const res = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'projects'
    `)
    console.log('--- PROJECTS COLUMNS ---')
    console.table(res.rows)
  } catch (err) {
    console.error(err)
  } finally {
    client.release()
    await pool.end()
  }
}
run()
