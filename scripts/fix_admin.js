require('dotenv').config({ path: '.env.local' })
const { Pool } = require('pg')
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function run() {
  const client = await pool.connect()
  try {
    const res = await client.query("UPDATE users SET role = 'admin' WHERE email = 'admin@nordextech.com' RETURNING *")
    if (res.rowCount > 0) {
      console.log('✅ Admin role restored for admin@nordextech.com')
      console.table(res.rows)
    } else {
      console.log('❌ User not found')
    }
  } catch (err) {
    console.error('❌ DB Error:', err.message)
  } finally {
    client.release()
    await pool.end()
  }
}
run()
