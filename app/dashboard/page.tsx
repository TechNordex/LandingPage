/**
 * Client Portal (Dashboard) - V3.1
 * Dynamic Per-Update Notes, Mandatory Rejection Feedback, Friendly Terminology
 */
'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
    LogOut, ExternalLink, Loader2, Link as LinkIcon,
    FileText, Activity, Info, MessageSquareText,
    Save, Check, X, ThumbsUp, ThumbsDown, Clock, AlertCircle, Users
} from 'lucide-react'
import { ProjectTracker } from '@/components/project-tracker'
import type { Project, ProjectUpdate } from '@/lib/types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import NordyAssistant from '@/components/nordy-assistant'
import confetti from 'canvas-confetti'

export default function DashboardPage() {
    const router = useRouter()
    const [data, setData] = useState<{
        projects: Project[]
        allUpdates: ProjectUpdate[]
        user?: { name: string; email: string; avatar_url?: string }
        tourCompleted?: boolean
    } | null>(null)
    const [loading, setLoading] = useState(true)
    const [activeProjectId, setActiveProjectId] = useState<string | null>(null)

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
    
    // Squad Hover state
    const [hoveredMemberId, setHoveredMemberId] = useState<string | null>(null)

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

        try {
            const res = await fetch('/api/dashboard/project-notes', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ update_id: updateId, note: tempNoteValue })
            })
            if (!res.ok) throw new Error()
            setEditingNoteId(null)
        } catch {
            setData({ ...data, allUpdates: previousUpdates })
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
        setData({
            ...data,
            allUpdates: data.allUpdates.map(u => u.id === updateId ? { ...u, status, feedback: feedback || null } : u)
        })

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
            setData({ ...data, allUpdates: previousUpdates })
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
        const unviewedIds = updates.filter(u => u.preview_url && !u.viewed_at).map(u => u.id)
        if (unviewedIds.length === 0) return

        // Optimistic local update
        setData(prev => prev ? {
            ...prev,
            allUpdates: prev.allUpdates.map(u => 
                unviewedIds.includes(u.id) ? { ...u, viewed_at: new Date().toISOString() } : u
            )
        } : prev)

        try {
            await Promise.all(unviewedIds.map(id => 
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

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        )
    }

    const { projects, allUpdates, user } = data || {}
    const project = projects?.find(p => p.id === activeProjectId) || null
    const updates = allUpdates?.filter(u => 
        String(u.project_id).trim().toLowerCase() === String(activeProjectId).trim().toLowerCase()
    ) || []

    const hasUnviewedUpdates = updates.some(u => u.preview_url && !u.viewed_at)

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
                            <div className="hidden sm:flex items-center gap-3 pr-4 border-r border-border h-10">
                                <div className="flex flex-col text-right">
                                    <span className="text-[13px] font-bold leading-none text-foreground">{user.name}</span>
                                    <span className="text-[10px] text-muted-foreground mt-1 uppercase tracking-tighter">Cliente Nordex</span>
                                </div>
                                <div className="w-9 h-9 rounded-full bg-secondary border border-border overflow-hidden shrink-0 aspect-square">
                                    {(user as any).avatar_url ? (
                                        <img src={(user as any).avatar_url} alt={user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-primary font-bold">{user.name.charAt(0)}</div>
                                    )}
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
                            <div className="flex items-center gap-3 mb-8 animate-fade-in overflow-x-auto no-scrollbar scroll-smooth pb-2">
                                <div className="flex gap-3 min-w-max">
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
                            </div>
                        )}

                        {/* Top Header Block */}
                        <div className="mb-8 animate-fade-in">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                <div>
                                    <h1 id="tour-welcome" className="text-3xl font-semibold tracking-tight text-foreground mb-2">
                                        {project.name}
                                    </h1>
                                    {project.description && (
                                        <p className="text-[15px] text-muted-foreground max-w-2xl">
                                            {project.description}
                                        </p>
                                    )}

                                    <div id="tour-env-links" className="flex flex-wrap gap-3 mt-6">
                                        <a 
                                            href={project.stage_url || '#'} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className={`h-10 px-5 rounded-xl text-[12px] font-black uppercase tracking-widest flex items-center gap-2 transition-all duration-500 group ${
                                                project.stage_url 
                                                ? 'bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:scale-105 hover:shadow-amber-500/50' 
                                                : 'bg-secondary/40 text-muted-foreground cursor-not-allowed opacity-40 grayscale'
                                            }`}
                                            onClick={(e) => !project.stage_url && e.preventDefault()}
                                        >
                                            <div className={`w-2 h-2 rounded-full ${project.stage_url ? 'bg-black animate-pulse' : 'bg-muted-foreground'}`} />
                                            Ambiente Stage
                                            {project.stage_url && <ExternalLink size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />}
                                        </a>

                                        <a 
                                            href={project.prod_url || '#'} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className={`h-10 px-5 rounded-xl text-[12px] font-black uppercase tracking-widest flex items-center gap-2 transition-all duration-500 group ${
                                                project.prod_url 
                                                ? 'bg-primary text-primary-foreground shadow-[0_0_20px_rgba(245,168,0,0.3)] hover:scale-105 hover:shadow-primary/50' 
                                                : 'bg-secondary/40 text-muted-foreground cursor-not-allowed opacity-40 grayscale'
                                            }`}
                                            onClick={(e) => !project.prod_url && e.preventDefault()}
                                        >
                                            <div className={`w-2 h-2 rounded-full ${project.prod_url ? 'bg-primary-foreground animate-pulse' : 'bg-muted-foreground'}`} />
                                            Ambiente Prod
                                            {project.prod_url && <ExternalLink size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />}
                                        </a>
                                    </div>
                                    
                                    {/* Squad visibility for client */}
                                    {project.squad && project.squad.length > 0 && (
                                        <div id="tour-squad" className="mt-8 flex flex-col gap-3">
                                            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                                                <Users size={12} /> Squad de Especialistas
                                            </span>
                                            <div className="flex flex-wrap gap-3 sm:gap-4">
                                                {project.squad.map(member => (
                                                    <div 
                                                        key={member.id} 
                                                        className="relative"
                                                        onMouseEnter={() => setHoveredMemberId(member.id)}
                                                        onMouseLeave={() => setHoveredMemberId(null)}
                                                    >
                                                        <div className="flex items-center gap-3 bg-secondary/30 border border-border/50 rounded-2xl px-4 py-2.5 hover:bg-secondary/50 transition-all cursor-help group shadow-sm">
                                                            <div className="w-10 h-10 rounded-full bg-background border border-border overflow-hidden shrink-0 aspect-square">
                                                                {member.avatar_url ? (
                                                                    <img src={member.avatar_url} alt={member.name} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-primary font-bold">{member.name.charAt(0)}</div>
                                                                )}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-[13px] font-bold text-foreground leading-none truncate">{member.name}</p>
                                                                <p className="text-[10px] text-muted-foreground mt-1 font-medium truncate">{member.position || 'Especialista'}</p>
                                                            </div>
                                                        </div>

                                                        {/* Bio Popover */}
                                                        <AnimatePresence>
                                                            {hoveredMemberId === member.id && member.bio && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                                                    className="absolute bottom-full left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 mb-4 z-50 w-[280px] sm:w-[320px] pointer-events-none"
                                                                >
                                                                    <div className="bg-card/95 backdrop-blur-xl border border-primary/20 p-5 rounded-2xl shadow-2xl overflow-hidden relative">
                                                                        {/* Background Highlight */}
                                                                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-3xl -mr-8 -mt-8" />
                                                                        
                                                                        <div className="relative z-10">
                                                                            <div className="flex items-center gap-2 mb-3">
                                                                                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                                                                                    {member.position}
                                                                                </span>
                                                                            </div>
                                                                            <p className="text-[14px] font-bold text-foreground mb-2">{member.name}</p>
                                                                            <p className="text-[12px] sm:text-[13px] text-muted-foreground leading-relaxed font-medium">
                                                                                {member.bio}
                                                                            </p>
                                                                            
                                                                            <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
                                                                                <div className="flex items-center gap-1.5">
                                                                                    <div className="w-5 h-5 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                                                                        <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                                                                                    </div>
                                                                                    <span className="text-[10px] sm:text-[11px] font-bold text-blue-500">LinkedIn</span>
                                                                                </div>
                                                                                <div className="text-[10px] text-muted-foreground font-black uppercase tracking-tighter opacity-40">Squad Nordex</div>
                                                                            </div>
                                                                        </div>
                                                                        
                                                                        {/* Arrow */}
                                                                        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 sm:left-8 sm:translate-x-0 w-3 h-3 bg-card border-r border-b border-primary/20 rotate-45" />
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Smart Preview Button Block - REMOVED */}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in items-start" style={{ animationDelay: '100ms' }}>

                            {/* Pipeline Card */}
                            <div id="tour-pipeline" className="lg:col-span-1 rounded-2xl bg-card border border-border p-6 flex flex-col relative">
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
                            <div id="tour-updates" className="lg:col-span-2 rounded-2xl bg-card border border-border p-8 flex flex-col h-[700px]">
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
                                                        <div 
                                                            className="bg-secondary/20 border border-border rounded-xl p-5 mb-4 relative overflow-hidden group/card"
                                                            onMouseEnter={() => !upd.viewed_at && markAsViewed(upd.id)}
                                                        >
                                                            {/* Sync Alert (Defasagem) */}
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
                                                            <h4 className="text-[16px] font-semibold text-foreground mb-2">
                                                                {upd.title}
                                                            </h4>
                                                            {upd.message && (
                                                                <div className="text-[14px] text-muted-foreground/90 leading-relaxed bg-background/50 p-3 rounded-lg border border-border/30 mb-4">
                                                                    {upd.message}
                                                                </div>
                                                            )}

                                                            {/* Granular Authorization Buttons */}
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
                                                                                    // Update local state to immediately reflect the color change
                                                                                    setData(prev => prev ? {
                                                                                        ...prev,
                                                                                        allUpdates: prev.allUpdates.map(u => u.id === upd.id ? { ...u, viewed_at: new Date().toISOString() } : u)
                                                                                    } : prev);
                                                                                }
                                                                            }}
                                                                            className={`h-8 px-3 rounded-lg border flex items-center gap-1.5 transition-all ml-auto text-[11px] font-bold ${
                                                                                !upd.viewed_at 
                                                                                ? 'bg-primary text-primary-foreground border-primary shadow-[0_0_15px_rgba(245,168,0,0.3)] animate-pulse-slow' 
                                                                                : 'bg-secondary/50 border-border text-muted-foreground hover:text-primary'
                                                                            }`}
                                                                        >
                                                                            <LinkIcon size={12} /> Visualizar Build
                                                                        </a>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {/* Denial Feedback View */}
                                                            {upd.status === 'denied' && upd.feedback && (
                                                                <div className="mt-2 bg-red-500/5 border border-red-500/20 rounded-lg p-3 animate-in slide-in-from-left-2">
                                                                    <div className="flex items-center gap-1.5 text-red-500 font-bold text-[9px] uppercase tracking-wider mb-1"><AlertCircle size={10} /> Sua restrição:</div>
                                                                    <p className="text-[12px] text-foreground font-medium leading-relaxed italic">"{upd.feedback}"</p>
                                                                </div>
                                                            )}

                                                            {/* Rejection Form Modal-ish */}
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
            </main>

            {/* Welcome Popup */}
            {showWelcome && (
                <div className="fixed inset-0 z-50 flex justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in overflow-y-auto custom-scrollbar">
                    <div className="bg-card border border-border rounded-2xl p-8 max-w-lg w-full shadow-2xl relative my-auto overflow-hidden">
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

            {/* Virtual Assistant */}
            <NordyAssistant project={project} tourCompleted={data?.tourCompleted} />
        </div>
    )
}
