/**
 * Admin Panel - Ultimate Tier Design + Deep Linking Integration + Per-Update Notes
 */
'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { LogOut, Plus, Activity, Send, Loader2, X, Edit, Users, FolderKanban, CheckCircle2, Clock, MessageSquareText, FileEdit, Link as LinkIcon, ChevronDown, ChevronUp, ThumbsUp, ThumbsDown, AlertCircle } from 'lucide-react'
import type { Project, PortalUser, ProjectUpdate } from '@/lib/types'
import { STAGES } from '@/lib/types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function AdminPage() {
    const router = useRouter()
    const [projects, setProjects] = useState<Project[]>([])
    const [users, setUsers] = useState<PortalUser[]>([])
    const [loading, setLoading] = useState(true)

    const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'users'>('overview')
    const [isUpdating, setIsUpdating] = useState<string | null>(null) // project id
    
    // UI states for expanding specific project timelines
    const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null)

    // Modals
    const [showNewClient, setShowNewClient] = useState(false)
    const [showNewProject, setShowNewProject] = useState(false)
    const [editingUser, setEditingUser] = useState<PortalUser | null>(null)

    // Project Editor Modal
    const [editingProject, setEditingProject] = useState<Project | null>(null)
    const [editProjectName, setEditProjectName] = useState('')
    const [editProjectDesc, setEditProjectDesc] = useState('')
    const [editProjectUrl, setEditProjectUrl] = useState('')
    const [editProjectLoading, setEditProjectLoading] = useState(false)

    // Forms states...
    const [newClientName, setNewClientName] = useState('')
    const [newClientEmail, setNewClientEmail] = useState('')
    const [newClientPassword, setNewClientPassword] = useState('')
    const [newClientRole, setNewClientRole] = useState('client')
    const [clientLoading, setClientLoading] = useState(false)

    const [editUserName, setEditUserName] = useState('')
    const [editUserEmail, setEditUserEmail] = useState('')
    const [editUserPassword, setEditUserPassword] = useState('')
    const [editUserRole, setEditUserRole] = useState('client')
    const [editUserLoading, setEditUserLoading] = useState(false)

    const [newProjectName, setNewProjectName] = useState('')
    const [newProjectClientId, setNewProjectClientId] = useState('')
    const [newProjectDesc, setNewProjectDesc] = useState('')
    const [newProjectUrl, setNewProjectUrl] = useState('')
    const [projectLoading, setProjectLoading] = useState(false)

    const [updateStage, setUpdateStage] = useState(1)
    const [updateTitle, setUpdateTitle] = useState('')
    const [updateMessage, setUpdateMessage] = useState('')
    const [updatePreviewUrl, setUpdatePreviewUrl] = useState('')

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const [resProj, resUsers] = await Promise.all([
                fetch('/api/admin/projects'),
                fetch('/api/admin/users')
            ])
            if (resProj.ok) {
                const data = await resProj.json()
                const sortedProjects = data.projects.sort((a: Project, b: Project) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
                setProjects(sortedProjects)
                // Se só tem 1 projeto ou se acabou de salvar uma update e queremos deixá-la visível, setar o expand handler.
            }
            if (resUsers.ok) setUsers((await resUsers.json()).users)
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' })
        router.push('/login')
    }

    const handlePostUpdate = async (e: React.FormEvent, projectId: string) => {
        e.preventDefault()
        try {
            const res = await fetch('/api/admin/updates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    project_id: projectId, 
                    stage: updateStage, 
                    title: updateTitle, 
                    message: updateMessage,
                    preview_url: updatePreviewUrl || undefined
                 }),
            })
            if (!res.ok) throw new Error()
            setIsUpdating(null)
            setUpdateTitle('')
            setUpdateMessage('')
            setUpdatePreviewUrl('')
            setExpandedProjectId(projectId) // KEEP EXPANDED TRUE AFTER POST
            fetchData()
        } catch (err) {
            alert('Erro ao atualizar estágio')
        }
    }

    // Modal Handle logic for simplicity...
    const handleCreateClient = async (e: React.FormEvent) => {
        e.preventDefault(); setClientLoading(true)
        try {
            const res = await fetch('/api/admin/users', { method: 'POST', body: JSON.stringify({ name: newClientName, email: newClientEmail, password: newClientPassword, role: newClientRole }) })
            if (!res.ok) throw new Error()
            setShowNewClient(false); fetchData()
        } catch (err) { alert('Erro ao criar') } finally { setClientLoading(false) }
    }

    const handleEditUser = async (e: React.FormEvent) => {
        e.preventDefault(); if (!editingUser) return; setEditUserLoading(true)
        try {
            const res = await fetch('/api/admin/users', { method: 'PUT', body: JSON.stringify({ id: editingUser.id, name: editUserName, email: editUserEmail, password: editUserPassword || undefined, role: editUserRole }) })
            if (!res.ok) throw new Error()
            setEditingUser(null); fetchData()
        } catch (err) { alert('Erro ao edtiar') } finally { setEditUserLoading(false) }
    }

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault(); setProjectLoading(true)
        try {
            const res = await fetch('/api/admin/projects', { method: 'POST', body: JSON.stringify({ client_id: newProjectClientId, name: newProjectName, description: newProjectDesc, preview_url: newProjectUrl }) })
            if (!res.ok) throw new Error()
            setShowNewProject(false); setActiveTab('projects'); fetchData()
        } catch (err) { alert('Erro criar proj') } finally { setProjectLoading(false) }
    }

    const openEditProjectModal = (proj: Project) => {
        setEditingProject(proj); setEditProjectName(proj.name); setEditProjectDesc(proj.description || ''); setEditProjectUrl(proj.preview_url || '');
    }

    const handleEditProject = async (e: React.FormEvent) => {
        e.preventDefault(); if (!editingProject) return; setEditProjectLoading(true)
        try {
            const res = await fetch('/api/admin/projects', { method: 'PUT', body: JSON.stringify({ id: editingProject.id, name: editProjectName, description: editProjectDesc, preview_url: editProjectUrl }) })
            if (!res.ok) throw new Error()
            setEditingProject(null); fetchData()
        } catch (err) { alert('Erro ao atualizar proojeto') } finally { setEditProjectLoading(false) }
    }

    if (loading && projects.length === 0) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>;

    const totalProjects = projects.length;
    const totalClients = users.filter((u) => u.role === 'client').length;
    const completedProjects = projects.filter((p) => p.current_stage === 6).length;
    const activeProjects = totalProjects - completedProjects;

    return (
        <div className="min-h-screen bg-background pb-20 text-foreground selection:bg-primary/30">
            <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Image src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo-Nordex-Tech-remove-WSehNqsem3EZQ2jxpk0CKTKMU1hLtG.png" alt="Nordex" width={120} height={40} className="h-6 w-auto opacity-90" />
                        <div className="h-4 w-px bg-border hidden sm:block" />
                        <span className="bg-primary/10 text-primary text-[11px] font-bold px-2 py-0.5 border border-primary/20 uppercase tracking-widest rounded-sm">ADMIN PANEL</span>
                    </div>
                    <button onClick={handleLogout} className="flex flex-col text-right hover:text-primary transition-colors">
                        <span className="text-[13px] font-medium leading-none">Desconectar</span>
                        <span className="text-[10px] text-muted-foreground">Admin Session</span>
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Custom Elegant Tab System */}
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/50">
                    <div className="inline-flex items-center bg-card border border-border rounded-lg p-1.5 shadow-sm">
                        <button onClick={() => setActiveTab('overview')} className={`px-5 py-2 rounded-md text-[13px] font-semibold transition-all ${activeTab === 'overview' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'}`}>
                            Visão Geral
                        </button>
                        <button onClick={() => setActiveTab('projects')} className={`px-5 py-2 rounded-md text-[13px] font-semibold transition-all ${activeTab === 'projects' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'}`}>
                            Esteiras & Diários
                        </button>
                        <button onClick={() => setActiveTab('users')} className={`px-5 py-2 rounded-md text-[13px] font-semibold transition-all ${activeTab === 'users' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'}`}>
                            Painel de Usuários
                        </button>
                    </div>
                </div>

                {activeTab === 'overview' && (
                    <div className="space-y-8 animate-fade-in">
                        {/* KPI Cards (Matches global dark style) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                            {[
                                { lab: 'Total de Projetos', val: totalProjects, icon: <FolderKanban size={100} />, col: 'primary' },
                                { lab: 'Pool de Clientes', val: totalClients, icon: <Users size={100} />, col: 'primary' },
                                { lab: 'Pipeline Ativa', val: activeProjects, icon: <Activity size={100} />, col: 'blue-500' },
                                { lab: 'Concluídos', val: completedProjects, icon: <CheckCircle2 size={100} />, col: 'green-500' },
                            ].map((kpi, i) => (
                                <div key={i} className="bg-card border border-border rounded-2xl p-6 relative overflow-hidden group">
                                    <div className="absolute right-0 top-0 opacity-[0.02] -translate-y-4 translate-x-4 max-w-[80px] pointer-events-none">{kpi.icon}</div>
                                    <p className="text-[12px] font-semibold text-muted-foreground mb-4 tracking-wider uppercase">{kpi.lab}</p>
                                    <p className={`text-4xl font-bold tracking-tighter ${kpi.col === 'primary' ? 'text-primary' : kpi.col === 'green-500' ? 'text-green-500' : 'text-blue-500'}`}>
                                        {kpi.val}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="bg-card border border-border rounded-2xl overflow-hidden p-[1px]">
                            <div className="bg-background rounded-2xl p-8">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                                    <h3 className="text-[18px] font-semibold tracking-tight text-foreground flex items-center gap-3">
                                        <FolderKanban size={20} className="text-primary"/> Fluxo Operacional Rápido
                                    </h3>
                                    <div className="flex gap-3">
                                        <button onClick={() => setShowNewClient(true)} className="h-10 px-4 rounded-lg bg-secondary border border-border text-[13px] font-medium hover:bg-white/5 inline-flex items-center gap-2 relative group overflow-hidden">
                                            <span className="relative z-10"><Users size={14} className="inline mr-1" /> Novo Usuário</span>
                                        </button>
                                        <button onClick={() => setShowNewProject(true)} className="h-10 px-5 rounded-lg bg-primary text-primary-foreground font-semibold text-[13px] hover:opacity-90 inline-flex items-center gap-2 shadow-[0_0_15px_rgba(245,168,0,0.15)] relative overflow-hidden">
                                            <span>Novo Projeto</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="text-[14px] text-muted-foreground text-center py-10 border border-dashed border-border/50 rounded-xl">
                                    Seus alertas sobre notes não respondidos aparecerão aqui se o volume escalar futuramente. Navegue pelas "Esteiras & Diários" para atualizar o pipeline dos projetos vigentes.
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'projects' && (
                    <div className="animate-fade-in max-w-4xl mx-auto space-y-6">
                        {projects.length === 0 ? (
                            <div className="text-center py-24 bg-card border border-border rounded-xl">
                                <FolderKanban size={32} className="mx-auto text-muted-foreground mb-4 opacity-50" />
                                <p className="text-[15px] font-medium text-foreground mb-2">A esteira operacional está vazia.</p>
                                <button onClick={() => setShowNewProject(true)} className="h-10 px-5 rounded-lg bg-primary text-primary-foreground font-semibold text-[13px] hover:opacity-90 inline-flex items-center gap-2 mt-4">
                                    Novo Projeto
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-5">
                                {projects.map(proj => {
                                    const isExpanded = expandedProjectId === proj.id;
                                    const ps = proj.preview_status ?? 'none';

                                    return (
                                    <div key={proj.id} className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg transition-all">
                                        
                                        {/* Premium Card Header */}
                                        <div className="p-6 relative">
                                            <div className="absolute top-0 right-0 w-64 h-full bg-primary/5 blur-[50px] pointer-events-none" />
                                            
                                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                                                        <span className="bg-primary/20 text-primary text-[10px] uppercase font-bold px-2 py-0.5 rounded tracking-widest border border-primary/20">
                                                            Etapa {proj.current_stage}/6
                                                        </span>
                                                        {/* Preview Status Badge */}
                                                        {ps === 'pending' && (
                                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border bg-amber-500/10 border-amber-500/30 text-amber-400">
                                                                <Clock size={10} /> Aguardando Avaliação do Cliente
                                                            </span>
                                                        )}
                                                        {ps === 'approved' && (
                                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border bg-green-500/10 border-green-500/30 text-green-400">
                                                                <ThumbsUp size={10} /> Entrega Aprovada
                                                            </span>
                                                        )}
                                                        {ps === 'rejected' && (
                                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border bg-red-500/10 border-red-500/30 text-red-400 animate-pulse">
                                                                <AlertCircle size={10} /> Ajustes Solicitados — Feedback Disponível
                                                            </span>
                                                        )}
                                                        <h3 className="font-bold text-[20px] tracking-tight text-foreground flex items-center gap-2">
                                                            {proj.name}
                                                            <button onClick={() => openEditProjectModal(proj)} className="text-muted-foreground hover:text-primary transition-colors hover:bg-secondary p-1.5 rounded-md" title="Editar Metadados">
                                                                <FileEdit size={16} />
                                                            </button>
                                                        </h3>
                                                    </div>

                                                    {/* REJECTION FEEDBACK ALERT */}
                                                    {ps === 'rejected' && proj.preview_feedback && (
                                                        <div className="mt-3 bg-red-500/5 border border-red-500/20 rounded-xl p-4 animate-in slide-in-from-left-2 duration-500">
                                                            <div className="flex items-center gap-2 text-red-400 font-bold text-[10px] uppercase tracking-wider mb-1">
                                                                <MessageSquareText size={12} /> Solicitação de Ajuste do Cliente:
                                                            </div>
                                                            <p className="text-[13px] text-foreground font-medium leading-relaxed italic">
                                                                "{proj.preview_feedback}"
                                                            </p>
                                                        </div>
                                                    )}
                                                    
                                                    <div className="flex items-center gap-4 text-[13px] text-muted-foreground mt-2 font-medium">
                                                        <div className="flex items-center gap-1.5">
                                                            <Users size={14} className="text-primary/70" />
                                                            {proj.client_name}
                                                        </div>
                                                        {proj.preview_url && (
                                                            <>
                                                                <div className="w-1 h-1 rounded-full bg-border" />
                                                                <div className="flex items-center gap-1.5">
                                                                    <LinkIcon size={14} className="text-green-500" />
                                                                    Link de teste configurado
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>

                                                <button 
                                                    onClick={() => setExpandedProjectId(isExpanded ? null : proj.id)}
                                                    className="w-full lg:w-auto h-11 px-6 bg-secondary/80 hover:bg-white/5 border border-border rounded-xl text-[13px] font-semibold inline-flex items-center justify-center gap-2 transition-all"
                                                >
                                                    {isExpanded ? 'Esconder Diário Operacional' : 'Abrir Linha do Tempo e Diário'}
                                                    {isExpanded ? <ChevronUp size={16} className="text-primary"/> : <ChevronDown size={16} className="text-primary"/>}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Expanded Timeline View */}
                                        {isExpanded && (
                                            <div className="bg-background border-t border-border animate-fade-in overflow-hidden">
                                                
                                                {/* Dispatch new update block */}
                                                <div className="p-6 border-b border-border/50 bg-secondary/10">
                                                    {isUpdating === proj.id ? (
                                                        <form onSubmit={(e) => handlePostUpdate(e, proj.id)} className="space-y-4 bg-background p-6 rounded-xl border border-primary/30 shadow-2xl relative">
                                                            <div className="absolute top-0 left-0 w-2 h-full bg-primary rounded-l-xl" />
                                                            
                                                            <div className="flex items-center justify-between">
                                                                <h4 className="text-[15px] font-semibold text-foreground">Disparar Atualização para {proj.client_name}</h4>
                                                                <button type="button" onClick={() => setIsUpdating(null)} className="p-1 rounded bg-secondary text-muted-foreground hover:text-foreground"><X size={16} /></button>
                                                            </div>
                                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                                <div className="md:col-span-1">
                                                                    <label className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-2 block">Selecione Fase</label>
                                                                    <select value={updateStage} onChange={e => setUpdateStage(Number(e.target.value))} className="w-full bg-card border border-border rounded-md px-3 py-3 text-[13px] text-foreground focus:border-primary outline-none font-semibold">
                                                                        {STAGES.map(s => <option key={s.id} value={s.id}>Et. {s.id}: {s.label}</option>)}
                                                                    </select>
                                                                </div>
                                                                <div className="md:col-span-3">
                                                                    <label className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-2 block">Ato / Título (Notificação)</label>
                                                                    <input type="text" placeholder="Ex: Layout Premium Aprovado" required value={updateTitle} onChange={e => setUpdateTitle(e.target.value)} className="w-full bg-card border border-border rounded-md px-3 py-3 text-[13px] text-foreground focus:border-primary outline-none font-medium" />
                                                                </div>
                                                            </div>
                                                            
                                                            <div>
                                                                <label className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-2 block">Mensagem Estruturada (Opcional)</label>
                                                                <textarea placeholder="Relate o que foi finalizado e quais são as orientações..." rows={3} value={updateMessage} onChange={e => setUpdateMessage(e.target.value)} className="w-full bg-card border border-border rounded-md px-3 py-3 text-[13px] resize-y text-foreground focus:border-primary outline-none placeholder:text-muted-foreground/40" />
                                                            </div>

                                                            <div className="bg-secondary/30 p-4 rounded-lg border border-border/50">
                                                                <label className="text-[11px] font-bold uppercase text-primary tracking-wider mb-2 flex items-center gap-2">
                                                                    <LinkIcon size={12}/> Link de Homologação (Injetar Automático)
                                                                </label>
                                                                <p className="text-[11px] text-muted-foreground mb-3 leading-relaxed">
                                                                    Se você inserir uma url aqui, o botão principal do *Dashboard do Cliente* e o registro dele será imediatamente substituído para este novo link. Deixe vazio para manter a URL atual do projeto.
                                                                </p>
                                                                <input type="url" placeholder={'Atual: ' + (proj.preview_url || 'Nenhuma')} value={updatePreviewUrl} onChange={e => setUpdatePreviewUrl(e.target.value)} className="w-full bg-background border border-border rounded-md px-3 py-2.5 text-[13px] text-foreground focus:border-primary outline-none" />
                                                            </div>
                                                            
                                                            <div className="flex justify-end pt-2">
                                                                <button type="submit" className="h-11 px-8 bg-primary text-primary-foreground rounded-lg text-[13px] font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(245,168,0,0.2)]">
                                                                    <Send size={16} /> Enviar Atualização para a Nuvem
                                                                </button>
                                                            </div>
                                                        </form>
                                                    ) : (
                                                        <button onClick={() => { setIsUpdating(proj.id); setUpdateStage(proj.current_stage); setUpdatePreviewUrl(''); }} className="w-full h-12 flex items-center justify-center gap-2 bg-background border border-dashed border-primary/50 text-foreground hover:bg-secondary/50 rounded-xl transition-all text-[14px] font-semibold">
                                                            <Plus size={18} className="text-primary"/> Criar Nova Atualização de Pipeline
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Mirror Timeline Feed */}
                                                <div className="p-8 px-8 sm:px-12 bg-background">
                                                    {(() => {
                                                        const pUpdates = proj.updates || []; // Aggregated via SQL GET route
                                                        if (pUpdates.length === 0) return <p className="text-[13px] text-muted-foreground text-center py-6">Este projeto ainda não recebeu nenhuma atualização estrutural na pipeline.</p>;
                                                        
                                                        return (
                                                            <div className="relative border-l-2 border-border/50 ml-4 space-y-12 pb-6">
                                                                {pUpdates.map((upd: any) => (
                                                                    <div key={upd.id} className="relative pl-8 group">
                                                                        <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-card border-[3px] border-primary shadow-[0_0_10px_rgba(245,168,0,0.4)]" />
                                                                        
                                                                        <div className="flex items-center justify-between mb-2">
                                                                            <span className="text-[11px] font-bold text-primary tracking-widest uppercase bg-primary/10 px-2 py-0.5 rounded-sm">
                                                                                Etapa Atualizada {upd.stage}
                                                                            </span>
                                                                            <span className="text-[12px] font-medium text-muted-foreground">
                                                                                {format(new Date(upd.created_at), "dd 'de' MMM 'às' HH:mm", { locale: ptBR })}
                                                                            </span>
                                                                        </div>
                                                                        <h4 className="text-[16px] font-semibold text-foreground mb-2">{upd.title}</h4>
                                                                        {upd.message && <div className="text-[14px] text-muted-foreground/90 leading-relaxed bg-secondary/30 p-3 rounded-lg border border-border">{upd.message}</div>}

                                                                        {/* The Client Note Context */}
                                                                        <div className="mt-4 pt-4 border-t border-border/30">
                                                                            {upd.client_note ? (
                                                                                <div className="bg-card border border-primary/30 rounded-xl p-5 shadow-sm relative">
                                                                                     <div className="absolute -top-3 left-4 bg-background border border-primary/30 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-1.5">
                                                                                        <MessageSquareText size={12}/> Resposta do Cliente
                                                                                     </div>
                                                                                    <p className="text-[14px] text-foreground/90 leading-relaxed whitespace-pre-wrap mt-2 font-medium">
                                                                                        {upd.client_note}
                                                                                    </p>
                                                                                </div>
                                                                            ) : (
                                                                                <div className="inline-flex items-center gap-2 text-[12px] font-medium text-muted-foreground italic px-3 py-2 bg-secondary/20 rounded-lg">
                                                                                    <Clock size={14} className="opacity-50"/> Cliente ainda não mandou anotações para este update.
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )
                                                    })()}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'users' && (
                     // Users Tab - keeping minimal and clean like before but with uniform style
                    <div className="bg-card border border-border rounded-xl p-8 overflow-hidden animate-fade-in max-w-5xl mx-auto shadow-lg">
                        <div className="flex justify-between items-center mb-8 border-b border-border/50 pb-5">
                            <h3 className="text-[18px] font-semibold text-foreground">Relatório de Identidades</h3>
                            <button onClick={() => setShowNewClient(true)} className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-[13px] font-semibold hover:opacity-90 inline-flex items-center gap-2">
                                <Plus size={16}/> Novo Usuário
                            </button>
                        </div>
                        {users.length === 0 ? (
                            <div className="text-center py-10"><p className="text-[13px] text-muted-foreground">O banco de usuários está vazio.</p></div>
                        ) : (
                            <div className="overflow-x-auto rounded-lg border border-border">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-secondary/50 text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border text-center">
                                        <tr>
                                            <th className="px-6 py-4 font-bold text-left">Responsável Titular</th>
                                            <th className="px-6 py-4 font-bold text-left">Login Email Address</th>
                                            <th className="px-6 py-4 font-bold">Natureza do Privilégio</th>
                                            <th className="px-6 py-4 font-bold text-right">Settings</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border text-[13px]">
                                        {users.map((u: PortalUser) => (
                                            <tr key={u.id} className="hover:bg-background transition-colors bg-card">
                                                <td className="px-6 py-4 font-medium text-foreground text-left">{u.name}</td>
                                                <td className="px-6 py-4 text-muted-foreground text-left font-mono text-[12px]">{u.email}</td>
                                                <td className="px-6 py-4 text-center">
                                                    {u.role === 'admin' 
                                                        ? <span className="px-3 py-1 rounded-sm bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold uppercase tracking-widest inline-block w-[120px]">Super Admin</span>
                                                        : <span className="px-3 py-1 rounded-sm bg-secondary text-muted-foreground border border-border text-[10px] font-bold uppercase tracking-widest inline-block w-[120px]">Consumer View</span>
                                                    }
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button onClick={() => { setEditingUser(u); setEditUserName(u.name); setEditUserEmail(u.email); setEditUserRole(u.role); setEditUserPassword(''); }} className="inline-flex h-8 items-center justify-center bg-background border border-border hover:border-primary px-3 rounded text-[12px] font-medium transition-all gap-1.5 focus:outline-none focus:ring-1 focus:ring-primary shadow-sm hover:text-primary">
                                                        <Edit size={12} /> Editar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Editing Modals (Project / Client / ClientEdit) -> Kept robust logic with updated standard borders/bg colors like in V1 */}

            {/* MODAL: Editor de Projeto */}
            {editingProject && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-card border border-border rounded-xl w-full max-w-md shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b border-border bg-secondary/10">
                            <h3 className="text-[16px] font-semibold text-foreground">Ajustes Primários do Projeto</h3>
                            <button onClick={() => setEditingProject(null)} className="text-muted-foreground hover:text-foreground bg-background p-1.5 rounded border border-border shadow-sm"><X size={16} /></button>
                        </div>
                        <form onSubmit={handleEditProject} className="p-6 space-y-4">
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wide mb-1.5 text-muted-foreground">Identidade</label>
                                <input required value={editProjectName} onChange={e => setEditProjectName(e.target.value)} type="text" className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-[14px] font-medium text-foreground focus:border-primary outline-none" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wide mb-1.5 text-muted-foreground">Objeto</label>
                                <textarea value={editProjectDesc} onChange={e => setEditProjectDesc(e.target.value)} rows={3} className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-[14px] text-foreground focus:border-primary outline-none resize-none" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wide mb-1.5 text-muted-foreground">Preview Link Base</label>
                                <input value={editProjectUrl} onChange={e => setEditProjectUrl(e.target.value)} type="url" className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-[14px] font-mono text-foreground focus:border-primary outline-none" placeholder="https://" />
                                <p className="text-[11px] mt-1 text-muted-foreground">Nota: Se você mandar url junto do envio de update da esteira, isto será sobreposto.</p>
                            </div>
                            
                            <div className="pt-6 flex gap-3">
                                <button type="button" onClick={() => setEditingProject(null)} className="flex-1 h-11 bg-secondary hover:bg-white/5 rounded-lg text-[13px] font-semibold transition-colors">Abortar</button>
                                <button type="submit" disabled={editProjectLoading} className="flex-1 h-11 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg text-[13px] font-semibold transition-colors flex justify-center items-center shadow-[0_0_15px_rgba(245,168,0,0.2)]">
                                    {editProjectLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sincronizar DB'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: Novo Cliente */}
             {showNewClient && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-card border border-border rounded-xl w-full max-w-md shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b border-border bg-secondary/10">
                            <h3 className="text-[16px] font-semibold text-foreground">Emissão de Nova Credencial</h3>
                            <button onClick={() => setShowNewClient(false)} className="text-muted-foreground hover:text-foreground bg-background p-1.5 rounded border border-border shadow-sm"><X size={16} /></button>
                        </div>
                        <form onSubmit={handleCreateClient} className="p-6 space-y-4">
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wide mb-1.5 text-muted-foreground">Indivíduo</label>
                                <input required value={newClientName} onChange={e => setNewClientName(e.target.value)} type="text" className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-[14px] text-foreground focus:border-primary outline-none" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wide mb-1.5 text-muted-foreground">Mail de Acionamento</label>
                                <input required value={newClientEmail} onChange={e => setNewClientEmail(e.target.value)} type="email" className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-[14px] text-foreground focus:border-primary outline-none" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wide mb-1.5 text-muted-foreground">Atribuição Formal</label>
                                <select value={newClientRole} onChange={e => setNewClientRole(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-[14px] text-foreground focus:border-primary outline-none font-medium">
                                    <option value="client">Client Pool / Observador de Projetos</option>
                                    <option value="admin">Engenharia / Super Admin</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wide mb-1.5 text-primary">Token de Password (Critical)</label>
                                <input required value={newClientPassword} onChange={e => setNewClientPassword(e.target.value)} type="text" className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-[14px] font-mono text-foreground focus:border-primary outline-none" placeholder="Ex: nordex-1234..." />
                            </div>
                            <div className="pt-6 flex gap-3">
                                <button type="button" onClick={() => setShowNewClient(false)} className="flex-1 h-11 bg-secondary hover:bg-white/5 rounded-lg text-[13px] font-semibold transition-colors">Desfazer</button>
                                <button type="submit" disabled={clientLoading} className="flex-1 h-11 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg text-[13px] font-semibold transition-colors flex justify-center items-center">
                                    {clientLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Finalizar Assinatura'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: Novo Projeto*/}
            {showNewProject && (
                 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
                 <div className="bg-card border border-border rounded-xl w-full max-w-lg shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
                     <div className="flex justify-between items-center p-6 border-b border-border bg-secondary/10">
                         <h3 className="text-[16px] font-semibold text-foreground">Abrir Nova Pipeline</h3>
                         <button onClick={() => setShowNewProject(false)} className="text-muted-foreground hover:text-foreground bg-background p-1.5 rounded border border-border shadow-sm"><X size={16} /></button>
                     </div>
                     <form onSubmit={handleCreateProject} className="p-6 space-y-4">
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wide mb-1.5 text-muted-foreground">Obrigações Atreladas a</label>
                                <select required value={newProjectClientId} onChange={e => setNewProjectClientId(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-[14px] focus:border-primary outline-none font-medium">
                                    <option value="" disabled>Escolha um emissor (Owner)...</option>
                                    {users.filter(u => u.role === 'client').map((u) => <option key={u.id} value={u.id}>{u.name} | {u.email}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wide mb-1.5 text-muted-foreground">Nomenclatura Técnica</label>
                                <input required value={newProjectName} onChange={e => setNewProjectName(e.target.value)} type="text" className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-[14px] focus:border-primary outline-none" />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wide mb-1.5 text-muted-foreground">Tese & Escopo Central</label>
                                <textarea value={newProjectDesc} onChange={e => setNewProjectDesc(e.target.value)} rows={3} className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-[14px] focus:border-primary outline-none resize-none" />
                            </div>

                            <div className="pt-6 flex gap-3">
                                <button type="button" onClick={() => setShowNewProject(false)} className="flex-1 h-11 bg-secondary hover:bg-white/5 rounded-lg text-[13px] font-semibold transition-colors">Voltar</button>
                                <button type="submit" disabled={projectLoading || users.length === 0} className="flex-1 h-11 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 rounded-lg text-[13px] font-semibold transition-colors flex justify-center items-center shadow-[0_0_15px_rgba(245,168,0,0.2)]">
                                    {projectLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Emitir Infraestrutura'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
