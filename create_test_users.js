require('dotenv').config({ path: '.env.local' })
const { Pool } = require('pg')
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function run() {
  const client = await pool.connect()
  try {
    // Ensure pgcrypto is available
    await client.query('CREATE EXTENSION IF NOT EXISTS pgcrypto')

    // Create Admin
    await client.query(`
      INSERT INTO portal_users (name, email, password_hash, role)
      VALUES ($1, $2, crypt($3, gen_salt('bf', 10)), $4)
      ON CONFLICT (email) DO UPDATE SET password_hash = crypt($3, gen_salt('bf', 10)), role = $4
    `, ['Test Admin', 'test_admin@nordex.tech', 'admin123', 'admin'])

    // Create Client
    await client.query(`
      INSERT INTO portal_users (name, email, password_hash, role)
      VALUES ($1, $2, crypt($3, gen_salt('bf', 10)), $4)
      ON CONFLICT (email) DO UPDATE SET password_hash = crypt($3, gen_salt('bf', 10)), role = $4
    `, ['Test Client', 'test_client@nordex.tech', 'client123', 'client'])

    console.log("Test users created successfully:")
    console.log("Admin: test_admin@nordex.tech / admin123")
    console.log("Client: test_client@nordex.tech / client123")
  } catch (err) {
    console.error("Error creating test users:", err)
  } finally {
    client.release()
    await pool.end()
  }
}
run()
