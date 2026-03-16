require('dotenv').config({ path: '.env.local' })
const { Pool } = require('pg')
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

const specialists = [
  {
    name: 'Gustavo Montenegro',
    position: 'Co-Founder & CTO',
    bio: 'Arquiteto de Software e desenvolvedor Fullcycle. Responsável pelo ciclo de vida completo das aplicações e na tradução de necessidades de negócio em soluções técnicas.'
  },
  {
    name: 'Deyvid Silva',
    position: 'Co-Founder & CTO',
    bio: 'Especialista em Inteligência Artificial e automação de fluxos. Responsável pela persistência, modelagem e integridade de dados das aplicações.'
  },
  {
    name: 'Adson Vicente',
    position: 'Co-Founder & CTO',
    bio: 'Gestor de Operações, Cloud e orquestração de serviços de deploy. Garante a alta disponibilidade, performance de rede e segurança da infraestrutura.'
  }
]

async function run() {
  const client = await pool.connect()
  try {
    for (const spec of specialists) {
      const res = await client.query(
        'UPDATE portal_users SET position = $1, bio = $2 WHERE name ILIKE $3 RETURNING id, name',
        [spec.position, spec.bio, `%${spec.name}%`]
      )
      if (res.rows.length > 0) {
        console.log(`Updated: ${res.rows[0].name}`)
      } else {
        console.log(`Not found: ${spec.name}`)
      }
    }
  } catch (err) {
    console.error(err)
  } finally {
    client.release()
    await pool.end()
  }
}
run()
