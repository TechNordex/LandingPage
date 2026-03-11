'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { LogOut, Plus, RefreshCw, Send, Loader2, X, Edit, Trash2, LayoutDashboard, Users, FolderKanban, CheckCircle2, Clock } from 'lucide-react'
import type { Project, PortalUser } from '@/lib/types'
import { STAGES } from '@/lib/types'

export default function AdminPage() {
    const router = useRouter()
    const [projects, setProjects] = useState<Project[]>([])
    const [users, setUsers] = useState<PortalUser[]>([])
    const [loading, setLoading] = useState(true)

    // Modals / forms state
    const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'users'>('overview')
    const [isUpdating, setIsUpdating] = useState<string | null>(null) // project id

    // Modals visibility
    const [showNewClient, setShowNewClient] = useState(false)
    const [showNewProject, setShowNewProject] = useState(false)
    const [editingUser, setEditingUser] = useState<PortalUser | null>(null)

    // New Client Form
    const [newClientName, setNewClientName] = useState('')
    const [newClientEmail, setNewClientEmail] = useState('')
    const [newClientPassword, setNewClientPassword] = useState('')
    const [newClientRole, setNewClientRole] = useState('client')
    const [clientLoading, setClientLoading] = useState(false)

    // Edit User Form
    const [editUserName, setEditUserName] = useState('')
    const [editUserEmail, setEditUserEmail] = useState('')
    const [editUserPassword, setEditUserPassword] = useState('')
    const [editUserRole, setEditUserRole] = useState('client')
    const [editUserLoading, setEditUserLoading] = useState(false)

    // New Project Form
    const [newProjectName, setNewProjectName] = useState('')
    const [newProjectClientId, setNewProjectClientId] = useState('')
    const [newProjectDesc, setNewProjectDesc] = useState('')
    const [newProjectUrl, setNewProjectUrl] = useState('')
    const [projectLoading, setProjectLoading] = useState(false)

    // Update form state
    const [updateStage, setUpdateStage] = useState(1)
    const [updateTitle, setUpdateTitle] = useState('')
    const [updateMessage, setUpdateMessage] = useState('')

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
                // Sort by updated_at descending so recent are first
                const sortedProjects = data.projects.sort((a: Project, b: Project) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
                setProjects(sortedProjects)
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
            await fetch('/api/admin/updates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ project_id: projectId, stage: updateStage, title: updateTitle, message: updateMessage }),
            })
            setIsUpdating(null)
            setUpdateTitle('')
            setUpdateMessage('')
            fetchData()
        } catch (err) {
            alert('Erro ao atualizar')
        }
    }

    const handleCreateClient = async (e: React.FormEvent) => {
        e.preventDefault()
        setClientLoading(true)
        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newClientName, email: newClientEmail, password: newClientPassword, role: newClientRole }),
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error)

            setShowNewClient(false)
            setNewClientName('')
            setNewClientEmail('')
            setNewClientPassword('')
            setNewClientRole('client')
            fetchData()
            alert('Cliente criado com sucesso! Envie o email e a senha para ele acessar.')
        } catch (err: any) {
            alert(err.message || 'Erro ao criar cliente')
        } finally {
            setClientLoading(false)
        }
    }

    const openEditUserModal = (user: PortalUser) => {
        setEditingUser(user)
        setEditUserName(user.name)
        setEditUserEmail(user.email)
        setEditUserRole(user.role)
        setEditUserPassword('') // keep empty unless changing
    }

    const handleEditUser = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingUser) return
        setEditUserLoading(true)
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: editingUser.id,
                    name: editUserName,
                    email: editUserEmail,
                    password: editUserPassword || undefined, // send undefined if not changing
                    role: editUserRole
                }),
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error)

            setEditingUser(null)
            fetchData()
            alert('Cadastro atualizado com sucesso!')
        } catch (err: any) {
            alert(err.message || 'Erro ao atualizar usuário')
        } finally {
            setEditUserLoading(false)
        }
    }

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault()
        setProjectLoading(true)
        try {
            const res = await fetch('/api/admin/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    client_id: newProjectClientId,
                    name: newProjectName,
                    description: newProjectDesc,
                    preview_url: newProjectUrl
                }),
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error)

            setShowNewProject(false)
            setNewProjectClientId('')
            setNewProjectName('')
            setNewProjectDesc('')
            setNewProjectUrl('')
            setActiveTab('projects') // switch to projects view
            fetchData()
        } catch (err: any) {
            alert(err.message || 'Erro ao criar projeto')
        } finally {
            setProjectLoading(false)
        }
    }

    if (loading && projects.length === 0) {
        return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>
    }

    // KPI Calculations
    const totalProjects = projects.length
    const totalClients = users.filter((u: PortalUser) => u.role === 'client').length
    const completedProjects = projects.filter((p: Project) => p.current_stage === 6).length
    const activeProjects = totalProjects - completedProjects

    return (
        <div className="min-h-screen bg-background pb-20">
            <header className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Image src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo-Nordex-Tech-remove-WSehNqsem3EZQ2jxpk0CKTKMU1hLtG.png" alt="Nordex" width={120} height={40} className="h-8 w-auto" />
                        <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded border border-primary/20">ADMIN PANEL</span>
                    </div>
                    <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive">
                        <LogOut size={16} /> Sair
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div className="space-x-4 border-b border-border w-full sm:w-auto flex flex-nowrap overflow-x-auto pb-1 no-scrollbar">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`pb-2 px-1 font-semibold transition-colors whitespace-nowrap ${activeTab === 'overview' ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            <span className="flex items-center gap-2"><LayoutDashboard size={16} /> Visão Geral</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('projects')}
                            className={`pb-2 px-1 font-semibold transition-colors whitespace-nowrap ${activeTab === 'projects' ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            <span className="flex items-center gap-2"><FolderKanban size={16} /> Projetos Ativos</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`pb-2 px-1 font-semibold transition-colors whitespace-nowrap ${activeTab === 'users' ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            <span className="flex items-center gap-2"><Users size={16} /> Usuários</span>
                        </button>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button onClick={fetchData} className="p-2 border border-border rounded-md text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors" title="Atualizar dados">
                            <RefreshCw size={18} />
                        </button>
                    </div>
                </div>

                {activeTab === 'overview' && (
                    <div className="space-y-8 animate-fade-in">
                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-card border border-border rounded-xl p-6 flex flex-col justify-center items-start relative overflow-hidden group">
                                <div className="absolute right-0 top-0 opacity-5 w-32 h-32 -translate-y-8 translate-x-8 transition-transform"><FolderKanban size={128} className="animate-pulse" style={{ animationDuration: '4s' }} /></div>
                                <p className="text-sm font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Total Projetos</p>
                                <p className="text-4xl font-bold text-foreground">{totalProjects}</p>
                            </div>
                            <div className="bg-card border border-border rounded-xl p-6 flex flex-col justify-center items-start relative overflow-hidden group">
                                <div className="absolute right-0 top-0 opacity-5 w-32 h-32 -translate-y-8 translate-x-8 transition-transform"><Users size={128} className="animate-bounce" style={{ animationDuration: '5s' }} /></div>
                                <p className="text-sm font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Total Usuários</p>
                                <p className="text-4xl font-bold text-foreground">{totalClients}</p>
                            </div>
                            <div className="bg-card border border-border rounded-xl p-6 flex flex-col justify-center items-start relative overflow-hidden group">
                                <div className="absolute right-0 top-0 opacity-5 w-32 h-32 -translate-y-8 translate-x-8 transition-transform"><RefreshCw size={128} className="animate-spin" style={{ animationDuration: '10s' }} /></div>
                                <p className="text-sm font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Em Andamento</p>
                                <p className="text-4xl font-bold text-primary">{activeProjects}</p>
                            </div>
                            <div className="bg-card border border-border rounded-xl p-6 flex flex-col justify-center items-start relative overflow-hidden group">
                                <div className="absolute right-0 top-0 opacity-5 w-32 h-32 -translate-y-8 translate-x-8 transition-transform"><CheckCircle2 size={128} className="animate-pulse" style={{ animationDuration: '3s' }} /></div>
                                <p className="text-sm font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Concluídos</p>
                                <p className="text-4xl font-bold text-green-500">{completedProjects}</p>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
                                <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><Clock size={20} className="text-primary" /> Projetos Movimentados Recentemente</h3>

                                {projects.length === 0 ? (
                                    <p className="text-muted-foreground text-sm">Nenhuma atividade recente.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {projects.slice(0, 5).map((proj: Project) => (
                                            <div key={proj.id} className="flex justify-between items-center p-4 border border-border/50 rounded-lg bg-background hover:border-primary/50 transition-colors">
                                                <div>
                                                    <h4 className="font-semibold text-foreground">{proj.name}</h4>
                                                    <p className="text-xs text-muted-foreground mt-1">{proj.client_name}</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded">
                                                        Etapa {proj.current_stage}/6
                                                    </span>
                                                    <p className="text-xs text-muted-foreground mt-2">Atualizado há pouco</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="bg-card border border-border rounded-xl p-6">
                                <h3 className="text-lg font-bold mb-6">Mesa de Operações</h3>
                                <div className="space-y-3">
                                    <button onClick={() => setShowNewProject(true)} className="w-full flex items-center justify-between p-4 border border-border rounded-lg bg-background hover:bg-secondary/50 group transition-all text-left">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-primary/10 rounded text-primary group-hover:scale-110 transition-transform"><FolderKanban size={18} /></div>
                                            <div>
                                                <p className="font-semibold text-sm">Adicionar Projeto</p>
                                                <p className="text-xs text-muted-foreground">Coloque algo na esteira</p>
                                            </div>
                                        </div>
                                    </button>
                                    <button onClick={() => setShowNewClient(true)} className="w-full flex items-center justify-between p-4 border border-border rounded-lg bg-background hover:bg-secondary/50 group transition-all text-left">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-primary/10 rounded text-primary group-hover:scale-110 transition-transform"><Users size={18} /></div>
                                            <div>
                                                <p className="font-semibold text-sm">Adicionar Usuário</p>
                                                <p className="text-xs text-muted-foreground">Cadastre novos acessos</p>
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'projects' && (
                    <>
                        {projects.length === 0 ? (
                            <div className="text-center py-20 bg-card border border-border rounded-xl">
                                <p className="text-muted-foreground mb-4">Nenhum projeto rodando ainda.</p>
                                <button onClick={() => setShowNewProject(true)} className="text-primary hover:underline font-medium">Comece criando um projeto</button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {projects.map(proj => (
                                    <div key={proj.id} className="bg-card border border-border rounded-xl p-6 relative overflow-hidden flex flex-col">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="font-bold text-lg">{proj.name}</h3>
                                                <p className="text-xs text-muted-foreground">{proj.client_name} ({proj.client_email})</p>
                                            </div>
                                            <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-bold whitespace-nowrap">ETAPA {proj.current_stage}/6</span>
                                        </div>

                                        {proj.preview_url && (
                                            <a href={proj.preview_url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline mb-3 line-clamp-1">
                                                🔗 {proj.preview_url}
                                            </a>
                                        )}

                                        <p className="text-sm text-muted-foreground mb-6 line-clamp-3 flex-1">{proj.description}</p>

                                        <div className="border-t border-border pt-4 mt-auto">
                                            {isUpdating === proj.id ? (
                                                <form onSubmit={(e) => handlePostUpdate(e, proj.id)} className="space-y-3 animate-fade-in bg-background p-3 rounded-lg border border-border">
                                                    <h4 className="text-sm font-semibold mb-2 text-foreground">Avançar esteira</h4>
                                                    <select
                                                        value={updateStage}
                                                        onChange={e => setUpdateStage(Number(e.target.value))}
                                                        className="w-full bg-card border border-border rounded p-2 text-sm text-foreground focus:ring-1 focus:ring-primary"
                                                    >
                                                        {STAGES.map(s => <option key={s.id} value={s.id}>Et. {s.id}: {s.label}</option>)}
                                                    </select>
                                                    <input
                                                        type="text" placeholder="Título (ex: Design Aprovado)" required
                                                        value={updateTitle} onChange={e => setUpdateTitle(e.target.value)}
                                                        className="w-full bg-card border border-border rounded p-2 text-sm text-foreground focus:ring-1 focus:ring-primary"
                                                    />
                                                    <textarea
                                                        placeholder="Mensagem (opcional, o cliente verá)" rows={2}
                                                        value={updateMessage} onChange={e => setUpdateMessage(e.target.value)}
                                                        className="w-full bg-card border border-border rounded p-2 text-sm resize-none text-foreground focus:ring-1 focus:ring-primary"
                                                    />
                                                    <div className="flex gap-2 pt-1">
                                                        <button type="button" onClick={() => setIsUpdating(null)} className="flex-1 border border-border text-muted-foreground hover:text-foreground hover:bg-secondary p-2 rounded text-sm transition-colors">Cancelar</button>
                                                        <button type="submit" className="flex-1 bg-primary text-primary-foreground p-2 rounded text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors">
                                                            <Send size={14} /> Atualizar
                                                        </button>
                                                    </div>
                                                </form>
                                            ) : (
                                                <button
                                                    onClick={() => { setIsUpdating(proj.id); setUpdateStage(proj.current_stage); }}
                                                    className="w-full flex items-center justify-center gap-2 border border-primary/50 text-primary hover:bg-primary/10 rounded-md py-2 transition-colors text-sm font-medium"
                                                >
                                                    <Plus size={16} /> Nova Atualização p/ Usuário
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'users' && (
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm overflow-x-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold">Usuários Cadastrados</h3>
                            <span className="bg-secondary text-muted-foreground text-xs font-mono px-2 py-1 rounded">{users.length} totais</span>
                        </div>

                        {users.length === 0 ? (
                            <div className="text-center py-10">
                                <p className="text-muted-foreground mb-4">Ainda não há usuários no sistema.</p>
                                <button onClick={() => setShowNewClient(true)} className="text-primary hover:underline font-medium">Cadastrar o primeiro usuário</button>
                            </div>
                        ) : (
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-muted-foreground border-b border-border uppercase bg-secondary/30">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">Nome</th>
                                        <th className="px-4 py-3 font-semibold">Email (Login)</th>
                                        <th className="px-4 py-3 font-semibold">Permissão</th>
                                        <th className="px-4 py-3 font-semibold">Data Cadastro</th>
                                        <th className="px-4 py-3 font-semibold text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    {users.map((u: PortalUser) => (
                                        <tr key={u.id} className="hover:bg-secondary/20 transition-colors">
                                            <td className="px-4 py-4 font-medium">{u.name}</td>
                                            <td className="px-4 py-4 text-muted-foreground">{u.email}</td>
                                            <td className="px-4 py-4">
                                                <span className={`px-2 py-1 rounded text-xs font-semibold ${u.role === 'admin' ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                                                    {u.role === 'admin' ? 'Administrador' : 'Usuário'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-muted-foreground">{new Date(u.created_at).toLocaleDateString('pt-BR')}</td>
                                            <td className="px-4 py-4 text-right">
                                                <button onClick={() => openEditUserModal(u)} className="text-muted-foreground hover:text-primary transition-colors p-2" title="Editar Usuário">
                                                    <Edit size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </main>

            {/* MODAL: Novo Cliente */}
            {showNewClient && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
                        <div className="flex justify-between items-center p-4 border-b border-border bg-secondary/30">
                            <h3 className="font-bold">Cadastrar Novo Usuário</h3>
                            <button onClick={() => setShowNewClient(false)} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleCreateClient} className="p-6 space-y-4">
                            <p className="text-sm text-muted-foreground mb-4">
                                O usuário usará o e-mail e senha abaixo para fazer login e ver seu próprio projeto.
                            </p>
                            <div>
                                <label className="block text-sm font-medium mb-1">Nome Completo / Usuário</label>
                                <input required value={newClientName} onChange={e => setNewClientName(e.target.value)} type="text" className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="Ex: Acme Corp" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">E-mail de Login</label>
                                <input required value={newClientEmail} onChange={e => setNewClientEmail(e.target.value)} type="email" className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="cliente@empresa.com" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Tipo de Acesso</label>
                                <select value={newClientRole} onChange={e => setNewClientRole(e.target.value)} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none mb-4">
                                    <option value="client">Usuário</option>
                                    <option value="admin">Administrador da Plataforma</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Senha de Acesso</label>
                                <input required value={newClientPassword} onChange={e => setNewClientPassword(e.target.value)} type="text" className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none font-mono" placeholder="Defina uma senha segura" />
                                <p className="text-xs text-muted-foreground mt-1">Copie a senha para enviar ao usuário depois.</p>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setShowNewClient(false)} className="flex-1 border border-border hover:bg-secondary py-2 rounded-md font-medium transition-colors">Cancelar</button>
                                <button type="submit" disabled={clientLoading} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 py-2 rounded-md font-semibold transition-colors flex justify-center items-center">
                                    {clientLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Criar Usuário'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: Novo Projeto */}
            {showNewProject && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in">
                        <div className="flex justify-between items-center p-4 border-b border-border bg-secondary/30">
                            <h3 className="font-bold">Criar Novo Projeto na Esteira</h3>
                            <button onClick={() => setShowNewProject(false)} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleCreateProject} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Usuário Responsável pelo Projeto</label>
                                <select required value={newProjectClientId} onChange={e => setNewProjectClientId(e.target.value)} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none text-foreground">
                                    <option value="" disabled>Selecione um usuário...</option>
                                    {users.filter((u: PortalUser) => u.role === 'client').map((u: PortalUser) => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
                                </select>
                                {users.filter((u: PortalUser) => u.role === 'client').length === 0 && <p className="text-xs text-destructive mt-1">Nenhum usuário cadastrado. Crie um usuário primeiro.</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Nome do Projeto</label>
                                <input required value={newProjectName} onChange={e => setNewProjectName(e.target.value)} type="text" className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="Ex: E-commerce Acme" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Descrição Breve (Opcional)</label>
                                <textarea value={newProjectDesc} onChange={e => setNewProjectDesc(e.target.value)} rows={2} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none" placeholder="Sobre o que é este projeto..." />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                                    Link de Teste / Preview (Opcional)
                                </label>
                                <input value={newProjectUrl} onChange={e => setNewProjectUrl(e.target.value)} type="url" className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="https://..." />
                                <p className="text-xs text-muted-foreground mt-1">O cliente verá um botão para acessar esse link.</p>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setShowNewProject(false)} className="flex-1 border border-border hover:bg-secondary py-2 rounded-md font-medium transition-colors">Cancelar</button>
                                <button type="submit" disabled={projectLoading || users.length === 0} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 py-2 rounded-md font-semibold transition-colors flex justify-center items-center disabled:opacity-50">
                                    {projectLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Começar Projeto'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: Editar Usuário */}
            {editingUser && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
                        <div className="flex justify-between items-center p-4 border-b border-border bg-secondary/30">
                            <h3 className="font-bold">Editar Cadastro: {editingUser.name}</h3>
                            <button onClick={() => setEditingUser(null)} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleEditUser} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Nome</label>
                                <input required value={editUserName} onChange={e => setEditUserName(e.target.value)} type="text" className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">E-mail (Login)</label>
                                <input required value={editUserEmail} onChange={e => setEditUserEmail(e.target.value)} type="email" className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Tipo de Acesso</label>
                                <select value={editUserRole} onChange={e => setEditUserRole(e.target.value)} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none mb-4">
                                    <option value="client">Usuário</option>
                                    <option value="admin">Administrador da Plataforma</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 flex justify-between">
                                    <span>Nova Senha</span>
                                    <span className="text-xs text-muted-foreground font-normal">Opcional</span>
                                </label>
                                <input value={editUserPassword} onChange={e => setEditUserPassword(e.target.value)} type="text" className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none font-mono" placeholder="Deixe em branco para não alterar" />
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setEditingUser(null)} className="flex-1 border border-border hover:bg-secondary py-2 rounded-md font-medium transition-colors">Cancelar</button>
                                <button type="submit" disabled={editUserLoading} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 py-2 rounded-md font-semibold transition-colors flex justify-center items-center">
                                    {editUserLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Salvar Alteraçoes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
