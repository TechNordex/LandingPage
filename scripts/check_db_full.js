require('dotenv').config({ path: '.env.local' })
const { Pool } = require('pg')
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function run() {
  const client = await pool.connect()
  try {
    console.log('--- CHECKING PROJECTS & CLIENTS ---')
    const projects = await client.query(`
      SELECT p.id, p.name, p.client_id, u.email as client_email, u.name as client_name
      FROM projects p
      LEFT JOIN portal_users u ON u.id = p.client_id
    `)
    console.table(projects.rows)

    console.log('\n--- CHECKING EMAIL TEMPLATES ---')
    try {
        const templates = await client.query('SELECT * FROM email_templates')
        console.table(templates.rows)
    } catch (e) {
        console.log('email_templates table does NOT exist')
    }

    console.log('\n--- CHECKING LATEST UPDATES ---')
    const updates = await client.query('SELECT id, project_id, title, status, created_at, revision_of FROM project_updates ORDER BY created_at DESC LIMIT 10')
    console.table(updates.rows)

  } catch (err) {
    console.error(err)
  } finally {
    client.release()
    await pool.end()
  }
}
run()
