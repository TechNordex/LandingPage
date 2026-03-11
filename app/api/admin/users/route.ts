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
      SELECT id, email, name, role, created_at
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
        const { name, email, password, role = 'client' } = await req.json()
        if (!name || !email || !password) {
            return NextResponse.json({ error: 'Nome, email e senha são obrigatórios' }, { status: 400 })
        }

        if (role !== 'client' && role !== 'admin') {
            return NextResponse.json({ error: 'Role inválida' }, { status: 400 })
        }

        const result = await db.query(
            `INSERT INTO portal_users (name, email, password_hash, role)
       VALUES ($1, $2, crypt($3, gen_salt('bf', 10)), $4)
       RETURNING id, email, name, role, created_at`,
            [name, email.toLowerCase().trim(), password, role]
        )
        return NextResponse.json({ user: result.rows[0] }, { status: 201 })
    } catch (error: any) {
        console.error('[admin/users POST]', error)
        if (error.code === '23505') { // unique violation
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
        const { id, name, email, password, role } = await req.json()

        if (!id) {
            return NextResponse.json({ error: 'ID do usuário é obrigatório' }, { status: 400 })
        }

        if (role && role !== 'client' && role !== 'admin') {
            return NextResponse.json({ error: 'Role inválida' }, { status: 400 })
        }

        // Build dynamic query depending on whether password is provided
        let query = `UPDATE portal_users SET name = $1, email = $2, role = $3`
        const values = [name, email.toLowerCase().trim(), role]

        if (password) {
            query += `, password_hash = crypt($4, gen_salt('bf', 10))`
            values.push(password)
        }

        query += ` WHERE id = $${values.length + 1} RETURNING id, email, name, role, created_at`
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
