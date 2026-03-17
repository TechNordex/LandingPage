import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'
import { sendUpdateNotification } from '@/lib/email'

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

        // Insert the update
        await db.query(
            'INSERT INTO project_updates (project_id, stage, title, message, preview_url, hours_spent, created_by, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
            [project_id, stage, title, message || null, preview_url || null, hours_spent || null, session.id, 'pending']
        )

        // Update the project stage / preview URL
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

        // ── Send email notification (non-blocking) ─────────────────────────
        void (async () => {
            try {
                // Fetch project + client info
                const projRes = await db.query(`
                    SELECT 
                        p.name AS project_name,
                        u.name AS client_name,
                        u.email AS client_email,
                        author.name AS author_name
                    FROM projects p
                    LEFT JOIN portal_users u ON u.id = p.client_id
                    LEFT JOIN portal_users author ON author.id = $2
                    WHERE p.id = $1
                `, [project_id, session.id])

                if (projRes.rows.length > 0) {
                    const row = projRes.rows[0]
                    if (row.client_email) {
                        await sendUpdateNotification({
                            clientName: row.client_name || 'Cliente',
                            clientEmail: row.client_email,
                            projectName: row.project_name,
                            updateTitle: title,
                            updateMessage: message || undefined,
                            updateStage: stage,
                            authorName: row.author_name || 'Equipe Nordex',
                        })
                    }
                }
            } catch (emailErr) {
                // Never fail the main request because of email
                console.error('[updates POST] Email error (non-fatal):', emailErr)
            }
        })()
        // ──────────────────────────────────────────────────────────────────

        return NextResponse.json({ success: true }, { status: 201 })
    } catch (error: any) {
        console.error('[admin/updates POST]', error)
        return NextResponse.json({ error: error.message || 'Erro ao postar atualização' }, { status: 500 })
    }
}
