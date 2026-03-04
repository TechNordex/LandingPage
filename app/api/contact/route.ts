import { NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, whatsapp, challenge, teamSize } = body

    if (!name || !whatsapp) {
      return NextResponse.json({ error: "Nome e WhatsApp são obrigatórios." }, { status: 400 })
    }

    const { data, error } = await resend.emails.send({
      from: "Nordex Tech <onboarding@resend.dev>",
      to: ["technordex@gmail.com"],
      subject: `Novo Lead do Site: ${name}`,
      html: `
        <h2>Novo contato recebido pelo site!</h2>
        <p><strong>Nome:</strong> ${name}</p>
        <p><strong>WhatsApp:</strong> ${whatsapp}</p>
        <p><strong>Foco atual (Desafio):</strong> ${challenge || "Não informado"}</p>
        <p><strong>Tamanho da equipe:</strong> ${teamSize || "Não informado"}</p>
      `,
    })

    if (error) {
      console.error("Erro no Resend:", error)
      return NextResponse.json({ error: "Falha ao enviar e-mail." }, { status: 400 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error("Erro inesperado:", err)
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 })
  }
}

