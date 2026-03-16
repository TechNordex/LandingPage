require('dotenv').config({ path: '.env.local' })
const { Pool } = require('pg')
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function run() {
  const client = await pool.connect()
  try {
    const projects = await client.query('SELECT id, name, client_id FROM projects')
    console.log('--- PROJECTS ---')
    console.table(projects.rows)
    
    const updates = await client.query('SELECT id, project_id, title FROM project_updates')
    console.log('--- UPDATES ---')
    console.table(updates.rows)
    
    // Check if any project_id in updates DOES NOT exist in projects
    const orphans = await client.query('SELECT id, project_id FROM project_updates WHERE project_id NOT IN (SELECT id FROM projects)')
    if (orphans.rows.length > 0) {
      console.log('ORPHAN UPDATES FOUND:', orphans.rows.length)
      console.table(orphans.rows)
    } else {
      console.log('No orphan updates found.')
    }

  } catch (err) {
    console.error(err)
  } finally {
    client.release()
    await pool.end()
  }
}
run()
