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
      SELECT id, email, name, role, position, avatar_url, bio, created_at
      FROM portal_users
      ORDER BY name ASC
    `)
        return NextResponse.json({ users: result.rows })
    } catch (error) {
        console.error('[admin/users GET]', error)
        return NextResponse.json({ error: 'Erro ao buscar usuários' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    const session = await getSession()
    if (!session || session.role !== 'admin') {
        return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    try {
        const { name, email, password, role = 'client', position, avatar_url, bio } = await req.json()
        if (!name || !email || !password) {
            return NextResponse.json({ error: 'Nome, email e senha são obrigatórios' }, { status: 400 })
        }

        if (role !== 'client' && role !== 'admin') {
            return NextResponse.json({ error: 'Role inválida' }, { status: 400 })
        }

        const result = await db.query(
            `INSERT INTO portal_users (name, email, password_hash, role, position, avatar_url, bio)
       VALUES ($1, $2, crypt($3, gen_salt('bf', 10)), $4, $5, $6, $7)
       RETURNING id, email, name, role, position, avatar_url, bio, created_at`,
            [name, email.toLowerCase().trim(), password, role, position || 'Membro da Equipe', avatar_url || null, bio || null]
        )
        return NextResponse.json({ user: result.rows[0] }, { status: 201 })
    } catch (error: any) {
        console.error('[admin/users POST]', error)
        if (error.code === '23505') {
            return NextResponse.json({ error: 'Email já cadastrado' }, { status: 409 })
        }
        return NextResponse.json({ error: 'Erro ao criar usuário' }, { status: 500 })
    }
}

export async function PUT(req: NextRequest) {
    const session = await getSession()
    if (!session || session.role !== 'admin') {
        return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    try {
        const { id, name, email, password, role, position, avatar_url, bio } = await req.json()

        if (!id) {
            return NextResponse.json({ error: 'ID do usuário é obrigatório' }, { status: 400 })
        }

        if (role && role !== 'client' && role !== 'admin') {
            return NextResponse.json({ error: 'Role inválida' }, { status: 400 })
        }

        let query = `UPDATE portal_users SET name = $1, email = $2, role = $3, position = $4, avatar_url = $5, bio = $6`
        const values: any[] = [name, email.toLowerCase().trim(), role, position, avatar_url, bio]

        if (password) {
            query += `, password_hash = crypt($7, gen_salt('bf', 10))`
            values.push(password)
        }

        query += ` WHERE id = $${values.length + 1} RETURNING id, email, name, role, position, avatar_url, bio, created_at`
        values.push(id)

        const result = await db.query(query, values)

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
        }

        return NextResponse.json({ user: result.rows[0] }, { status: 200 })
    } catch (error: any) {
        console.error('[admin/users PUT]', error)
        if (error.code === '23505') {
            return NextResponse.json({ error: 'Email já cadastrado' }, { status: 409 })
        }
        return NextResponse.json({ error: 'Erro ao atualizar usuário' }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest) {
    const session = await getSession()
    if (!session || session.role !== 'admin') {
        return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    try {
        const { id, force } = await req.json()

        if (!id) {
            return NextResponse.json({ error: 'ID do usuário é obrigatório' }, { status: 400 })
        }

        if (id === session.id) {
            return NextResponse.json({ error: 'Você não pode excluir sua própria conta.' }, { status: 403 })
        }

        const projectCheck = await db.query(
            `SELECT id, name FROM projects WHERE client_id = $1`,
            [id]
        )

        if (projectCheck.rows.length > 0 && !force) {
            return NextResponse.json({
                warning: true,
                projects: projectCheck.rows,
                message: `Este usuário possui ${projectCheck.rows.length} projeto(s) vinculado(s). A exclusão irá remover todos os registros associados permanentemente.`
            }, { status: 409 })
        }

        await db.query('DELETE FROM portal_users WHERE id = $1', [id])
        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('[admin/users DELETE]', error)
        return NextResponse.json({ error: 'Erro ao excluir usuário' }, { status: 500 })
    }
}
