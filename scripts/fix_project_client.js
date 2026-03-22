require('dotenv').config({ path: '.env.local' })
const { Pool } = require('pg')
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function run() {
  const client = await pool.connect()
  try {
    const targetEmail = 'adsonlauriano332211@gmail.com';
    const projectName = 'adson teste';
    
    const userRes = await client.query('SELECT id FROM portal_users WHERE email = $1 LIMIT 1', [targetEmail]);
    if (userRes.rows.length === 0) {
        console.error('User not found:', targetEmail);
        return;
    }
    const correctClientId = userRes.rows[0].id;
    
    const updateRes = await client.query('UPDATE projects SET client_id = $1 WHERE name = $2', [correctClientId, projectName]);
    console.log(`Updated ${updateRes.rowCount} project(s) to client_id ${correctClientId}`);

  } catch (err) {
    console.error(err)
  } finally {
    client.release()
    await pool.end()
  }
}
run()
