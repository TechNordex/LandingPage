/**
 * Client Portal (Dashboard) - V3.1
 * Dynamic Per-Update Notes, Mandatory Rejection Feedback, Friendly Terminology
 */
'use client'

import React, { useEffect, useState, useMemo } from 'react'
import useSWR, { mutate } from 'swr'
import { useRealtime } from '@/hooks/use-realtime'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
    LogOut, ExternalLink, Loader2, Link as LinkIcon,
    FileText, Activity, Info, MessageSquareText,
    Save, Check, X, ThumbsUp, ThumbsDown, Clock, AlertCircle, Users, Menu,
    CheckCircle2, RefreshCw, Timer, MessageCircle
} from 'lucide-react'
import { ProjectTracker } from '@/components/project-tracker'
import type { Project, ProjectUpdate } from '@/lib/types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import NordyAssistant from '@/components/nordy-assistant'
import ChatTeam from '@/components/chat-team'
import confetti from 'canvas-confetti'

function useTypewriter(target: string, { speed = 70, startDelay = 300 } = {}) {
    const [text, setText] = useState("")
    const [isDone, setIsDone] = useState(false)

    useEffect(() => {
        setText("")
        setIsDone(false)
        if (!target) return;

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

const formatHours = (hours: number | undefined) => {
    if (!hours || isNaN(hours) || hours === 0) return null;
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h`;
    return `${m}m`;
}

function TypewriterTitle({ text, description }: { text: string; description?: string | null }) {
    const { text: typed, isDone } = useTypewriter(text, { speed: 80, startDelay: 300 })
    return (
        <div className="mb-8 flex flex-col items-center justify-center text-center animate-fade-in w-full">
            <h1 id="tour-welcome" className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3" style={{ fontFamily: "var(--font-space-grotesk)" }}>
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
            </h1>
            {description && (
                <p className="text-[15px] sm:text-[16px] text-muted-foreground max-w-2xl text-balance">
                    {description}
                </p>
            )}
        </div>
    )
}

export default function DashboardPage() {
    const router = useRouter()
    const fetcher = (url: string) => fetch(url).then((res) => {
        if (!res.ok) throw new Error('Unauthorized')
        return res.json()
    })

    const { data: convData } = useSWR('/api/chat/conversations', fetcher)
    const totalUnread = useMemo(() => {
        if (!convData?.conversations) return 0
        return convData.conversations.reduce((acc: number, c: any) => acc + (c.unread_count || 0), 0)
    }, [convData])

    const { data: jsonData, error, isLoading } = useSWR('/api/dashboard/project', fetcher, {
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
    })

    const data = jsonData || null
    const loading = isLoading && !data

    const [activeProjectId, setActiveProjectId] = useState<string | null>(null)
    const [sidebarOpen, setSidebarOpen] = useState(false)

    // Per-update note editing
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
    const [tempNoteValue, setTempNoteValue] = useState('')
    const [savingNoteId, setSavingNoteId] = useState<string | null>(null)

    // Welcome popup
    const [showWelcome, setShowWelcome] = useState(false)
    const [agreedToTerms, setAgreedToTerms] = useState(false)

    // Per-update authorization
    const [approvingUpdateId, setApprovingUpdateId] = useState<string | null>(null)
    const [showUpdateRejectionFormId, setShowUpdateRejectionFormId] = useState<string | null>(null)
    const [updateRejectionFeedback, setUpdateRejectionFeedback] = useState('')

    // Squad Hover state (Dynamic rect positioning to escape overflow)
    const [hoverSquadRect, setHoverSquadRect] = useState<{ top: number, left: number, member: any } | null>(null)
    const [showChatPopup, setShowChatPopup] = useState(false)
    const [chatConvId, setChatConvId] = useState<string | null>(null)
    const [initiatingChatId, setInitiatingChatId] = useState<string | null>(null)

    // Real-time listener
    useRealtime()

    useEffect(() => {
        if (jsonData) {
            if (jsonData.projects && jsonData.projects.length > 0 && !activeProjectId) {
                setActiveProjectId(jsonData.projects[0].id)
            }
            // Server-side check — termsAccepted is per-user, not per-browser
            if (!jsonData.termsAccepted) {
                setShowWelcome(true)
                triggerConfetti()
            }
        }
    }, [jsonData, activeProjectId])

    const handleStartChat = async (member: any) => {
        if (!activeProjectId) return
        try {
            setInitiatingChatId(member.id)
            setHoverSquadRect(null)
            const res = await fetch('/api/chat/init', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetUserId: member.id, projectId: activeProjectId })
            })
            const data = await res.json()
            if (data.conversationId) {
                setChatConvId(data.conversationId)
                setShowChatPopup(true)
                // Close sidebar on mobile
                setSidebarOpen(false)
            }
        } catch (error) {
            console.error('Error starting chat:', error)
        } finally {
            setInitiatingChatId(null)
        }
    }

    useEffect(() => {
        if (error) router.push('/login')
    }, [error, router])

    useEffect(() => {
        const handleTourStep = (e: any) => {
            const { targetId } = e.detail;
            if (targetId === 'tour-env-links' || targetId === 'tour-squad') {
                setSidebarOpen(true);
            } else {
                setSidebarOpen(false);
            }
        };
        window.addEventListener('tour-step-changed', handleTourStep);
        return () => window.removeEventListener('tour-step-changed', handleTourStep);
    }, []);

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
            // Non-critical ‚¬€  popup is hidden client-side already
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
        mutate('/api/dashboard/project', {
            ...data,
            allUpdates: data.allUpdates.map((u: ProjectUpdate) => u.id === updateId ? { ...u, client_note: tempNoteValue } : u)
        }, false)

        try {
            const res = await fetch('/api/dashboard/project-notes', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ update_id: updateId, note: tempNoteValue })
            })
            if (!res.ok) throw new Error()
            setEditingNoteId(null)
        } catch {
            mutate('/api/dashboard/project')
            alert('Erro ao salvar nota')
        } finally {
            setSavingNoteId(null)
        }
    }

    const handleUpdateStatus = async (updateId: string, status: 'authorized' | 'denied', feedback?: string) => {
        if (!data) return
        setApprovingUpdateId(updateId)
        const previousUpdates = [...data.allUpdates]

        // Optimistic update
        mutate('/api/dashboard/project', {
            ...data,
            allUpdates: data.allUpdates.map((u: ProjectUpdate) => u.id === updateId ? { ...u, status, feedback: feedback || null } : u)
        }, false)

        try {
            const res = await fetch('/api/dashboard/update-status', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ update_id: updateId, status, feedback })
            })
            if (!res.ok) throw new Error()
            setShowUpdateRejectionFormId(null)
            setUpdateRejectionFeedback('')
        } catch {
            mutate('/api/dashboard/project')
            alert('Erro ao processar sua decisão')
        } finally {
            setApprovingUpdateId(null)
        }
    }

    const markAsViewed = async (updateId: string) => {
        try {
            await fetch('/api/dashboard/update-viewed', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ update_id: updateId })
            })
        } catch {
            // Silently fail for audit trail
        }
    }

    const markAllAsViewed = async () => {
        const unviewedIds = (updates as any[]).filter((u: any) => u.preview_url && !u.viewed_at).map((u: any) => u.id)
        if (unviewedIds.length === 0) return

        // Optimistic local update
        mutate('/api/dashboard/project', {
            ...data,
            allUpdates: data.allUpdates.map((u: ProjectUpdate) =>
                unviewedIds.includes(u.id) ? { ...u, viewed_at: new Date().toISOString() } : u
            )
        }, false)

        try {
            await Promise.all(unviewedIds.map((id: any) =>
                fetch('/api/dashboard/update-viewed', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ update_id: id })
                })
            ))
        } catch {
            // Silently fail or rollback if needed, but viewed_at is an audit trail
        }
    }

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' })
        router.push('/login')
    }

    const { projects, allUpdates, user } = data || {}
    const project = projects?.find((p: any) => p.id === activeProjectId) || null
    const updates = allUpdates?.filter((u: any) =>
        String(u.project_id).trim().toLowerCase() === String(activeProjectId).trim().toLowerCase()
    ) || []

    const hasUnviewedUpdates = updates.some((u: any) => u.preview_url && !u.viewed_at)

    // --- Mini-Dashboard Metrics ---
    const totalUpdates = updates.length;

    // Days Active
    const daysActive = useMemo(() => {
        if (!project || !project.created_at) return 0;
        const start = new Date(typeof project.created_at === 'number' ? project.created_at : project.created_at || '').getTime();
        const now = new Date().getTime();
        const diffDays = Math.ceil((now - start) / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 1;
    }, [project]);

    // Last Update Date
    const lastUpdateDate = useMemo(() => {
        if (updates.length === 0) return 'Nenhuma';
        const sorted = [...updates].sort((a, b) => {
            const dateA = new Date(typeof a.created_at === 'number' ? a.created_at : a.created_at || '').getTime();
            const dateB = new Date(typeof b.created_at === 'number' ? b.created_at : b.created_at || '').getTime();
            return dateB - dateA;
        });

        const latestDate = new Date(typeof sorted[0].created_at === 'number' ? sorted[0].created_at : sorted[0].created_at || '');
        return format(Number.isNaN(latestDate.getTime()) ? new Date() : latestDate, "dd 'de' MMM", { locale: ptBR });
    }, [updates]);

    // Stage Progress estimate (simple visual metric)
    const stageProgress = useMemo(() => {
        if (!project || typeof project.current_stage !== 'number') return 0;
        const totalStages = 6;
        return Math.round((Math.min(project.current_stage, totalStages) / totalStages) * 100);
    }, [project]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex selection:bg-primary/30">

            {/* ---------- SIDEBAR ---------- */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}
            <aside className={`fixed lg:static top-0 left-0 h-full lg:h-auto z-40 w-64 flex-shrink-0 bg-card border-r border-border flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                }`}>
                {/* Logo */}
                <div className="px-6 py-5 border-b border-border flex items-center gap-3">
                    <Image
                        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo-Nordex-Tech-remove-WSehNqsem3EZQ2jxpk0CKTKMU1hLtG.png"
                        alt="Nordex" width={130} height={36} className="h-10 w-auto opacity-100" priority
                    />
                    <span className="bg-primary/10 text-primary text-[10px] sm:text-[11px] font-black px-2 py-1 border border-primary/20 uppercase tracking-widest rounded-md whitespace-nowrap">Portal do Cliente</span>
                </div>

                {/* Project Nav */}
                <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/50 px-3 mb-3">Meus Projetos</p>
                    {projects && projects.length > 0 ? projects.map((p: any) => (
                        <button
                            key={p.id}
                            onClick={() => { setActiveProjectId(p.id); setSidebarOpen(false) }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 text-left ${activeProjectId === p.id
                                ? 'bg-primary text-primary-foreground shadow-[0_0_15px_rgba(245,168,0,0.25)]'
                                : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                                }`}
                        >
                            <div className={`w-2 h-2 rounded-full shrink-0 ${activeProjectId === p.id ? 'bg-primary-foreground animate-pulse' : 'bg-muted-foreground/30'}`} />
                            <span className="truncate">{p.name}</span>
                            {p.preview_status === 'pending' && (
                                <span className="ml-auto w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" title="Aguardando aprovação" />
                            )}
                            {p.preview_status === 'rejected' && (
                                <span className="ml-auto w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" title="Ajuste solicitado" />
                            )}
                        </button>
                    )) : (
                        <p className="text-[12px] text-muted-foreground px-3 py-2">Nenhum projeto ativo.</p>
                    )}

                    {/* Project Specific Info (Contextual) */}
                    {project && (
                        <div className="mt-8 px-3 space-y-6">
                            {/* Environment Links */}
                            <div id="tour-env-links" className="space-y-2">
                                <a
                                    href={project.stage_url || '#'}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={`w-full py-2.5 px-3 rounded-lg text-[10px] sm:text-[11px] font-black uppercase tracking-widest flex items-center gap-2 transition-all duration-300 group ${project.stage_url
                                        ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20'
                                        : 'bg-secondary/40 text-muted-foreground cursor-not-allowed opacity-40 grayscale'
                                        }`}
                                    onClick={(e) => !project.stage_url && e.preventDefault()}
                                >
                                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${project.stage_url ? 'bg-amber-500 animate-pulse' : 'bg-muted-foreground'}`} />
                                    <span className="truncate">Ambiente Stage</span>
                                    {project.stage_url && <ExternalLink size={12} className="ml-auto" />}
                                </a>

                                <a
                                    href={project.prod_url || '#'}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={`w-full py-2.5 px-3 rounded-lg text-[10px] sm:text-[11px] font-black uppercase tracking-widest flex items-center gap-2 transition-all duration-300 group ${project.prod_url
                                        ? 'bg-primary/10 text-primary hover:bg-primary/20'
                                        : 'bg-secondary/40 text-muted-foreground cursor-not-allowed opacity-40 grayscale'
                                        }`}
                                    onClick={(e) => !project.prod_url && e.preventDefault()}
                                >
                                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${project.prod_url ? 'bg-primary animate-pulse' : 'bg-muted-foreground'}`} />
                                    <span className="truncate">Ambiente Prod</span>
                                    {project.prod_url && <ExternalLink size={12} className="ml-auto" />}
                                </a>
                            </div>

                            {/* Squad Info */}
                            {project.squad && project.squad.length > 0 && (
                                <div id="tour-squad" className="space-y-3 pb-4">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.1em] text-primary flex items-center gap-1.5 shrink-0">
                                            <Users size={12} className="shrink-0" /> Squad Especialista
                                        </span>
                                        <button 
                                            id="btn-mensagem-squad"
                                            onClick={async () => {
                                                if (initiatingChatId === 'squad-group') return
                                                setInitiatingChatId('squad-group')
                                                try {
                                                    const res = await fetch('/api/chat/init', {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({ isGroup: true, projectId: activeProjectId })
                                                    })
                                                    const data = await res.json()
                                                    if (data.conversationId) {
                                                        setChatConvId(data.conversationId)
                                                        setShowChatPopup(true)
                                                    }
                                                } catch (err) {} finally { setInitiatingChatId(null) }
                                            }}
                                            className="text-[9px] sm:text-[10px] font-bold text-primary hover:text-primary-foreground bg-primary/10 hover:bg-primary border border-primary/20 hover:border-primary px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 uppercase whitespace-nowrap shrink-0"
                                        >
                                            {initiatingChatId === 'squad-group' ? <Loader2 size={12} className="animate-spin" /> : <MessageSquareText size={12} />}
                                            MENSAGEM SQUAD
                                        </button>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                    {project.squad.map((member: any, i: number) => (
                                        <div 
                                            key={i}
                                            className="group/member relative"
                                            onMouseEnter={(e) => {
                                                const rect = e.currentTarget.getBoundingClientRect()
                                                setHoverSquadRect({
                                                    top: rect.top,
                                                    left: rect.right,
                                                    member
                                                })
                                            }}
                                            onMouseLeave={() => setHoverSquadRect(null)}
                                            onClick={() => handleStartChat(member)}
                                        >
                                                <div className="flex items-center gap-3 bg-secondary/20 border border-border/50 rounded-xl p-2 hover:bg-secondary/40 transition-all cursor-pointer group shadow-sm">
                                                    <div className="w-8 h-8 rounded-full bg-background border border-border overflow-hidden shrink-0 aspect-square relative z-10 text-xs">
                                                        {member.avatar_url ? (
                                                            <img src={member.avatar_url} alt={member.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-primary font-bold">{member.name.charAt(0)}</div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0 flex-1 relative z-10 flex items-center justify-between">
                                                        <div>
                                                            <p className="text-[12px] font-bold text-foreground leading-none truncate">{member.name.split(' ')[0]}</p>
                                                            <p className="text-[9px] text-muted-foreground mt-1 font-medium truncate uppercase tracking-tighter">{member.position || 'Especialista'}</p>
                                                        </div>
                                                        <div className="w-6 h-6 rounded-full bg-background/50 border border-border flex items-center justify-center shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            {initiatingChatId === member.id ? <Loader2 size={10} className="animate-spin text-primary" /> : <MessageCircle size={12} className="text-primary" />}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </nav>

                {/* User + Logout */}
                <div className="border-t border-border p-4 space-y-3">
                    {user && (
                        <div className="flex items-center gap-3 px-1">
                            <div className="w-9 h-9 rounded-full bg-secondary border border-border overflow-hidden shrink-0 aspect-square">
                                {(user as any).avatar_url ? (
                                    <img src={(user as any).avatar_url} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-primary font-bold text-[13px]">{user.name.charAt(0)}</div>
                                )}
                            </div>
                            <div className="min-w-0">
                                <p className="text-[13px] font-bold text-foreground truncate">{user.name}</p>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-tight">Cliente Nordex</p>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-semibold text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
                    >
                        <LogOut size={14} />
                        Sair da conta
                    </button>
                </div>
            </aside>

            {/* ---------- CONTENT ---------- */}
            <div className="flex-1 min-w-0 flex flex-col">
                {/* Mobile topbar */}
                <div className="lg:hidden flex items-center gap-4 px-5 py-3 border-b border-border bg-card sticky top-0 z-20">
                    <button onClick={() => setSidebarOpen(true)} className="text-muted-foreground hover:text-foreground">
                        <Menu size={22} />
                    </button>
                    <Image
                        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo-Nordex-Tech-remove-WSehNqsem3EZQ2jxpk0CKTKMU1hLtG.png"
                        alt="Nordex" width={100} height={28} className="h-6 w-auto opacity-100"
                    />
                </div>

                <div className="flex-1 overflow-y-auto p-6 lg:p-8">
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
                            {/* Top Header Block */}
                            <TypewriterTitle text={project.name} description={project.description} />

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in items-start" style={{ animationDelay: '100ms' }}>

                                {/* Left Column: Pipeline + Chart */}
                                <div className="lg:col-span-1 flex flex-col gap-6">
                                    {/* Pipeline Card */}
                                    <div id="tour-pipeline" className="rounded-2xl bg-card border border-border p-6 flex flex-col relative w-full">
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

                                    {/* Mini Dashboard Metrics container */}
                                    <div id="tour-metrics" className="rounded-2xl bg-card border border-border p-6 flex flex-col relative h-[280px] w-full">
                                        <div className="flex items-center gap-3 mb-5 relative z-10">
                                            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                                                <Activity size={16} />
                                            </div>
                                            <div>
                                                <h2 className="text-[14px] font-semibold text-foreground leading-none">Métricas do Projeto</h2>
                                                <p className="text-[11px] text-muted-foreground mt-1">Resumo operacional em tempo real</p>
                                            </div>
                                        </div>

                                        <div className="flex-1 grid grid-cols-2 gap-3 relative z-10">
                                            {/* Metric 1 */}
                                            <div className="bg-secondary/30 rounded-xl border border-border/50 p-4 flex flex-col justify-center">
                                                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Atualizações</p>
                                                <p className="text-2xl font-black text-foreground">{totalUpdates}</p>
                                            </div>

                                            {/* Metric 2 */}
                                            <div className="bg-secondary/30 rounded-xl border border-border/50 p-4 flex flex-col justify-center">
                                                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Dias Ativo</p>
                                                <p className="text-2xl font-black text-foreground">{daysActive}</p>
                                            </div>

                                            {/* Metric 3 */}
                                            <div className="bg-secondary/30 rounded-xl border border-border/50 p-4 flex flex-col justify-center">
                                                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Última Entrega</p>
                                                <p className="text-lg font-bold text-primary truncate leading-tight mt-1">{lastUpdateDate}</p>
                                            </div>

                                            {/* Metric 4 */}
                                            <div className="bg-secondary/30 rounded-xl border border-border/50 p-4 flex flex-col justify-center relative overflow-hidden">
                                                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1 relative z-10">Progresso Est.</p>
                                                <p className="text-2xl font-black text-foreground relative z-10">{stageProgress}%</p>
                                                <div className="absolute bottom-0 left-0 h-1 bg-primary/30 w-full" />
                                                <div className="absolute bottom-0 left-0 h-1 bg-primary transition-all duration-1000" style={{ width: `${stageProgress}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Header: Feed vs Chat Popup trigger */}
                                <div id="tour-updates" tabIndex={0} className="lg:col-span-2 rounded-2xl bg-card border border-border h-[770px] overflow-hidden focus:outline-none flex flex-col">
                                    <div className="sticky top-0 z-20 bg-card/95 backdrop-blur-md px-4 sm:px-8 py-4 sm:py-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between shrink-0 gap-4">
                                        <div className="flex items-center w-full">
                                            <h2 className="text-[16px] font-black tracking-tight flex items-center gap-2">
                                                <Activity className="text-primary" size={18} /> Histórico e Atualizações
                                            </h2>
                                        </div>
                                    </div>

                                    {/* Feed Content */}
                                    <div className="flex-1 overflow-y-auto custom-scrollbar px-5 sm:px-8 py-8 overscroll-contain">
                                        {updates?.length === 0 ? (
                                            <div className="h-[400px] flex flex-col items-center justify-center text-center">
                                                <div className="w-16 h-16 rounded-full bg-secondary/50 border border-border flex items-center justify-center mb-4 text-muted-foreground">
                                                    <Info size={24} />
                                                </div>
                                                <p className="text-[14px] font-medium text-foreground">Nenhuma atualização ainda.</p>
                                                <p className="text-[13px] text-muted-foreground mt-1 max-w-[280px]">Conforme o projeto avança, as novidades serão registradas aqui.</p>
                                            </div>
                                        ) : (
                                            <div className="relative border-l-2 border-border/50 ml-4 space-y-10 pb-6">
                                                {updates?.map((upd: ProjectUpdate) => {
                                                            const isEditing = editingNoteId === upd.id
                                                            const hasNote = Boolean(upd.client_note)

                                                            // Revision system: detect if this update is a correction of another
                                                            const isCorrection = Boolean(upd.revision_of)
                                                            const originalUpdate = isCorrection
                                                                ? updates.find((u: ProjectUpdate) => u.id === upd.revision_of)
                                                                : null
                                                            // Detect if this update was superseded by a later correction
                                                            const correctionUpdate = updates.find((u: ProjectUpdate) => u.revision_of === upd.id)
                                                            const isSuperseded = Boolean(correctionUpdate)

                                                            return (
                                                                <div key={upd.id} className="relative pl-8 animate-fade-in group">
                                                                    {/* Timeline Dot — blue for corrections, gold for regular */}
                                                                    <div className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-card border-[3px] shadow-[0_0_10px_rgba(245,168,0,0.4)] ${
                                                                        isCorrection ? 'border-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]' : 'border-primary'
                                                                    }`} />

                                                                    {/* Update Content */}
                                                                    <div
                                                                        className="bg-secondary/20 border border-border rounded-xl p-5 mb-4 relative overflow-hidden group/card"
                                                                        onMouseEnter={() => !upd.viewed_at && markAsViewed(upd.id)}
                                                                    >
                                                                        {upd.preview_url && project.preview_url !== upd.preview_url && (
                                                                            <div className="absolute top-0 right-0 px-3 py-1 bg-amber-500/10 border-l border-b border-amber-500/20 rounded-bl-lg flex items-center gap-1.5 animate-pulse">
                                                                                <AlertCircle size={10} className="text-amber-500" />
                                                                                <span className="text-[9px] font-bold text-amber-500 uppercase tracking-tight">Build em Defasagem</span>
                                                                            </div>
                                                                        )}

                                                                        <div className="flex items-center justify-between mb-2">
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="text-[11px] font-bold text-primary tracking-widest uppercase bg-primary/10 px-2 py-0.5 rounded-sm">
                                                                                    Etapa {upd.stage}
                                                                                </span>
                                                                                {upd.status === 'authorized' && (
                                                                                    <span className="text-[9px] font-bold text-green-500 uppercase flex items-center gap-1 bg-green-500/10 px-2 py-0.5 rounded-sm">
                                                                                        <Check size={10} /> Aprovado
                                                                                    </span>
                                                                                )}
                                                                                {upd.status === 'denied' && (
                                                                                    <span className="text-[9px] font-bold text-red-500 uppercase flex items-center gap-1 bg-red-500/10 px-2 py-0.5 rounded-sm">
                                                                                        <X size={10} /> Ajuste Solicitado
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                            <span className="text-[12px] font-medium text-muted-foreground">
                                                                                 {format(new Date(upd.created_at), "dd 'de' MMM, HH:mm", { locale: ptBR })}
                                                                             </span>
                                                                        </div>
                                                                        <div className="flex items-start justify-between gap-4 mb-2">
                                                                            <h4 className="text-[16px] font-semibold text-foreground flex items-center gap-2">
                                                                                {upd.title}
                                                                                {isSuperseded && (
                                                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[9px] font-black uppercase tracking-wider">
                                                                                        <CheckCircle2 size={10} /> Resolvido
                                                                                    </span>
                                                                                )}
                                                                            </h4>
                                                                            {upd.hours_spent && upd.hours_spent > 0 && (
                                                                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-background border border-border/50 rounded-lg shrink-0">
                                                                                    <Timer size={12} className="text-primary" />
                                                                                    <span className="text-[13px] font-black text-foreground">{formatHours(upd.hours_spent)}</span>
                                                                                </div>
                                                                            )}
                                                                        </div>

                                                                        {/* Revision Banner */}
                                                                        {isCorrection && originalUpdate && (
                                                                            <div className="mb-4 p-3 bg-blue-500/5 border border-blue-500/10 rounded-lg flex items-start gap-3 animate-in slide-in-from-left-2 duration-500">
                                                                                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                                                                                    <RefreshCw size={12} className="text-blue-400" />
                                                                                </div>
                                                                                <div>
                                                                                    <p className="text-[11px] font-bold text-blue-400 uppercase tracking-wider mb-0.5">Atualização Corretiva</p>
                                                                                    <p className="text-[12px] text-foreground/80 leading-snug">
                                                                                        Esta versão é uma correção direta da atualização: <span className="font-bold text-blue-300">"{originalUpdate.title}"</span>.
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        )}

                                                                        {/* Superseded Banner */}
                                                                        {isSuperseded && (
                                                                            <div className="mb-4 p-3 bg-green-500/5 border border-green-500/10 rounded-lg flex items-start gap-3">
                                                                                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                                                                                    <CheckCircle2 size={12} className="text-green-400" />
                                                                                </div>
                                                                                <div>
                                                                                    <p className="text-[11px] font-bold text-green-400 uppercase tracking-wider mb-0.5">Versão Endereçada</p>
                                                                                    <p className="text-[12px] text-foreground/80 leading-snug">
                                                                                        Os pontos desta versão foram corrigidos na atualização mais recente.
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                        {upd.message && (
                                                                            <div className="text-[14px] text-muted-foreground/90 leading-relaxed bg-background/50 p-3 rounded-lg border border-border/30 mb-4">
                                                                                {upd.message}
                                                                            </div>
                                                                        )}

                                                                        {/* Authorization Buttons */}
                                                                        {upd.status === 'pending' && (
                                                                            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/30">
                                                                                <button
                                                                                    disabled={approvingUpdateId === upd.id}
                                                                                    onClick={() => handleUpdateStatus(upd.id, 'authorized')}
                                                                                    className="h-8 px-4 rounded-lg bg-primary text-primary-foreground text-[11px] font-bold hover:opacity-90 flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(245,168,0,0.1)]"
                                                                                >
                                                                                    {approvingUpdateId === upd.id ? <Loader2 size={12} className="animate-spin" /> : <ThumbsUp size={12} />}
                                                                                    Aprovar Etapa
                                                                                </button>
                                                                                <button
                                                                                    disabled={approvingUpdateId === upd.id}
                                                                                    onClick={() => setShowUpdateRejectionFormId(upd.id)}
                                                                                    className="h-8 px-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500/20 text-[11px] font-bold flex items-center gap-1.5 transition-all"
                                                                                >
                                                                                    <ThumbsDown size={12} />
                                                                                    Solicitar Ajuste
                                                                                </button>
                                                                                {upd.preview_url && (
                                                                                    <a
                                                                                        href={upd.preview_url}
                                                                                        target="_blank"
                                                                                        rel="noreferrer"
                                                                                        onClick={() => {
                                                                                            if (!upd.viewed_at) {
                                                                                                markAsViewed(upd.id);
                                                                                                mutate('/api/dashboard/project', (prev: any) => prev ? {
                                                                                                    ...prev,
                                                                                                    allUpdates: prev.allUpdates.map((u: ProjectUpdate) => u.id === upd.id ? { ...u, viewed_at: new Date().toISOString() } : u)
                                                                                                } : prev, false);
                                                                                            }
                                                                                        }}
                                                                                        className={`h-8 px-3 rounded-lg border flex items-center gap-1.5 transition-all ml-auto text-[11px] font-bold ${!upd.viewed_at
                                                                                            ? 'bg-primary text-primary-foreground border-primary shadow-[0_0_15px_rgba(245,168,0,0.3)] animate-pulse-slow'
                                                                                            : 'bg-secondary/50 border-border text-muted-foreground hover:text-primary'
                                                                                            }`}
                                                                                    >
                                                                                        <LinkIcon size={12} /> Visualizar Build
                                                                                    </a>
                                                                                )}
                                                                            </div>
                                                                        )}

                                                                        {upd.status === 'denied' && upd.feedback && (
                                                                            <div className="mt-2 bg-red-500/5 border border-red-500/20 rounded-lg p-3 animate-in slide-in-from-left-2">
                                                                                <div className="flex items-center gap-1.5 text-red-500 font-bold text-[9px] uppercase tracking-wider mb-1"><AlertCircle size={10} /> Sua restrição:</div>
                                                                                <p className="text-[12px] text-foreground font-medium leading-relaxed italic">"{upd.feedback}"</p>
                                                                            </div>
                                                                        )}

                                                                        {showUpdateRejectionFormId === upd.id && (
                                                                            <div className="mt-4 bg-background border border-red-500/30 rounded-xl p-4 shadow-xl animate-in zoom-in-95">
                                                                                <label className="text-[11px] font-bold text-red-500 uppercase mb-2 block">O que precisa ser ajustado?</label>
                                                                                <textarea
                                                                                    autoFocus
                                                                                    rows={3}
                                                                                    value={updateRejectionFeedback}
                                                                                    onChange={e => setUpdateRejectionFeedback(e.target.value)}
                                                                                    placeholder="Descreva detalhadamente o que você gostaria de alterar nesta build..."
                                                                                    className="w-full bg-secondary/20 border border-border rounded-lg p-3 text-[13px] text-foreground focus:border-red-500/50 outline-none resize-none"
                                                                                />
                                                                                <div className="flex justify-end gap-2 mt-4">
                                                                                    <button
                                                                                        onClick={() => setShowUpdateRejectionFormId(null)}
                                                                                        className="px-4 py-1.5 text-[11px] font-bold text-muted-foreground hover:text-foreground"
                                                                                    >
                                                                                        Cancelar
                                                                                    </button>
                                                                                    <button
                                                                                        disabled={!updateRejectionFeedback.trim() || approvingUpdateId === upd.id}
                                                                                        onClick={() => handleUpdateStatus(upd.id, 'denied', updateRejectionFeedback)}
                                                                                        className="px-4 py-1.5 bg-red-500 text-white rounded-lg text-[11px] font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20 flex items-center gap-1.5"
                                                                                    >
                                                                                        {approvingUpdateId === upd.id && <Loader2 size={12} className="animate-spin" />}
                                                                                        Confirmar Restrição
                                                                                    </button>
                                                                                </div>
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
                </div>
            </div>


            {/* Chat Modal Overlay — opens only via squad member click or MENSAGEM SQUAD */}
            <AnimatePresence>
                {showChatPopup && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            key="chat-backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => { setShowChatPopup(false); setChatConvId(null) }}
                            className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm"
                        />
                        {/* Panel */}
                        <motion.div
                            key="chat-panel"
                            initial={{ opacity: 0, scale: 0.96, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: 20 }}
                            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                            className="fixed z-[120] inset-4 sm:inset-8 md:inset-12 lg:inset-16 xl:inset-20 2xl:inset-24 flex"
                        >
                            <ChatTeam
                                currentUser={{
                                    id: user?.id || '',
                                    name: user?.name || '',
                                    avatar_url: user?.avatar_url,
                                    role: user?.role || 'client'
                                }}
                                projectId={activeProjectId || undefined}
                                defaultConversationId={chatConvId}
                                onClose={() => { setShowChatPopup(false); setChatConvId(null) }}
                            />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>


            {/* Special Modal Popups */}
            <AnimatePresence>
                {/* Welcome Popup */}
                {showWelcome && (
                    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-500">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            className="bg-card border border-border rounded-2xl max-w-xl w-full p-8 shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-3xl" />
                            
                            <div className="flex flex-col items-center text-center relative z-10">
                                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 animate-bounce">
                                    <FileText size={32} />
                                </div>
                                
                                <h2 className="text-2xl font-bold mb-4 tracking-tight">Acordo de Confidencialidade</h2>
                                
                                <div className="bg-secondary/30 rounded-xl p-5 text-left mb-6 border border-border/50 max-h-60 overflow-y-auto custom-scrollbar">
                                    <p className="text-[13px] text-muted-foreground leading-relaxed mb-4">
                                        Para garantir a segurança e a integridade de todos os projetos na plataforma Nordex, solicitamos que você aceite os nossos termos de confidencialidade antes de prosseguir.
                                    </p>
                                    <ul className="text-[12px] text-muted-foreground space-y-2 list-disc pl-4">
                                        <li>Não compartilhar credenciais ou links de acesso;</li>
                                        <li>Manter sigilo sobre as estratégias e tecnologias discutidas;</li>
                                        <li>Proteger os dados de terceiros acessados no portal;</li>
                                        <li>Reportar imediatamente qualquer atividade suspeita.</li>
                                    </ul>
                                </div>

                                <div className="flex items-center gap-3 mb-8 w-full justify-center">
                                    <button 
                                        onClick={() => setAgreedToTerms(!agreedToTerms)}
                                        className={`w-6 h-6 rounded-md border flex items-center justify-center transition-all ${
                                            agreedToTerms ? 'bg-primary border-primary text-primary-foreground' : 'bg-secondary border-border'
                                        }`}
                                    >
                                        {agreedToTerms && <Check size={14} />}
                                    </button>
                                    <p className="text-[13px] font-medium">Li e concordo com os termos de confidencialidade.</p>
                                </div>

                                <button 
                                    onClick={closeWelcome}
                                    disabled={!agreedToTerms}
                                    className="w-full bg-primary text-primary-foreground h-12 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/20"
                                >
                                    <CheckCircle2 size={18} />
                                    Iniciar meu projeto agora
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Global Squad Hover Popover */}
                {hoverSquadRect?.member?.bio && !showChatPopup && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, x: -10 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9, x: -10 }}
                        className="fixed z-[200] w-[280px] sm:w-[320px] pointer-events-none"
                        style={{
                            top: Math.max(10, (hoverSquadRect?.top || 0) - 20),
                            left: (hoverSquadRect?.left || 0) + 16
                        }}
                    >
                        <div className="bg-card/95 backdrop-blur-xl border border-primary/20 p-5 rounded-2xl shadow-2xl overflow-hidden relative border-l-primary border-l-4">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-3xl -mr-8 -mt-8" />
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                                        {hoverSquadRect.member.position || 'Especialista'}
                                    </span>
                                </div>
                                <p className="text-[14px] font-bold text-foreground mb-2">{hoverSquadRect.member.name}</p>
                                <p className="text-[12px] sm:text-[13px] text-muted-foreground leading-relaxed font-medium">
                                    {hoverSquadRect.member.bio}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Virtual Assistant */}
            <NordyAssistant project={project} tourCompleted={data?.tourCompleted} tourEnabled={!showWelcome} />
        </div>
    )
}
