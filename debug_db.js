require('dotenv').config({ path: '.env.local' })
const { Pool } = require('pg')
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function run() {
  const client = await pool.connect()
  try {
    const res = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'project_updates'
    `)
    console.log('--- PROJECT_UPDATES COLUMNS ---')
    console.table(res.rows)
    
    const count = await client.query('SELECT count(*) FROM project_updates')
    console.log('Total updates in DB:', count.rows[0].count)
    
    const sample = await client.query('SELECT * FROM project_updates LIMIT 3')
    console.log('Sample data:', JSON.stringify(sample.rows, null, 2))
  } catch (err) {
    console.error(err)
  } finally {
    client.release()
    await pool.end()
  }
}
run()
