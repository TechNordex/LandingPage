import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function POST(req: NextRequest) {
    const session = await getSession()
    if (!session || session.role !== 'admin') {
        return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    try {
        const { project_id, stage, title, message } = await req.json()
        if (!project_id || !stage || !title) {
            return NextResponse.json({ error: 'project_id, stage e title são obrigatórios' }, { status: 400 })
        }

        // Insert update AND update the project's current stage in a transaction
        await db.query('BEGIN')

        await db.query(
            `INSERT INTO project_updates (project_id, stage, title, message)
       VALUES ($1, $2, $3, $4)`,
            [project_id, stage, title, message || null]
        )

        await db.query(
            `UPDATE projects SET current_stage = $2, updated_at = now() WHERE id = $1`,
            [project_id, stage]
        )

        await db.query('COMMIT')

        return NextResponse.json({ success: true }, { status: 201 })
    } catch (error) {
        await db.query('ROLLBACK')
        console.error('[admin/updates POST]', error)
        return NextResponse.json({ error: 'Erro ao postar atualização' }, { status: 500 })
    }
}
