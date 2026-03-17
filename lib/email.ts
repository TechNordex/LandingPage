import { Resend } from 'resend'
import { db } from './db'

const resend = new Resend(process.env.RESEND_API_KEY)

const DEFAULT_TEMPLATE = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Nova Atualização do Projeto</title>
  <style>
    body { margin: 0; padding: 0; background: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    .wrapper { max-width: 600px; margin: 40px auto; background: #111111; border: 1px solid #222; border-radius: 16px; overflow: hidden; }
    .header { background: #111; padding: 32px 40px; border-bottom: 1px solid #222; }
    .header img { height: 36px; }
    .badge { display: inline-block; background: rgba(245,168,0,0.1); color: #f5a800; font-size: 11px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; padding: 4px 10px; border-radius: 4px; border: 1px solid rgba(245,168,0,0.2); margin-top: 12px; }
    .body { padding: 40px; }
    .greeting { font-size: 15px; color: #888; margin-bottom: 24px; }
    .greeting strong { color: #fff; }
    .update-card { background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 12px; padding: 24px; margin-bottom: 24px; }
    .stage-label { font-size: 11px; font-weight: 700; color: #f5a800; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 12px; }
    .update-title { font-size: 20px; font-weight: 700; color: #ffffff; margin: 0 0 12px; }
    .update-message { font-size: 14px; color: #aaa; line-height: 1.7; margin: 0; }
    .author-row { display: flex; align-items: center; gap: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #2a2a2a; }
    .author-avatar { width: 36px; height: 36px; border-radius: 50%; background: rgba(245,168,0,0.15); border: 1px solid rgba(245,168,0,0.3); display: flex; align-items: center; justify-center: center; font-size: 14px; font-weight: 700; color: #f5a800; text-align: center; line-height: 36px; }
    .author-name { font-size: 13px; font-weight: 600; color: #fff; }
    .author-label { font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 0.1em; }
    .cta { text-align: center; margin: 32px 0; }
    .cta a { display: inline-block; background: #f5a800; color: #000; font-size: 14px; font-weight: 700; padding: 14px 32px; border-radius: 8px; text-decoration: none; letter-spacing: 0.05em; }
    .footer { padding: 24px 40px; border-top: 1px solid #1a1a1a; text-align: center; }
    .footer p { font-size: 12px; color: #444; margin: 4px 0; }
    .footer a { color: #666; text-decoration: none; }
    .divider { height: 3px; background: linear-gradient(90deg, transparent, #f5a800, transparent); }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="divider"></div>
    <div class="header">
      <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo-Nordex-Tech-remove-WSehNqsem3EZQ2jxpk0CKTKMU1hLtG.png" alt="Nordex Tech" />
      <div class="badge">Nova Atualização</div>
    </div>
    <div class="body">
      <p class="greeting">Olá, <strong>{{clientName}}</strong>! Seu projeto recebeu uma nova atualização.</p>
      <div class="update-card">
        <div class="stage-label">Etapa {{updateStage}}</div>
        <h2 class="update-title">{{updateTitle}}</h2>
        {{#if updateMessage}}
        <p class="update-message">{{updateMessage}}</p>
        {{/if}}
        <div class="author-row">
          <div class="author-avatar">{{authorInitial}}</div>
          <div>
            <div class="author-name">{{authorName}}</div>
            <div class="author-label">Especialista Nordex</div>
          </div>
        </div>
      </div>
      <div class="cta">
        <a href="{{portalUrl}}">Ver no Portal →</a>
      </div>
    </div>
    <div class="footer">
      <p>Você recebeu este email porque é cliente da Nordex Tech.</p>
      <p>Projeto: <strong style="color:#888">{{projectName}}</strong></p>
      <p style="margin-top:12px"><a href="https://nordex.tech">nordex.tech</a></p>
    </div>
    <div class="divider"></div>
  </div>
</body>
</html>
`

function renderTemplate(template: string, vars: Record<string, string>): string {
    let html = template
    for (const [key, value] of Object.entries(vars)) {
        html = html.replaceAll(`{{${key}}}`, value || '')
    }
    // Handle simple {{#if var}}...{{/if}} blocks
    html = html.replace(/\{\{#if (\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (_, varName, content) => {
        return vars[varName] ? content : ''
    })
    return html
}

export async function sendUpdateNotification({
    clientName,
    clientEmail,
    projectName,
    updateTitle,
    updateMessage,
    updateStage,
    authorName,
}: {
    clientName: string
    clientEmail: string
    projectName: string
    updateTitle: string
    updateMessage?: string
    updateStage: number
    authorName: string
}) {
    try {
        // Try to get custom template from DB, fallback to default
        let templateHtml = DEFAULT_TEMPLATE
        let customSubject: string | null = null

        try {
            const res = await db.query('SELECT html, subject FROM email_templates WHERE key = $1 LIMIT 1', ['update_notification'])
            if (res.rows.length > 0) {
                if (res.rows[0].html) templateHtml = res.rows[0].html
                if (res.rows[0].subject) customSubject = res.rows[0].subject
            }
        } catch {
            // Table may not exist yet — use default
        }

        const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL || 'https://portal.nordex.tech/dashboard'
        const authorInitial = authorName ? authorName.charAt(0).toUpperCase() : 'N'

        const html = renderTemplate(templateHtml, {
            clientName,
            projectName,
            updateTitle,
            updateMessage: updateMessage || '',
            updateStage: String(updateStage),
            authorName,
            authorInitial,
            portalUrl,
        })

        // Render subject if it's custom
        let finalSubject = `[${projectName}] Nova atualização: ${updateTitle}`
        if (customSubject) {
            finalSubject = renderTemplate(customSubject, {
                clientName,
                projectName,
                updateTitle,
                updateStage: String(updateStage),
                authorName,
                portalUrl,
            })
        }

        const { data, error } = await resend.emails.send({
            from: process.env.RESEND_FROM || 'Nordex Tech <noreply@nordex.tech>',
            to: [clientEmail],
            subject: finalSubject,
            html,
        })

        if (error) {
            console.error('[email] Resend error:', error)
            return { success: false, error }
        }

        console.log('[email] Sent successfully to', clientEmail, '| id:', data?.id)
        return { success: true, id: data?.id }
    } catch (err) {
        console.error('[email] Unexpected error:', err)
        return { success: false, error: err }
    }
}
