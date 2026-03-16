import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function POST(req: NextRequest) {
    const session = await getSession()
    if (!session || session.role !== 'admin') {
        return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    try {
        const { project_id, stage, title, message, preview_url, hours_spent } = await req.json()
        if (!project_id || !stage || !title) {
            return NextResponse.json({ error: 'project_id, stage e title são obrigatórios' }, { status: 400 })
        }

        const result = await db.query(
            'INSERT INTO project_updates (project_id, stage, title, message, preview_url, hours_spent, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
            [project_id, stage, title, message || null, preview_url || null, hours_spent || null, session.id]
        )

        // Build the UPDATE query for the project
        // If a preview_url is provided → reset status to 'pending' (new link needs evaluation)
        // If preview_url is explicitly empty string → clear it and set status to 'none'
        const hasNewUrl = preview_url && preview_url.trim() !== ''
        const clearUrl = preview_url === ''

        let updateQuery = `UPDATE projects SET current_stage = $2, updated_at = now()`
        const queryParams: (string | number)[] = [project_id, stage]

        if (hasNewUrl) {
            updateQuery += `, preview_url = $${queryParams.length + 1}, preview_status = 'pending', preview_feedback = NULL`
            queryParams.push(preview_url.trim())
        } else if (clearUrl) {
            updateQuery += `, preview_url = NULL, preview_status = 'none', preview_feedback = NULL`
        }

        updateQuery += ` WHERE id = $1`

        await db.query(updateQuery, queryParams)
        await db.query('COMMIT')

        return NextResponse.json({ success: true }, { status: 201 })
    } catch (error) {
        await db.query('ROLLBACK')
        console.error('[admin/updates POST]', error)
        return NextResponse.json({ error: 'Erro ao postar atualização' }, { status: 500 })
    }
}

