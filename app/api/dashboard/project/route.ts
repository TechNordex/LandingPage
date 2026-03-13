import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET() {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    try {
        const userResult = await db.query(
            'SELECT id, name, email, terms_accepted_at FROM portal_users WHERE id = $1',
            [session.id]
        )
        const user = userResult.rows[0]

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
            user: { name: user.name, email: user.email },
            termsAccepted: !!user.terms_accepted_at,
        })
    } catch (error) {
        console.error('[dashboard/project GET]', error)
        return NextResponse.json({ error: 'Erro ao buscar projeto' }, { status: 500 })
    }
}

// Update client notes
export async function PUT(req: Request) {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    try {
        const { notes } = await req.json()
        
        await db.query(
            'UPDATE projects SET client_notes = $1 WHERE client_id = $2',
            [notes || '', session.id]
        )

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('[dashboard/project PUT]', error)
        return NextResponse.json({ error: 'Erro ao atualizar anotações' }, { status: 500 })
    }
}
