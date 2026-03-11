import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET() {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    try {
        const project = await db.query(
            'SELECT * FROM projects WHERE client_id = $1',
            [session.id]
        )

        const updates = project.rows[0]
            ? await db.query(
                'SELECT * FROM project_updates WHERE project_id = $1 ORDER BY created_at DESC',
                [project.rows[0].id]
            )
            : { rows: [] }

        return NextResponse.json({
            project: project.rows[0] ?? null,
            updates: updates.rows,
            user: { name: session.name, email: session.email }
        })
    } catch (error) {
        console.error('[dashboard/project]', error)
        return NextResponse.json({ error: 'Erro ao buscar projeto' }, { status: 500 })
    }
}
