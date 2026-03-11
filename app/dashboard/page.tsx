'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { LogOut, ExternalLink, Loader2 } from 'lucide-react'
import { ProjectTracker } from '@/components/project-tracker'
import type { Project, ProjectUpdate } from '@/lib/types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

function useTypewriter(target: string, { speed = 70, startDelay = 300 } = {}) {
    const [text, setText] = useState("")
    const [isDone, setIsDone] = useState(false)

    useEffect(() => {
        setText("")
        setIsDone(false)
        if (!target) return

        const timers: ReturnType<typeof setTimeout>[] = []
        const startId = setTimeout(() => {
            let i = 0
            const intervalId = setInterval(() => {
                i++
                setText(target.slice(0, i))
                if (i >= target.length) {
                    clearInterval(intervalId)
                    const doneId = setTimeout(() => setIsDone(true), 800)
                    timers.push(doneId)
                }
            }, speed)
            timers.push(intervalId as unknown as ReturnType<typeof setTimeout>)
        }, startDelay)

        timers.push(startId)
        return () => timers.forEach(clearTimeout)
    }, [target, speed, startDelay])

    return { text, isDone }
}

const AnimatedName = ({ name }: { name?: string }) => {
    const { text: typed, isDone } = useTypewriter(name || "", { speed: 70, startDelay: 300 })
    return (
        <span className="text-primary whitespace-nowrap">
            {typed}
            <span
                aria-hidden="true"
                className="inline-block w-[3px] h-[0.85em] bg-primary align-middle ml-[2px] rounded-sm"
                style={{
                    animationName: isDone ? "none" : "cursorBlink",
                    animationDuration: "0.8s",
                    animationTimingFunction: "step-end",
                    animationIterationCount: "infinite",
                    opacity: isDone ? 0 : 1,
                    transition: "opacity 0.5s ease",
                }}
            />
        </span>
    )
}

export default function DashboardPage() {
    const router = useRouter()
    const [data, setData] = useState<{ project: Project | null; updates: ProjectUpdate[]; user?: { name: string, email: string } } | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/dashboard/project')
            .then((res) => {
                if (!res.ok) throw new Error('Unauthorized')
                return res.json()
            })
            .then(setData)
            .catch(() => router.push('/login'))
            .finally(() => setLoading(false))
    }, [router])

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' })
        router.push('/login')
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    const { project, updates, user } = data || {}

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Image
                        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo-Nordex-Tech-remove-WSehNqsem3EZQ2jxpk0CKTKMU1hLtG.png"
                        alt="Nordex"
                        width={120}
                        height={40}
                        className="h-8 w-auto"
                    />
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors"
                    >
                        <LogOut size={16} />
                        Sair
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-12">

                {/* Dashboard Hero Section */}
                <div className="relative mb-16 rounded-3xl overflow-hidden bg-card border border-border/50 min-h-[300px] flex items-center">
                    {/* Background Visual */}
                    <div className="absolute right-0 top-0 bottom-0 w-full lg:w-2/3 hidden md:block">
                        <Image
                            src="/dashboard-bg.png"
                            alt="Visual Identity"
                            fill
                            className="object-cover opacity-60 mix-blend-luminosity"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-card via-card/80 to-transparent" />
                    </div>

                    {/* Content */}
                    <div className="relative z-10 px-8 py-10 md:px-12 w-full">
                        {data?.user?.name && (
                            <div className="mb-4 animate-on-scroll is-visible anim-fade-up" style={{ animationDelay: "100ms" }}>
                                <h2 className="text-2xl md:text-3xl font-heading font-medium text-muted-foreground">
                                    Olá, <AnimatedName name={data.user.name} />
                                </h2>
                            </div>
                        )}

                        {!project ? (
                            <div className="animate-on-scroll is-visible anim-fade-up" style={{ animationDelay: "200ms" }}>
                                <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-4">
                                    Bem-vindo à Nordex!
                                </h1>
                                <p className="text-muted-foreground text-lg max-w-xl">
                                    Seu projeto está sendo configurado por nossa equipe técnica. Em breve você poderá acompanhar cada etapa aqui.
                                </p>
                            </div>
                        ) : (
                            <div className="animate-on-scroll is-visible anim-fade-up" style={{ animationDelay: "200ms" }}>
                                <h1 className="text-4xl md:text-5xl font-heading font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 mb-4 leading-tight">
                                    {project.name ?? "Novo Projeto"}
                                </h1>
                                {project.description && (
                                    <p className="text-muted-foreground text-lg max-w-xl leading-relaxed">
                                        {project.description}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {!project ? (
                    <div className="text-center py-20 bg-card/30 rounded-xl border border-border border-dashed">
                        <p className="text-muted-foreground italic">Nenhuma atualização disponível no momento.</p>
                    </div>
                ) : (
                    <div className="space-y-12 animate-on-scroll is-visible anim-fade-up">
                        {/* Tracking Visual */}
                        <div className="bg-card rounded-xl border border-border p-8 shadow-lg relative overflow-hidden card-hover">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -z-10" />
                            <h3 className="text-lg font-semibold mb-8">Status do Projeto</h3>
                            <ProjectTracker currentStageId={project.current_stage} />
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {/* Updates Feed */}
                            <div className="md:col-span-2 space-y-6">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                    Atualizações Recentes
                                </h3>

                                {updates?.length === 0 ? (
                                    <p className="text-muted-foreground text-sm">Nenhuma atualização ainda.</p>
                                ) : (
                                    <div className="relative border-l-2 border-border ml-3 space-y-8 pb-4">
                                        {updates?.map((upd) => (
                                            <div key={upd.id} className="relative pl-6 group">
                                                {/* Timeline Dot */}
                                                <div className="absolute -left-[5px] top-1.5 w-[8px] h-[8px] rounded-full bg-border group-hover:bg-primary transition-colors duration-300 ring-4 ring-background" />

                                                <div className="flex items-center justify-between mb-1">
                                                    <h4 className="font-semibold">{upd.title}</h4>
                                                    <span className="text-xs text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full">
                                                        {format(new Date(upd.created_at), "dd 'de' MMM, HH:mm", { locale: ptBR })}
                                                    </span>
                                                </div>
                                                {upd.message && (
                                                    <div className="mt-2 text-sm text-muted-foreground bg-card/50 p-4 rounded-md border border-border/50">
                                                        {upd.message}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Preview Sidebar */}
                            {project.preview_url && (
                                <div className="md:col-span-1">
                                    <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 sticky top-24">
                                        <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
                                            <ExternalLink size={18} />
                                            Ambiente de Teste
                                        </h3>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            Veja o projeto ganhando vida em tempo real.
                                        </p>
                                        <a
                                            href={project.preview_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full inline-flex items-center justify-center bg-primary text-primary-foreground font-semibold py-2.5 rounded-md hover:bg-primary/90 transition-colors shadow-[0_0_20px_rgba(245,168,0,0.2)]"
                                        >
                                            Acessar Preview
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
