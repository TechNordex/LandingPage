/**
 * Client Portal (Dashboard) - V3.1
 * Dynamic Per-Update Notes, Mandatory Rejection Feedback, Friendly Terminology
 */
'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
    LogOut, ExternalLink, Loader2, Link as LinkIcon,
    FileText, Activity, Info, MessageSquareText,
    Save, Check, X, ThumbsUp, ThumbsDown, Clock, AlertCircle
} from 'lucide-react'
import { ProjectTracker } from '@/components/project-tracker'
import type { Project, ProjectUpdate } from '@/lib/types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import confetti from 'canvas-confetti'

export default function DashboardPage() {
    const router = useRouter()
    const [data, setData] = useState<{
        projects: Project[]
        allUpdates: ProjectUpdate[]
        user?: { name: string; email: string }
    } | null>(null)
    const [loading, setLoading] = useState(true)
    const [activeProjectId, setActiveProjectId] = useState<string | null>(null)

    // Per-update note editing
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
    const [tempNoteValue, setTempNoteValue] = useState('')
    const [savingNoteId, setSavingNoteId] = useState<string | null>(null)

    // Preview approval state
    const [approvingStatus, setApprovingStatus] = useState<'approved' | 'rejected' | null>(null)
    const [showRejectionForm, setShowRejectionForm] = useState(false)
    const [rejectionFeedback, setRejectionFeedback] = useState('')

    // Welcome popup
    const [showWelcome, setShowWelcome] = useState(false)
    const [agreedToTerms, setAgreedToTerms] = useState(false)

    useEffect(() => {
        fetch('/api/dashboard/project')
            .then((res) => {
                if (!res.ok) throw new Error('Unauthorized')
                return res.json()
            })
            .then((jsonData) => {
                setData(jsonData)
                if (jsonData.projects && jsonData.projects.length > 0) {
                    setActiveProjectId(jsonData.projects[0].id)
                }
                // Server-side check — termsAccepted is per-user, not per-browser
                if (!jsonData.termsAccepted) {
                    setShowWelcome(true)
                    triggerConfetti()
                }
            })
            .catch(() => router.push('/login'))
            .finally(() => setLoading(false))
    }, [router])

    const triggerConfetti = () => {
        const end = Date.now() + 3000
        const frame = () => {
            confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#f5a800', '#ffffff', '#1a1a1a'] })
            confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#f5a800', '#ffffff', '#1a1a1a'] })
            if (Date.now() < end) requestAnimationFrame(frame)
        }
        frame()
    }

    const closeWelcome = async () => {
        setShowWelcome(false)
        // Persist acceptance server-side (per-user, not per-browser)
        try {
            await fetch('/api/dashboard/accept-terms', { method: 'POST' })
        } catch {
            // Non-critical — popup is hidden client-side already
        }
    }

    const startEditingNote = (updateId: string, currentNote: string | null) => {
        setEditingNoteId(updateId)
        setTempNoteValue(currentNote || '')
    }

    const cancelEditingNote = () => {
        setEditingNoteId(null)
        setTempNoteValue('')
    }

    const saveNote = async (updateId: string) => {
        if (!data) return
        setSavingNoteId(updateId)
        const previousUpdates = [...data.allUpdates]
        setData({
            ...data,
            allUpdates: data.allUpdates.map(u => u.id === updateId ? { ...u, client_note: tempNoteValue } : u)
        })
        setEditingNoteId(null)
        try {
            const res = await fetch('/api/dashboard/project-notes', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ update_id: updateId, note: tempNoteValue }),
            })
            if (!res.ok) throw new Error('Failed')
        } catch {
            setData({ ...data, allUpdates: previousUpdates })
        } finally {
            setSavingNoteId(null)
        }
    }

    const submitPreviewDecision = async (decision: 'approved' | 'rejected') => {
        if (!data || !activeProjectId) return
        const activeProject = data.projects.find(p => p.id === activeProjectId)
        if (!activeProject) return
        
        if (decision === 'rejected' && !showRejectionForm) {
            setShowRejectionForm(true)
            return
        }

        if (decision === 'rejected' && rejectionFeedback.trim().length < 5) {
            return
        }

        setApprovingStatus(decision)
        // Optimistic update locally
        const previousProjects = [...data.projects]
        setData({ 
            ...data, 
            projects: data.projects.map(p => 
                p.id === activeProjectId 
                    ? { ...p, preview_status: decision, preview_feedback: decision === 'rejected' ? rejectionFeedback : null }
                    : p
            )
        })
        setShowRejectionForm(false)

        try {
            const res = await fetch('/api/dashboard/preview-status', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    status: decision,
                    feedback: decision === 'rejected' ? rejectionFeedback : undefined
                }),
            })
            if (!res.ok) throw new Error('Failed')
        } catch {
            // Rollback
            setData({ ...data, projects: previousProjects })
        } finally {
            setApprovingStatus(null)
        }
    }

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' })
        router.push('/login')
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        )
    }

    const { projects, allUpdates, user } = data || {}
    const project = projects?.find(p => p.id === activeProjectId) || null
    const updates = allUpdates?.filter(u => u.project_id === activeProjectId) || []

    // Derived preview state
    const status = project?.preview_status ?? 'none'
    const hasPendingReview = (status === 'pending' || (status === 'none' && project?.preview_url)) && Boolean(project?.preview_url)

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
                <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Image
                            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo-Nordex-Tech-remove-WSehNqsem3EZQ2jxpk0CKTKMU1hLtG.png"
                            alt="Nordex Tech"
                            width={160}
                            height={44}
                            className="h-8 sm:h-10 w-auto opacity-100"
                            priority
                        />
                        <div className="h-6 w-px bg-border hidden sm:block mx-1" />
                        <span className="hidden sm:inline-block text-[13px] font-medium text-muted-foreground tracking-wide uppercase">
                            Portal do Cliente
                        </span>
                    </div>
                    <div className="flex items-center gap-6">
                        {user && (
                            <div className="hidden sm:flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center text-[13px] font-medium text-primary">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[13px] font-medium leading-none text-foreground">{user.name}</span>
                                    <span className="text-[11px] text-muted-foreground mt-1">{user.email}</span>
                                </div>
                            </div>
                        )}
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <LogOut size={16} />
                            <span className="hidden sm:inline">Sair</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-[1200px] mx-auto px-6 py-10">
                {!project ? (
                    <div className="max-w-2xl mx-auto mt-20 p-10 rounded-2xl bg-card border border-border text-center">
                        <div className="w-16 h-16 rounded-full bg-secondary border border-border flex items-center justify-center mx-auto mb-6 text-primary">
                            <Activity size={28} />
                        </div>
                        <h1 className="text-2xl font-semibold mb-3">Bem-vindo à Nordex!</h1>
                        <p className="text-[15px] text-muted-foreground leading-relaxed">
                            Seu projeto está sendo preparado. Em breve você poderá acompanhar cada etapa do desenvolvimento aqui neste painel.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Project Switcher UI (if more than 1 project) */}
                        {projects && projects.length > 1 && (
                            <div className="flex flex-wrap gap-3 mb-8 animate-fade-in">
                                {projects.map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => setActiveProjectId(p.id)}
                                        className={`px-5 py-2.5 rounded-xl text-[13.5px] font-medium transition-all duration-300 flex items-center gap-2 border ${
                                            activeProjectId === p.id 
                                            ? 'bg-primary/10 border-primary/30 text-primary shadow-[0_0_15px_rgba(245,168,0,0.15)]' 
                                            : 'bg-card border-border hover:border-border/80 text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        <div className={`w-2 h-2 rounded-full transition-colors ${activeProjectId === p.id ? 'bg-primary animate-pulse-slow shadow-[0_0_8px_rgba(245,168,0,0.8)]' : 'bg-muted-foreground/30'}`} />
                                        {p.name}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Top Header Block */}
                        <div className="mb-8 animate-fade-in">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                <div>
                                    <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-2">
                                        {project.name}
                                    </h1>
                                    {project.description && (
                                        <p className="text-[15px] text-muted-foreground max-w-2xl">
                                            {project.description}
                                        </p>
                                    )}
                                </div>

                                {/* Smart Preview Button Block */}
                                <div className="flex flex-col items-end gap-3 shrink-0">
                                {hasPendingReview ? (
                                    /* Status: PENDING — show the CTA + approve/reject buttons */
                                    <div className="flex flex-col gap-3 w-full sm:w-auto">
                                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                            <a
                                                href={project.preview_url!}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="group inline-flex items-center justify-center gap-2 h-11 px-6 rounded-lg bg-primary text-primary-foreground font-semibold text-[14px] hover:opacity-90 transition-all shadow-[0_0_24px_rgba(245,168,0,0.25)] animate-pulse-slow shrink-0"
                                            >
                                                <span>Avaliar Nova Entrega</span>
                                                <ExternalLink size={16} />
                                            </a>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => submitPreviewDecision('approved')}
                                                    disabled={approvingStatus !== null || showRejectionForm}
                                                    className="h-11 px-4 flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 text-green-400 text-[13px] font-semibold hover:bg-green-500/20 transition-colors disabled:opacity-50"
                                                >
                                                    {approvingStatus === 'approved' ? <Loader2 size={14} className="animate-spin" /> : <ThumbsUp size={14} />}
                                                    Aprovar
                                                </button>
                                                <button
                                                    onClick={() => submitPreviewDecision('rejected')}
                                                    disabled={approvingStatus !== null}
                                                    className={`h-11 px-4 flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-lg border transition-all text-[13px] font-semibold disabled:opacity-50 ${showRejectionForm ? 'border-red-500 bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20'}`}
                                                >
                                                    {approvingStatus === 'rejected' ? <Loader2 size={14} className="animate-spin" /> : <ThumbsDown size={14} />}
                                                    {showRejectionForm ? 'Confirmar Ajustes' : 'Solicitar Ajustes'}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Mandatory Rejection Feedback Field */}
                                        {showRejectionForm && (
                                            <div className="bg-card border border-red-500/30 rounded-xl p-4 shadow-xl animate-in slide-in-from-top-2 duration-300">
                                                <div className="flex items-center gap-2 text-red-400 font-bold text-[11px] uppercase tracking-wider mb-2">
                                                    <AlertCircle size={14} /> Descrição Obrigatória dos Ajustes
                                                </div>
                                                <textarea
                                                    autoFocus
                                                    value={rejectionFeedback}
                                                    onChange={e => setRejectionFeedback(e.target.value)}
                                                    placeholder="Descreva detalhadamente o que precisa ser alterado para que possamos ajustar imediatamente..."
                                                    className="w-full h-24 bg-background border border-border rounded-lg text-[13px] text-foreground focus:border-red-500/50 outline-none resize-none p-3 placeholder:text-muted-foreground/40"
                                                />
                                                <div className="flex justify-between items-center mt-2">
                                                    <p className="text-[11px] text-muted-foreground">
                                                        {rejectionFeedback.trim().length < 5 ? (
                                                            <span className="text-red-400/80">Mínimo 5 caracteres para enviar.</span>
                                                        ) : (
                                                            <span className="text-green-400/80">Pronto para enviar.</span>
                                                        )}
                                                    </p>
                                                    <button 
                                                        onClick={() => { setShowRejectionForm(false); setRejectionFeedback(''); }}
                                                        className="text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                                                    >
                                                        Cancelar
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : status === 'approved' ? (
                                    /* Status: APPROVED */
                                    <div className="inline-flex items-center gap-2 h-11 px-5 rounded-lg border border-green-500/30 bg-green-500/10 text-green-400 text-[13px] font-semibold shrink-0">
                                        <Check size={15} />
                                        Entrega Aprovada
                                    </div>
                                ) : status === 'rejected' ? (
                                    /* Status: REJECTED — waiting for admin to fix */
                                    <div className="flex flex-col items-end gap-2">
                                        <div className="inline-flex items-center gap-2 h-11 px-5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-400 text-[13px] font-semibold shrink-0">
                                            <Clock size={15} />
                                            Ajustes Solicitados — aguardando retorno
                                        </div>
                                        {project.preview_feedback && (
                                            <div className="max-w-[300px] bg-secondary/30 border border-border rounded-lg p-3 text-[12px] text-muted-foreground italic">
                                                "{project.preview_feedback}"
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    /* Status: NONE — no link available yet */
                                    <div className="inline-flex items-center gap-2 h-11 px-5 rounded-lg bg-secondary/50 border border-border text-muted-foreground text-[14px] font-medium cursor-not-allowed shrink-0">
                                        <LinkIcon size={16} />
                                        Nenhuma versão de teste disponível
                                    </div>
                                )}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in items-start" style={{ animationDelay: '100ms' }}>

                            {/* Pipeline Card */}
                            <div className="lg:col-span-1 rounded-2xl bg-card border border-border p-6 flex flex-col relative">
                                <div className="flex items-center gap-3 mb-6 relative z-10">
                                    <div className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center text-muted-foreground">
                                        <Activity size={16} />
                                    </div>
                                    <div>
                                        <h2 className="text-[14px] font-semibold text-foreground leading-none">Progresso do Projeto</h2>
                                        <p className="text-[11px] text-muted-foreground mt-1">Etapas de desenvolvimento</p>
                                    </div>
                                </div>
                                <div className="relative z-10">
                                    <ProjectTracker currentStageId={project.current_stage} />
                                </div>
                            </div>

                            {/* Updates & Notes Feed Card */}
                            <div className="lg:col-span-2 rounded-2xl bg-card border border-border p-8 flex flex-col h-[700px]">
                                <div className="flex items-center justify-between mb-8 pb-4 border-b border-border shrink-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                                            <FileText size={16} />
                                        </div>
                                        <div>
                                            <h2 className="text-[16px] font-semibold text-foreground">Histórico e Atualizações</h2>
                                            <p className="text-[12px] text-muted-foreground mt-0.5">Acompanhe o que foi feito e deixe suas observações.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
                                    {updates?.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-center">
                                            <div className="w-16 h-16 rounded-full bg-secondary/50 border border-border flex items-center justify-center mb-4 text-muted-foreground">
                                                <Info size={24} />
                                            </div>
                                            <p className="text-[14px] font-medium text-foreground">Nenhuma atualização ainda.</p>
                                            <p className="text-[13px] text-muted-foreground mt-1 max-w-[280px]">Conforme o projeto avança, as novidades serão registradas aqui.</p>
                                        </div>
                                    ) : (
                                        <div className="relative border-l-2 border-border/50 ml-4 space-y-10 pb-6">
                                            {updates?.map((upd) => {
                                                const isEditing = editingNoteId === upd.id
                                                const hasNote = Boolean(upd.client_note)

                                                return (
                                                    <div key={upd.id} className="relative pl-8 animate-fade-in group">
                                                        {/* Timeline Dot */}
                                                        <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-card border-[3px] border-primary shadow-[0_0_10px_rgba(245,168,0,0.4)]" />

                                                        {/* Update Content */}
                                                        <div className="bg-secondary/20 border border-border rounded-xl p-5 mb-4">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="text-[11px] font-bold text-primary tracking-widest uppercase bg-primary/10 px-2 py-0.5 rounded-sm">
                                                                    Etapa {upd.stage}
                                                                </span>
                                                                <span className="text-[12px] font-medium text-muted-foreground">
                                                                    {format(new Date(upd.created_at), "dd 'de' MMM, HH:mm", { locale: ptBR })}
                                                                </span>
                                                            </div>
                                                            <h4 className="text-[16px] font-semibold text-foreground mb-2">
                                                                {upd.title}
                                                            </h4>
                                                            {upd.message && (
                                                                <div className="text-[14px] text-muted-foreground/90 leading-relaxed bg-background/50 p-3 rounded-lg border border-border/30">
                                                                    {upd.message}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Note Interaction Block */}
                                                        <div className="pl-4 border-l-2 border-border/30 hover:border-primary/30 transition-colors ml-4 relative">
                                                            <div className="absolute -left-[18px] top-4 w-4 h-px bg-border/40" />

                                                            {isEditing ? (
                                                                <div className="bg-background rounded-xl border border-primary/50 p-4 shadow-lg">
                                                                    <div className="flex items-center gap-2 text-primary font-medium text-[12px] mb-2 uppercase tracking-wide">
                                                                        <MessageSquareText size={14} /> Sua Observação
                                                                    </div>
                                                                    <textarea
                                                                        autoFocus
                                                                        value={tempNoteValue}
                                                                        onChange={e => setTempNoteValue(e.target.value)}
                                                                        placeholder="Descreva dúvidas, feedback, links de referência ou qualquer observação importante..."
                                                                        className="w-full h-24 bg-transparent border-0 text-[14px] text-foreground focus:ring-0 resize-none placeholder:text-muted-foreground/40 p-0"
                                                                    />
                                                                    <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-border/50">
                                                                        <button onClick={cancelEditingNote} className="px-3 py-1.5 rounded-md hover:bg-secondary text-muted-foreground transition-colors text-[12px] font-medium inline-flex items-center gap-1.5">
                                                                            <X size={14} /> Cancelar
                                                                        </button>
                                                                        <button
                                                                            onClick={() => saveNote(upd.id)}
                                                                            disabled={savingNoteId === upd.id}
                                                                            className="px-4 py-1.5 bg-primary text-primary-foreground rounded-md text-[12px] font-semibold hover:bg-primary/90 transition-colors inline-flex items-center gap-2 disabled:opacity-50"
                                                                        >
                                                                            {savingNoteId === upd.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Save size={14} /> Salvar</>}
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ) : hasNote ? (
                                                                <div className="bg-card border border-border hover:border-border/80 rounded-xl p-4 group/note relative transition-colors">
                                                                    <div className="flex justify-between items-start mb-2">
                                                                        <div className="flex items-center gap-2 text-primary font-medium text-[12px] uppercase tracking-wide">
                                                                            <Check size={14} className="text-green-500" /> Sua observação
                                                                        </div>
                                                                        <button
                                                                            onClick={() => startEditingNote(upd.id, upd.client_note || null)}
                                                                            className="text-[11px] font-medium text-muted-foreground opacity-0 group-hover/note:opacity-100 hover:text-foreground hover:underline transition-all"
                                                                        >
                                                                            Editar / Apagar
                                                                        </button>
                                                                    </div>
                                                                    <p className="text-[13px] text-foreground/80 leading-relaxed whitespace-pre-wrap">
                                                                        {upd.client_note}
                                                                    </p>
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    onClick={() => startEditingNote(upd.id, null)}
                                                                    className="inline-flex items-center justify-center gap-2 w-full sm:w-auto h-9 px-4 rounded-lg border border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors text-[13px] font-medium"
                                                                >
                                                                    <MessageSquareText size={15} /> Deixar uma observação
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </main>

            {/* Welcome Popup */}
            {showWelcome && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-card border border-border rounded-2xl p-8 max-w-lg w-full shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                            <Image
                                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo-Nordex-Tech-remove-WSehNqsem3EZQ2jxpk0CKTKMU1hLtG.png"
                                alt="Nordex"
                                width={80}
                                height={24}
                                className="h-5 w-auto"
                            />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground mb-3 tracking-tight">
                            Bem-vindo ao Nordex Client Portal.
                        </h2>
                        <div className="text-[14.5px] text-muted-foreground leading-relaxed mb-6 space-y-4">
                            <p>
                                Olá, <b>{user?.name.split(' ')[0]}</b>! Este é o seu espaço reservado e seguro para acompanhar o <b>{project?.name}</b>.
                            </p>
                            
                            <div className="p-4 bg-secondary/50 rounded-xl border border-border/50 text-[13px]">
                                <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
                                    <AlertCircle size={15} className="text-primary"/> Termo de Confidencialidade e Sigilo
                                </h3>
                                <p className="leading-relaxed opacity-90">
                                    Ao prosseguir, você concorda expressamente em manter escopo de sigilo sobre metodologias, interfaces, e lógicas apresentadas neste ambiente. A reprodução, engenharia reversa, ou o compartilhamento indevido destes dados estão sujeitos às penalidades previstas na lei de proteção intelectual.
                                </p>
                            </div>
                        </div>

                        <label className="flex items-start gap-3 mb-6 cursor-pointer group">
                            <div className="relative flex items-center justify-center mt-0.5 shrink-0">
                                <input 
                                    type="checkbox" 
                                    checked={agreedToTerms}
                                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                                    className="peer appearance-none w-5 h-5 border-2 border-border rounded-md checked:bg-primary checked:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer bg-background"
                                />
                                <Check size={12} className="absolute text-primary-foreground opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" strokeWidth={4}/>
                            </div>
                            <span className="text-[13px] font-medium text-foreground/80 group-hover:text-foreground transition-colors leading-snug select-none">
                                Eu declaro que li, entendi e concordo integralmente com o Termo de Confidencialidade da plataforma.
                            </span>
                        </label>

                        <button
                            onClick={closeWelcome}
                            disabled={!agreedToTerms}
                            className="w-full h-12 bg-foreground text-background font-semibold text-[14px] rounded-xl transition-all shadow-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-foreground/90 disabled:hover:bg-foreground"
                        >
                            Assinar e Entrar no Painel
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
