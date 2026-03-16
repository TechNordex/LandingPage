require('dotenv').config({ path: '.env.local' })
const { Pool } = require('pg')
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function run() {
  const client = await pool.connect()
  try {
    const res = await client.query('SELECT * FROM project_updates LIMIT 5')
    console.log('--- PROJECT UPDATES DATA ---')
    console.log(JSON.stringify(res.rows, null, 2))
    
    const projects = await client.query('SELECT id, name FROM projects')
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
