import { NextResponse } from "next/server"
import { Resend } from "resend"

// Lazy init resend to avoid build-time crashes if key is missing
const getResend = () => new Resend(process.env.RESEND_API_KEY || 're_config_placeholder')

export async function POST(request: Request) {
  const resend = getResend()
  try {
    const body = await request.json()
    const { name, whatsapp, challenge, teamSize } = body

    if (!name || !whatsapp) {
      return NextResponse.json({ error: "Nome e WhatsApp são obrigatórios." }, { status: 400 })
    }

    const { data, error } = await resend.emails.send({
      from: "Nordex Tech <contato@nordex.tech>",
      to: ["contato@nordex.tech"],
      subject: `Novo Lead do Site: ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #111111; color: #f2f2f2; margin: 0; padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #1a1a1a; border: 1px solid #333333; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #000000; padding: 24px; text-align: center; border-bottom: 2px solid #f5a800;">
              <h1 style="margin: 0; color: #f5a800; font-size: 24px; font-weight: bold; letter-spacing: 1px;">NORDEX TECH</h1>
            </div>
            
            <div style="padding: 32px 24px;">
              <h2 style="font-size: 20px; margin-top: 0; margin-bottom: 24px; color: #ffffff;">Novo Lead do Site! 🚀</h2>
              
              <div style="margin-bottom: 16px;">
                <span style="display: block; font-size: 12px; text-transform: uppercase; color: #a1a1aa; margin-bottom: 4px; letter-spacing: 1px;">Nome do Contato</span>
                <span style="display: block; font-size: 16px; color: #f2f2f2; background-color: #222222; padding: 12px; border-radius: 6px; border-left: 3px solid #f5a800;">${name}</span>
              </div>
              
              <div style="margin-bottom: 16px;">
                <span style="display: block; font-size: 12px; text-transform: uppercase; color: #a1a1aa; margin-bottom: 4px; letter-spacing: 1px;">WhatsApp</span>
                <span style="display: block; font-size: 16px; color: #f2f2f2; background-color: #222222; padding: 12px; border-radius: 6px; border-left: 3px solid #f5a800;">${whatsapp}</span>
              </div>
              
              <div style="margin-bottom: 16px;">
                <span style="display: block; font-size: 12px; text-transform: uppercase; color: #a1a1aa; margin-bottom: 4px; letter-spacing: 1px;">Desafio / Foco Atual</span>
                <span style="display: block; font-size: 16px; color: #f2f2f2; background-color: #222222; padding: 12px; border-radius: 6px; border-left: 3px solid #f5a800;">${challenge || "Não informado"}</span>
              </div>
              
              <div style="margin-bottom: 16px;">
                <span style="display: block; font-size: 12px; text-transform: uppercase; color: #a1a1aa; margin-bottom: 4px; letter-spacing: 1px;">Tamanho da Equipe</span>
                <span style="display: block; font-size: 16px; color: #f2f2f2; background-color: #222222; padding: 12px; border-radius: 6px; border-left: 3px solid #f5a800;">${teamSize || "Não informado"}</span>
              </div>
              
              <div style="text-align: center; margin-top: 32px;">
                <a href="https://wa.me/55${whatsapp.replace(/\D/g, "")}" style="display: inline-block; background-color: #f5a800; color: #000000; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: bold; font-size: 14px;">Chamar no WhatsApp</a>
              </div>
            </div>
            
            <div style="background-color: #000000; padding: 16px; text-align: center; font-size: 12px; color: #666666;">
              Este e-mail foi gerado automaticamente pelo formulário da Nordex Tech.
            </div>
          </div>
        </div>
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

