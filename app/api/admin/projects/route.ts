import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET() {
    const session = await getSession()
    if (!session || session.role !== 'admin') {
        return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    try {
        const result = await db.query(`
      SELECT
        p.*,
        u.name as client_name,
        u.email as client_email,
        COALESCE(
          json_agg(pu ORDER BY pu.created_at DESC) FILTER (WHERE pu.id IS NOT NULL),
          '[]'
        ) as updates
      FROM projects p
      JOIN portal_users u ON p.client_id = u.id
      LEFT JOIN project_updates pu ON pu.project_id = p.id
      GROUP BY p.id, u.name, u.email
      ORDER BY p.updated_at DESC
    `)
        return NextResponse.json({ projects: result.rows })
    } catch (error) {
        console.error('[admin/projects GET]', error)
        return NextResponse.json({ error: 'Erro ao buscar projetos' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    const session = await getSession()
    if (!session || session.role !== 'admin') {
        return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    try {
        const { client_id, name, description, preview_url } = await req.json()
        if (!client_id || !name) {
            return NextResponse.json({ error: 'client_id e name são obrigatórios' }, { status: 400 })
        }

        const result = await db.query(
            `INSERT INTO projects (client_id, name, description, preview_url)
       VALUES ($1, $2, $3, $4) RETURNING *`,
            [client_id, name, description || null, preview_url || null]
        )
        return NextResponse.json({ project: result.rows[0] }, { status: 201 })
    } catch (error) {
        console.error('[admin/projects POST]', error)
        return NextResponse.json({ error: 'Erro ao criar projeto' }, { status: 500 })
    }
}
