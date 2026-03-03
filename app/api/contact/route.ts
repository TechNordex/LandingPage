import { Resend } from "resend"
import { NextResponse } from "next/server"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json()

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Campos obrigatórios ausentes." }, { status: 400 })
    }

    const { data, error } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "technordex@gmail.com",
      subject: `Novo contato via site: ${name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #f9f9f9; border-radius: 8px;">
          <h2 style="color: #1a1a1a; margin-bottom: 4px;">Novo contato via site</h2>
          <p style="color: #666; margin-top: 0; margin-bottom: 24px; font-size: 14px;">Alguém preencheu o formulário "Fale Conosco"</p>

          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5; width: 100px;">
                <strong style="color: #444; font-size: 13px;">NOME</strong>
              </td>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5; color: #1a1a1a;">
                ${name}
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5;">
                <strong style="color: #444; font-size: 13px;">EMAIL</strong>
              </td>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5;">
                <a href="mailto:${email}" style="color: #2563eb; text-decoration: none;">${email}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 0; vertical-align: top;">
                <strong style="color: #444; font-size: 13px;">MENSAGEM</strong>
              </td>
              <td style="padding: 12px 0; color: #1a1a1a; line-height: 1.6; white-space: pre-wrap;">
                ${message}
              </td>
            </tr>
          </table>

          <div style="margin-top: 32px; padding: 16px; background: #e8f4fd; border-left: 4px solid #2563eb; border-radius: 4px;">
            <p style="margin: 0; font-size: 13px; color: #444;">
              Responda diretamente para <a href="mailto:${email}" style="color: #2563eb;">${email}</a>
            </p>
          </div>
        </div>
      `,
    })

    if (error) {
      console.error("Resend API error:", error)
      return NextResponse.json({ error: "Erro ao enviar mensagem. Tente novamente." }, { status: 500 })
    }

    console.log("Email enviado com sucesso. ID:", data?.id)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Erro inesperado:", err)
    return NextResponse.json({ error: "Erro ao enviar mensagem. Tente novamente." }, { status: 500 })
  }
}

