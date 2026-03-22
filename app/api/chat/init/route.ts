import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function POST(req: Request) {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    try {
        const { targetUserId, projectId, isGroup } = await req.json()

        if (isGroup && projectId) {
            // Check if group chat already exists for this project
            const existingGroup = await db.query(
                `SELECT id FROM chat_conversations WHERE type = 'group' AND project_id = $1 LIMIT 1`,
                [projectId]
            )
            if (existingGroup.rows.length > 0) {
                const convId = existingGroup.rows[0].id
                // Ensure participation
                const partCheck = await db.query(
                    `SELECT 1 FROM chat_participants WHERE conversation_id = $1 AND user_id = $2`,
                    [convId, session.id]
                )
                if (partCheck.rows.length === 0) {
                    await db.query(
                        `INSERT INTO chat_participants (conversation_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
                        [convId, session.id]
                    )
                }
                return NextResponse.json({ conversationId: convId })
            }

            // Create group
            const client = await db.connect()
            try {
                const groupName = `${session.name || 'Cliente'} Grupo`
                await client.query('BEGIN')
                const insertRes = await client.query(
                    `INSERT INTO chat_conversations (type, project_id, name) VALUES ('group', $1, $2) RETURNING id`,
                    [projectId, groupName]
                )
                const newId = insertRes.rows[0].id

                // Add assignments
                const assigns = await client.query(`SELECT user_id FROM project_assignments WHERE project_id = $1`, [projectId])
                const usersToInclude = new Set([session.id, ...assigns.rows.map((r: any) => r.user_id)])

                for (const uid of Array.from(usersToInclude)) {
                    await client.query(`INSERT INTO chat_participants (conversation_id, user_id) VALUES ($1, $2)`, [newId, uid])
                }
                await client.query('COMMIT')
                return NextResponse.json({ conversationId: newId })
            } catch (err) {
                await client.query('ROLLBACK')
                throw err
            } finally {
                client.release()
            }
        }

        if (!targetUserId) {
            return NextResponse.json({ error: 'Missing targetUserId' }, { status: 400 })
        }

        // Check if direct conversation already exists
        const existingCheck = await db.query(`
            SELECT c.id 
            FROM chat_conversations c
            JOIN chat_participants p1 ON c.id = p1.conversation_id
            JOIN chat_participants p2 ON c.id = p2.conversation_id
            WHERE c.type = 'direct' 
              AND p1.user_id = $1 
              AND p2.user_id = $2
            ORDER BY c.updated_at DESC
            LIMIT 1
        `, [session.id, targetUserId])

        if (existingCheck.rows.length > 0) {
            return NextResponse.json({ conversationId: existingCheck.rows[0].id })
        }

        // Begin transaction to create new conversation
        const client = await db.connect()
        try {
            await client.query('BEGIN')

            const insertRes = await client.query(
                `INSERT INTO chat_conversations (type, project_id) VALUES ('direct', $1) RETURNING id`,
                [projectId || null]
            )
            const newId = insertRes.rows[0].id

            // Add Participants
            await client.query(
                `INSERT INTO chat_participants (conversation_id, user_id) VALUES ($1, $2), ($1, $3)`,
                [newId, session.id, targetUserId]
            )

            await client.query('COMMIT')
            return NextResponse.json({ conversationId: newId })
        } catch (txnError) {
            await client.query('ROLLBACK')
            throw txnError
        } finally {
            client.release()
        }

    } catch (error) {
        console.error('[chat/init POST]', error)
        return NextResponse.json({ error: 'Erro ao iniciar conversa' }, { status: 500 })
    }
}
