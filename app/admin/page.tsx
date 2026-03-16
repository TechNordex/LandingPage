/**
 * Admin Panel - Ultimate Tier Design + Deep Linking Integration + Per-Update Notes
 */
'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { LogOut, Plus, Activity, Send, Loader2, X, Edit, Users, FolderKanban, CheckCircle2, Clock, MessageSquareText, FileEdit, Link as LinkIcon, ChevronDown, ChevronUp, ThumbsUp, ThumbsDown, AlertCircle, Trash2, Search, SlidersHorizontal, Briefcase, FileDown, Upload } from 'lucide-react'
import type { Project, PortalUser, ProjectUpdate } from '@/lib/types'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, BarChart, Bar } from 'recharts'
import { STAGES } from '@/lib/types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import ImageCropperModal from '@/components/common/ImageCropper'

export default function AdminPage() {
    const router = useRouter()
    const [projects, setProjects] = useState<Project[]>([])
    const [users, setUsers] = useState<PortalUser[]>([])
    const [loading, setLoading] = useState(true)

    const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'users' | 'trash' | 'team' | 'reports'>('overview')
    const [trashProjects, setTrashProjects] = useState<Project[]>([])
    const [teamStats, setTeamStats] = useState<{ workload: any[], recentContributions: any[] }>({ workload: [], recentContributions: [] })
    const [editingTeamMember, setEditingTeamMember] = useState<PortalUser | null>(null)
    const [assigningProject, setAssigningProject] = useState<Project | null>(null)
    const [projectAssignments, setProjectAssignments] = useState<any[]>([])
    const [reportData, setReportData] = useState<any>(null)
    const [reportProjectId, setReportProjectId] = useState<string>('all')
    const [reportStartDate, setReportStartDate] = useState<string>(format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd'))
    const [reportEndDate, setReportEndDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'))
    const [isUpdating, setIsUpdating] = useState<string | null>(null) // project id
    const [currentUser, setCurrentUser] = useState<PortalUser | null>(null)
    const [uploadLoading, setUploadLoading] = useState(false)
    const [showAddTeamMember, setShowAddTeamMember] = useState(false)
    
    // Image Cropper States
    const [showCropper, setShowCropper] = useState(false)
    const [cropperTarget, setCropperTarget] = useState<'team' | 'project' | null>(null)
    const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null)
    const [expandedClientId, setExpandedClientId] = useState<string | null>(null)
    const [projectSearch, setProjectSearch] = useState('')
    const [projectFilter, setProjectFilter] = useState<'all' | 'alerts' | 'active' | 'done'>('all')

    // Modals
    const [showNewClient, setShowNewClient] = useState(false)
    const [showNewProject, setShowNewProject] = useState(false)
    const [editingUser, setEditingUser] = useState<PortalUser | null>(null)

    // Project Editor Modal
    const [editingProject, setEditingProject] = useState<Project | null>(null)
    const [editProjectName, setEditProjectName] = useState('')
    const [editProjectDesc, setEditProjectDesc] = useState('')
    const [editProjectUrl, setEditProjectUrl] = useState('')
    const [editProjectStageUrl, setEditProjectStageUrl] = useState('')
    const [editProjectProdUrl, setEditProjectProdUrl] = useState('')
    const [editProjectLoading, setEditProjectLoading] = useState(false)
    const [editProjectHours, setEditProjectHours] = useState<string>('')

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

    // Delete user state
    const [deletingUser, setDeletingUser] = useState<PortalUser | null>(null)
    const [deleteWarning, setDeleteWarning] = useState<{ message: string; projects: { id: string; name: string }[] } | null>(null)
    const [deleteLoading, setDeleteLoading] = useState(false)

    // Delete project state
    const [deletingProject, setDeletingProject] = useState<Project | null>(null)
    const [permanentDelete, setPermanentDelete] = useState(false)

    const [newProjectName, setNewProjectName] = useState('')
    const [newProjectClientId, setNewProjectClientId] = useState('')
    const [newProjectDesc, setNewProjectDesc] = useState('')
    const [newProjectUrl, setNewProjectUrl] = useState('')
    const [newProjectStageUrl, setNewProjectStageUrl] = useState('')
    const [newProjectProdUrl, setNewProjectProdUrl] = useState('')
    const [newProjectHours, setNewProjectHours] = useState<string>('')
    const [projectLoading, setProjectLoading] = useState(false)

    const [updateStage, setUpdateStage] = useState(1)
    const [updateTitle, setUpdateTitle] = useState('')
    const [updateMessage, setUpdateMessage] = useState('')
    const [updatePreviewUrl, setUpdatePreviewUrl] = useState('')
    const [updateHours, setUpdateHours] = useState<string>('')
    const [lastUpdateStage, setLastUpdateStage] = useState<number | null>(null)

    const filteredGroups = useMemo(() => {
        // --- Derived Data ---
        const clientMap = new Map<string, { client: PortalUser | null; clientName: string; clientEmail: string; projects: Project[] }>();
        projects.forEach(proj => {
            const key = proj.client_id;
            if (!clientMap.has(key)) {
                const user = users.find(u => u.id === key) || null;
                clientMap.set(key, { client: user, clientName: proj.client_name || 'Cliente Desconhecido', clientEmail: proj.client_email || '', projects: [] });
            }
            clientMap.get(key)!.projects.push(proj);
        });

        // Sort: clients with alerts first, then by most recently updated project
        const clientGroups = Array.from(clientMap.values()).sort((a, b) => {
            const aAlert = a.projects.some(p => p.preview_status === 'rejected') ? 2 : a.projects.some(p => p.preview_status === 'pending') ? 1 : 0;
            const bAlert = b.projects.some(p => p.preview_status === 'rejected') ? 2 : b.projects.some(p => p.preview_status === 'pending') ? 1 : 0;
            if (bAlert !== aAlert) return bAlert - aAlert;
            const aLatest = Math.max(...a.projects.map(p => new Date(p.updated_at).getTime()));
            const bLatest = Math.max(...b.projects.map(p => new Date(p.updated_at).getTime()));
            return bLatest - aLatest;
        });

        // Filter by search + status
        return clientGroups.map(g => ({
            ...g,
            projects: g.projects.filter(p => {
                const searchMatch = !projectSearch ||
                    p.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
                    g.clientName.toLowerCase().includes(projectSearch.toLowerCase());
                const filterMatch =
                    projectFilter === 'all' ? true :
                    projectFilter === 'alerts' ? (p.preview_status === 'rejected' || p.preview_status === 'pending') :
                    projectFilter === 'active' ? p.current_stage < 6 :
                    p.current_stage === 6;
                return searchMatch && filterMatch;
            })
        })).filter(g => g.projects.length > 0);
    }, [projects, users, projectSearch, projectFilter]);

    const filteredReportProjects = useMemo(() => {
        return projects.filter(p => {
            if (reportProjectId !== 'all' && p.id !== reportProjectId) return false;
            const projectDate = new Date(p.created_at);
            const start = new Date(reportStartDate);
            const end = new Date(reportEndDate);
            end.setHours(23, 59, 59, 999);
            return projectDate >= start && projectDate <= end;
        });
    }, [projects, reportProjectId, reportStartDate, reportEndDate]);

    const projectSpecificStats = useMemo(() => {
        if (reportProjectId === 'all') return null;
        const project = projects.find(p => p.id === reportProjectId);
        if (!project) return null;

        const updates = project.updates || [];
        const totalUpdates = updates.length;
        const approvedUpdates = updates.filter(u => u.status === 'authorized').length;
        const deniedUpdates = updates.filter(u => u.status === 'denied').length;
        
        const totalHours = updates.reduce((acc, u) => acc + (u.hours_spent || 0), 0);
        const rejectionCount = deniedUpdates + (project.preview_status === 'rejected' ? 1 : 0);
        
        let leadTime = "Em andamento";
        if (project.current_stage === 6 && updates.length > 0) {
            const firstUpdate = new Date(project.created_at);
            const lastUpdateArr = [...updates].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            const lastUpdate = new Date(lastUpdateArr[0].created_at);
            const diffDays = Math.ceil((lastUpdate.getTime() - firstUpdate.getTime()) / (1000 * 60 * 60 * 24));
            leadTime = `${diffDays} dias`;
        }

        return {
            totalUpdates,
            approvedUpdates,
            deniedUpdates,
            approvalRate: totalUpdates > 0 ? Math.round((approvedUpdates / totalUpdates) * 100) : 0,
            leadTime,
            totalHours,
            rejectionCount,
            estimatedHours: project.estimated_hours || 0
        };
    }, [projects, reportProjectId]);

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const responses = await Promise.all([
                fetch('/api/admin/projects'),
                fetch('/api/admin/users'),
                fetch('/api/admin/projects?trash=true'),
                fetch('/api/admin/team'),
                fetch('/api/admin/assignments'),
                fetch('/api/admin/reports'),
                fetch('/api/auth/me')
            ])
            
            const [resProj, resUsers, resTrash, resTeam, resAssignments, resReport, resMe] = responses;

            if (resProj.status === 403 || resUsers.status === 403 || resProj.status === 401 || resUsers.status === 401) {
                router.push('/login')
                return
            }

            // Parse all OK responses once
            const dataProj = resProj.ok ? await resProj.json() : null;
            const dataUsers = resUsers.ok ? await resUsers.json() : null;
            const dataTrash = resTrash.ok ? await resTrash.json() : null;
            const dataTeam = resTeam.ok ? await resTeam.json() : null;
            const dataAssignments = resAssignments.ok ? await resAssignments.json() : null;
            const dataReport = resReport.ok ? await resReport.json() : null;
            const dataMe = resMe.ok ? await resMe.json() : null;

            if (dataReport) setReportData(dataReport)
            if (dataMe) setCurrentUser(dataMe.user)

            if (dataProj) {
                const sortedProjects = dataProj.projects.sort((a: Project, b: Project) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
                setProjects(sortedProjects)
            }
            if (dataUsers) setUsers(dataUsers.users)
            if (dataTrash) setTrashProjects(dataTrash.projects)
            if (dataTeam) setTeamStats(dataTeam)
            if (dataAssignments) setProjectAssignments(dataAssignments.assignments)
        } catch (error) {
            console.error("Error fetching data:", error);
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
                    preview_url: updatePreviewUrl || undefined,
                    hours_spent: updateHours ? Number(updateHours) : undefined
                 }),
            })
            if (!res.ok) throw new Error()
            setIsUpdating(null)
            setUpdateTitle('')
            setUpdateMessage('')
            setUpdatePreviewUrl('')
            setUpdateHours('')
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
        } catch (err) { alert('Erro ao editar') } finally { setEditUserLoading(false) }
    }

    const handleDeleteUser = async (force = false) => {
        if (!deletingUser) return
        setDeleteLoading(true)
        try {
            const res = await fetch('/api/admin/users', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: deletingUser.id, force })
            })
            const data = await res.json()
            if (res.status === 409 && data.warning) {
                // Show project warning — require force confirm
                setDeleteWarning({ message: data.message, projects: data.projects })
            } else if (!res.ok) {
                alert(data.error || 'Erro ao excluir usuário')
                setDeletingUser(null); setDeleteWarning(null)
            } else {
                setDeletingUser(null); setDeleteWarning(null); fetchData()
            }
        } catch { alert('Erro de conexão') } finally { setDeleteLoading(false) }
    }

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault(); setProjectLoading(true)
        try {
            const res = await fetch('/api/admin/projects', { method: 'POST', body: JSON.stringify({ 
                client_id: newProjectClientId, 
                name: newProjectName, 
                description: newProjectDesc, 
                preview_url: newProjectUrl, 
                stage_url: newProjectStageUrl,
                prod_url: newProjectProdUrl,
                estimated_hours: newProjectHours ? Number(newProjectHours) : undefined 
            }) })
            if (!res.ok) throw new Error()
            setShowNewProject(false); setActiveTab('projects'); fetchData()
            setNewProjectName(''); setNewProjectClientId(''); setNewProjectDesc(''); setNewProjectUrl(''); setNewProjectStageUrl(''); setNewProjectProdUrl(''); setNewProjectHours('')
        } catch (err) { alert('Erro criar proj') } finally { setProjectLoading(false) }
    }

    const openEditProjectModal = (proj: Project) => {
        setEditingProject(proj); 
        setEditProjectName(proj.name); 
        setEditProjectDesc(proj.description || ''); 
        setEditProjectUrl(proj.preview_url || '');
        setEditProjectStageUrl(proj.stage_url || '');
        setEditProjectProdUrl(proj.prod_url || '');
        setEditProjectHours(proj.estimated_hours?.toString() || '');
    }

    const handleEditProject = async (e: React.FormEvent) => {
        e.preventDefault(); if (!editingProject) return; setEditProjectLoading(true)
        try {
            const res = await fetch('/api/admin/projects', { method: 'PUT', body: JSON.stringify({ 
                id: editingProject.id, 
                name: editProjectName, 
                description: editProjectDesc, 
                preview_url: editProjectUrl, 
                stage_url: editProjectStageUrl,
                prod_url: editProjectProdUrl,
                estimated_hours: editProjectHours ? Number(editProjectHours) : undefined 
            }) })
            if (!res.ok) throw new Error()
            setEditingProject(null); fetchData()
        } catch (err) { alert('Erro ao atualizar proojeto') } finally { setEditProjectLoading(false) }
    }

    const handleDeleteProject = async (proj: Project, permanent = false) => {
        setDeleteLoading(true)
        try {
            const res = await fetch(`/api/admin/projects?id=${proj.id}${permanent ? '&permanent=true' : ''}`, {
                method: 'DELETE'
            })
            if (!res.ok) throw new Error()
            setDeletingProject(null)
            fetchData()
        } catch (err) {
            alert('Erro ao excluir projeto')
        } finally {
            setDeleteLoading(false)
        }
    }

    const handleRestoreProject = async (projectId: string) => {
        setDeleteLoading(true)
        try {
            const res = await fetch('/api/admin/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'restore', id: projectId })
            })
            if (!res.ok) throw new Error()
            fetchData()
        } catch (err) {
            alert('Erro ao restaurar projeto')
        } finally {
            setDeleteLoading(false)
        }
    }

    const [editTeamPosition, setEditTeamPosition] = useState('')
    const [editTeamAvatar, setEditTeamAvatar] = useState('')
    const [editTeamBio, setEditTeamBio] = useState('')
    const [editTeamLoading, setEditTeamLoading] = useState(false)

    useEffect(() => {
        if (editingTeamMember) {
            setEditTeamPosition(editingTeamMember.position || '')
            setEditTeamAvatar(editingTeamMember.avatar_url || '')
            setEditTeamBio(editingTeamMember.bio || '')
        }
    }, [editingTeamMember])

    const handleEditTeamMember = async (e: React.FormEvent) => {
        e.preventDefault(); if (!editingTeamMember) return; setEditTeamLoading(true)
        try {
            const res = await fetch('/api/admin/users', { 
                method: 'PUT', 
                body: JSON.stringify({ 
                    id: editingTeamMember.id, 
                    name: editingTeamMember.name, 
                    email: editingTeamMember.email, 
                    role: editingTeamMember.role,
                    position: editTeamPosition, 
                    avatar_url: editTeamAvatar, 
                    bio: editTeamBio 
                }) 
            })
            if (!res.ok) throw new Error()
            setEditingTeamMember(null); fetchData()
        } catch (err) { alert('Erro ao atualizar membro da equipe') } finally { setEditTeamLoading(false) }
    }

    const handleAssignTeam = async (projectId: string, userId: string) => {
        try {
            const res = await fetch('/api/admin/assignments', { method: 'POST', body: JSON.stringify({ project_id: projectId, user_id: userId }) })
            if (res.ok) {
                setAssigningProject(null); fetchData()
            }
        } catch (err) { alert('Erro ao atribuir membro') }
    }

    const handleRemoveAssignment = async (projectId: string, userId: string) => {
        try {
            const res = await fetch(`/api/admin/assignments?projectId=${projectId}&userId=${userId}`, { method: 'DELETE' })
            if (res.ok) fetchData()
        } catch (err) { alert('Erro ao remover atribuição') }
    }

    const handleFileUploadClick = (e: React.MouseEvent, target: 'team' | 'project') => {
        // We open the cropper instead of raw file upload.
        // Prevent default click if attached to something else, though usually button handles it.
        setCropperTarget(target)
        setShowCropper(true)
    }

    const handleCropComplete = async (fileBlob: Blob, previewUrl: string) => {
        setUploadLoading(true)
        const formData = new FormData()
        // Adding extension .jpg to blob
        formData.append('file', fileBlob, 'cropped-upload.jpg')

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            })
            if (!res.ok) throw new Error()
            const { url } = await res.json()
            if (cropperTarget === 'team') {
                setEditTeamAvatar(url)
            } else {
                setEditProjectUrl(url)
            }
        } catch (err) {
            alert('Erro ao enviar imagem')
        } finally {
            setUploadLoading(false)
            setCropperTarget(null)
            setShowCropper(false)
        }
    }

    const handlePromoteUser = async (user: PortalUser) => {
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    id: user.id, 
                    role: 'admin', 
                    name: user.name, 
                    email: user.email,
                    position: user.position || 'Especialista'
                })
            })
            if (!res.ok) throw new Error()
            setShowAddTeamMember(false)
            fetchData()
        } catch (err) {
            alert('Erro ao promover usuário')
        }
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
                        <Image 
                            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo-Nordex-Tech-remove-WSehNqsem3EZQ2jxpk0CKTKMU1hLtG.png" 
                            alt="Nordex" 
                            width={160} 
                            height={44} 
                            className="h-8 sm:h-9 w-auto opacity-100" 
                            priority
                        />
                        <div className="h-6 w-px bg-border hidden sm:block mx-1" />
                        <span className="bg-primary/10 text-primary text-[11px] font-bold px-2 py-0.5 border border-primary/20 uppercase tracking-widest rounded-sm">ADMIN PANEL</span>
                    </div>
                    <div className="flex items-center gap-6">
                        {currentUser && (
                            <div className="flex items-center gap-3 pr-4 border-r border-border h-10">
                                <div className="text-right hidden sm:block">
                                    <p className="text-[13px] font-bold text-foreground leading-none">{currentUser.name}</p>
                                    <p className="text-[10px] text-primary font-bold uppercase tracking-tighter">{currentUser.position || 'Administrador'}</p>
                                </div>
                                <div className="w-9 h-9 rounded-full bg-secondary border border-border overflow-hidden shrink-0 aspect-square">
                                    {currentUser?.avatar_url ? (
                                        <img src={currentUser.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-primary/50 text-[10px] font-bold">
                                            {currentUser?.name?.charAt(0) || 'A'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        <button onClick={handleLogout} className="flex flex-col text-right hover:text-primary transition-colors group">
                            <span className="text-[13px] font-medium leading-none flex items-center gap-2 group-hover:gap-3 transition-all">Desconectar <LogOut size={14} /></span>
                            <span className="text-[10px] text-muted-foreground mr-5">Fim de Sessão</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Custom Elegant Tab System */}
                <div className="flex items-center justify-center mb-10 pb-4 border-b border-border/30">
                    <div className="inline-flex items-center bg-card/40 backdrop-blur-md border border-border/50 rounded-xl p-1.5 shadow-2xl">
                        <button 
                            onClick={() => setActiveTab('overview')} 
                            className={`px-6 py-2.5 rounded-lg text-[13px] font-bold tracking-wide transition-all duration-300 ${activeTab === 'overview' ? 'bg-primary text-primary-foreground shadow-[0_0_20px_rgba(245,168,0,0.3)]' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'}`}
                        >
                            Visão Geral
                        </button>
                        <button 
                            onClick={() => setActiveTab('projects')} 
                            className={`px-6 py-2.5 rounded-lg text-[13px] font-bold tracking-wide transition-all duration-300 ${activeTab === 'projects' ? 'bg-primary text-primary-foreground shadow-[0_0_20px_rgba(245,168,0,0.3)]' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'}`}
                        >
                            Esteiras & Diários
                        </button>
                        <button 
                            onClick={() => setActiveTab('users')} 
                            className={`px-6 py-2.5 rounded-lg text-[13px] font-bold tracking-wide transition-all duration-300 ${activeTab === 'users' ? 'bg-primary text-primary-foreground shadow-[0_0_20px_rgba(245,168,0,0.3)]' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'}`}
                        >
                            Painel de Usuários
                        </button>
                        <button 
                            onClick={() => setActiveTab('team')} 
                            className={`px-6 py-2.5 rounded-lg text-[13px] font-bold tracking-wide transition-all duration-300 ${activeTab === 'team' ? 'bg-primary text-primary-foreground shadow-[0_0_20px_rgba(245,168,0,0.3)]' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'}`}
                        >
                            Gestão de Equipe
                        </button>
                        <button 
                            onClick={() => setActiveTab('reports')} 
                            className={`px-6 py-2.5 rounded-lg text-[13px] font-bold tracking-wide transition-all duration-300 ${activeTab === 'reports' ? 'bg-primary text-primary-foreground shadow-[0_0_20px_rgba(245,168,0,0.3)]' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'}`}
                        >
                            Relatórios
                        </button>
                        <button 
                            onClick={() => setActiveTab('trash')} 
                            className={`px-6 py-2.5 rounded-lg text-[13px] font-bold tracking-wide transition-all duration-300 ${activeTab === 'trash' ? 'bg-primary text-primary-foreground shadow-[0_0_20px_rgba(245,168,0,0.3)]' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'}`}
                        >
                            Lixeira {trashProjects.length > 0 && <span className="ml-1 px-1.5 py-0.5 bg-background/20 rounded-full text-[10px]">{trashProjects.length}</span>}
                        </button>
                    </div>
                </div>

                {activeTab === 'overview' && (
                    <div className="space-y-8 animate-fade-in">
                        {/* KPI Cards (Matches global dark style) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                            {[
                                { lab: 'Projetos Ativos', val: totalProjects, sub: `${trashProjects.length} na lixeira`, icon: <FolderKanban size={100} />, col: 'primary' },
                                { lab: 'Pool de Clientes', val: totalClients, sub: 'Clientes cadastrados', icon: <Users size={100} />, col: 'primary' },
                                { lab: 'Pipeline Ativa', val: activeProjects, sub: 'Em desenvolvimento', icon: <Activity size={100} />, col: 'blue-500' },
                                { lab: 'Concluídos', val: completedProjects, sub: 'Total finalizado', icon: <CheckCircle2 size={100} />, col: 'green-500' },
                            ].map((kpi, i) => (
                                <div key={i} className="bg-card border border-border rounded-2xl p-6 relative overflow-hidden group">
                                    <div className="absolute right-0 top-0 opacity-[0.02] -translate-y-4 translate-x-4 max-w-[80px] pointer-events-none">{kpi.icon}</div>
                                    <div className="relative z-10">
                                        <p className="text-[12px] font-semibold text-muted-foreground mb-1 tracking-wider uppercase">{kpi.lab}</p>
                                        <div className="flex items-baseline gap-2 mb-4">
                                            <p className={`text-4xl font-bold tracking-tighter ${kpi.col === 'primary' ? 'text-primary' : kpi.col === 'green-500' ? 'text-green-500' : 'text-blue-500'}`}>
                                                {kpi.val}
                                            </p>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground/60 font-medium uppercase tracking-widest">{kpi.sub}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Alert System Center */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="bg-card border border-border rounded-2xl overflow-hidden p-[1px]">
                                    <div className="bg-background rounded-2xl p-6 sm:p-8">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                                            <h3 className="text-[18px] font-semibold tracking-tight text-foreground flex items-center gap-3">
                                                <AlertCircle size={20} className="text-primary"/> Centro de Resposta e Alertas
                                            </h3>
                                            <div className="flex gap-3">
                                                <button onClick={() => setShowNewClient(true)} className="h-10 px-4 rounded-lg bg-secondary border border-border text-[13px] font-medium hover:bg-white/5 inline-flex items-center gap-2 relative group overflow-hidden">
                                                    <span className="relative z-10"><Users size={14} className="inline mr-1" /> Novo Usuário</span>
                                                </button>
                                                <button onClick={() => setShowNewProject(true)} className="h-10 px-5 rounded-lg bg-primary text-primary-foreground font-semibold text-[13px] hover:opacity-90 inline-flex items-center gap-2 shadow-[0_0_15px_rgba(245,168,0,0.15)]">
                                                    <span>Novo Projeto</span>
                                                </button>
                                            </div>
                                        </div>
                                        {/* Dynamic Alerts List */}
                                        <div className="space-y-4">
                                            {projects.filter(p => (
                                                p.preview_status === 'rejected' || 
                                                p.preview_status === 'pending' ||
                                                p.updates?.some(u => u.status === 'denied')
                                            )).length === 0 ? (
                                                <div className="text-[14px] text-muted-foreground text-center py-10 border border-dashed border-border/50 rounded-xl bg-secondary/10">
                                                    <CheckCircle2 size={32} className="mx-auto mb-3 opacity-20 text-green-500" />
                                                    Não há alertas operacionais pendentes. Todos os projetos estão em fluxo normal.
                                                </div>
                                            ) : (
                                                <div className="grid gap-3">
                                                    {/* Alertas de Projeto (Global) */}
                                                    {projects.filter(p => p.preview_status === 'rejected').map(p => (
                                                        <div key={`proj-rej-${p.id}`} className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center justify-between animate-in slide-in-from-top-2">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                                                                    <AlertCircle size={20} className="text-red-500" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-[14px] font-bold text-foreground">{p.name} — Revisão Geral Solicitada</p>
                                                                    <p className="text-[12px] text-muted-foreground">O cliente solicitou ajustes na versão homologada.</p>
                                                                </div>
                                                            </div>
                                                            <button onClick={() => { setActiveTab('projects'); setExpandedProjectId(p.id); }} className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-[12px] font-bold rounded-lg transition-all">Ver Ajustes</button>
                                                        </div>
                                                    ))}

                                                    {/* Alertas de Updates (Granular) */}
                                                    {projects.filter(p => p.preview_status !== 'rejected' && p.updates?.some(u => u.status === 'denied')).map(p => (
                                                        <div key={`upd-den-${p.id}`} className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex items-center justify-between animate-in slide-in-from-top-2">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center shrink-0">
                                                                    <X size={20} className="text-rose-500" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-[14px] font-bold text-foreground">{p.name} — Entrega Recusada</p>
                                                                    <p className="text-[12px] text-muted-foreground">Uma ou mais etapas foram negadas pelo cliente.</p>
                                                                </div>
                                                            </div>
                                                            <button onClick={() => { setActiveTab('projects'); setExpandedProjectId(p.id); }} className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 text-[12px] font-bold rounded-lg transition-all">Ver Updates</button>
                                                        </div>
                                                    ))}

                                                    {/* Alertas de Homologação (Pending) */}
                                                    {projects.filter(p => p.preview_status === 'pending').map(p => (
                                                        <div key={`proj-pen-${p.id}`} className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center justify-between animate-in slide-in-from-top-2">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                                                                    <Clock size={20} className="text-amber-500" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-[14px] font-bold text-foreground">{p.name} — Em Homologação</p>
                                                                    <p className="text-[12px] text-muted-foreground">Aguardando decisão do cliente há {Math.floor((Date.now() - new Date(p.updated_at).getTime()) / (1000 * 60 * 60 * 24))} dias.</p>
                                                                </div>
                                                            </div>
                                                            <button onClick={() => { setActiveTab('projects'); setExpandedProjectId(p.id); }} className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 text-[12px] font-bold rounded-lg transition-all">Ir para Diário</button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Workload Distribution Chart with Photos */}
                                <div className="bg-card border border-border rounded-3xl p-8 relative overflow-hidden flex flex-col min-h-[450px]">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] pointer-events-none" />
                                    <div className="flex items-center justify-between mb-8 relative z-10">
                                        <div className="space-y-1">
                                            <h3 className="text-xl font-bold tracking-tight text-foreground">Distribuição de Recursos</h3>
                                            <p className="text-[13px] text-muted-foreground">Projetos por membro da equipe</p>
                                        </div>
                                        <Briefcase className="text-primary/40" size={20} />
                                    </div>

                                    <div className="flex-1 relative z-10">
                                        <ResponsiveContainer width="100%" height={280}>
                                            <AreaChart data={teamStats.workload}>
                                                <defs>
                                                    <linearGradient id="colorWork" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                                <XAxis 
                                                    dataKey="name" 
                                                    axisLine={false} 
                                                    tickLine={false} 
                                                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                                                    dy={10}
                                                />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                                                <RechartsTooltip 
                                                    content={({ active, payload }) => {
                                                        if (active && payload && payload.length) {
                                                            const data = payload[0].payload;
                                                            return (
                                                                <div className="bg-card/90 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-2xl flex items-center gap-4">
                                                                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border border-primary/30">
                                                                        {data.avatar_url ? (
                                                                            <img src={data.avatar_url} alt={data.name} className="w-full h-full object-cover" />
                                                                        ) : (
                                                                            <span className="text-primary font-bold">{data.name.charAt(0)}</span>
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[13px] font-bold text-foreground">{data.name}</p>
                                                                        <p className="text-[11px] text-primary">{data.project_count} Projetos Ativos</p>
                                                                    </div>
                                                                </div>
                                                            );
                                                        }
                                                        return null;
                                                    }}
                                                />
                                                <Area type="monotone" dataKey="project_count" stroke="var(--primary)" fillOpacity={1} fill="url(#colorWork)" strokeWidth={3} />
                                            </AreaChart>
                                        </ResponsiveContainer>

                                        {/* Visual Team Strip */}
                                        <div className="mt-6 flex flex-wrap gap-4 items-center justify-center">
                                            {teamStats.workload.map((member, idx) => (
                                                <div key={idx} className="flex flex-col items-center gap-2 group cursor-help">
                                                    <div className="w-10 h-10 rounded-full bg-secondary border-2 border-border group-hover:border-primary transition-all p-0.5 relative">
                                                        {member.avatar_url ? (
                                                            <img src={member.avatar_url} alt={member.name} className="w-full h-full rounded-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                                                                {member.name.split(' ').map((n: string) => n[0]).join('')}
                                                            </div>
                                                        )}
                                                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full border-2 border-background flex items-center justify-center text-[9px] font-black text-primary-foreground shadow-lg">
                                                            {member.project_count}
                                                        </div>
                                                    </div>
                                                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight group-hover:text-foreground transition-colors">{member.name.split(' ')[0]}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Main Activity Chart */}
                                <div className="bg-card border border-border rounded-2xl p-6 sm:p-8">
                                    <div className="flex items-center justify-between mb-8">
                                        <h4 className="text-[15px] font-bold text-foreground flex items-center gap-2">
                                            <Activity size={18} className="text-primary"/> Intensidade Operacional (Updates)
                                        </h4>
                                    </div>
                                    <div className="h-[240px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={[
                                                { name: 'Seg', val: 2 },
                                                { name: 'Ter', val: 5 },
                                                { name: 'Qua', val: 3 },
                                                { name: 'Qui', val: 8 },
                                                { name: 'Sex', val: projects.reduce((acc, p) => acc + (p.updates?.length || 0), 0) },
                                            ]}>
                                                <defs>
                                                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="oklch(0.78 0.18 80)" stopOpacity={0.3}/>
                                                        <stop offset="95%" stopColor="oklch(0.78 0.18 80)" stopOpacity={0}/>
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} />
                                                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} />
                                                <RechartsTooltip contentStyle={{ backgroundColor: 'oklch(0.17 0 0)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                                                <Area type="monotone" dataKey="val" stroke="oklch(0.78 0.18 80)" fillOpacity={1} fill="url(#colorVal)" strokeWidth={3} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar Analytics */}
                            <div className="space-y-6">
                                <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 flex flex-col items-center">
                                    <h4 className="text-[13px] font-bold text-muted-foreground uppercase tracking-widest mb-8 self-start">Distribuição por Etapa</h4>
                                    <div className="h-[200px] w-full mb-6">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={STAGES.map(s => ({
                                                        name: s.label,
                                                        value: projects.filter(p => p.current_stage === s.id).length || 0.1
                                                    }))}
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {STAGES.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={index === 0 ? 'oklch(0.78 0.18 80)' : `rgba(245,168,0,${0.2 + (index * 0.15)})`} />
                                                    ))}
                                                </Pie>
                                                <RechartsTooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="space-y-2 w-full">
                                        {STAGES.map((s, i) => {
                                            const count = projects.filter(p => p.current_stage === s.id).length;
                                            return (
                                                <div key={s.id} className="flex items-center justify-between text-[11px] font-semibold">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: i === 0 ? 'oklch(0.78 0.18 80)' : `rgba(245,168,0,${0.2 + (i * 0.15)})` }} />
                                                        <span className="text-muted-foreground">{s.label}</span>
                                                    </div>
                                                    <span className="text-foreground">{count}</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 sm:p-8">
                                    <h4 className="text-[13px] font-bold text-primary uppercase tracking-widest mb-4">Eficiência de Entrega</h4>
                                    <p className="text-3xl font-bold text-foreground mb-1">
                                        {totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0}%
                                    </p>
                                    <p className="text-[11px] text-muted-foreground leading-relaxed">Projetos que passaram por todas as fases e foram entregues com sucesso.</p>
                                    <div className="mt-6 w-full bg-border/30 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-primary h-full transition-all duration-1000" style={{ width: `${totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0}%` }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'projects' && (
                    <div className="animate-fade-in max-w-5xl mx-auto space-y-6">
                        {/* ── Toolbar ── */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            <div className="relative flex-1">
                                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
                                <input
                                    type="text"
                                    placeholder="Buscar por cliente ou projeto..."
                                    value={projectSearch}
                                    onChange={e => setProjectSearch(e.target.value)}
                                    className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground/40 focus:border-primary outline-none transition-colors"
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <SlidersHorizontal size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 pointer-events-none" />
                                    <select
                                        value={projectFilter}
                                        onChange={e => setProjectFilter(e.target.value as any)}
                                        className="bg-card border border-border rounded-xl pl-9 pr-4 py-2.5 text-[13px] text-foreground focus:border-primary outline-none appearance-none cursor-pointer"
                                    >
                                        <option value="all">Todos</option>
                                        <option value="alerts">Com Alertas</option>
                                        <option value="active">Em Progresso</option>
                                        <option value="done">Concluídos</option>
                                    </select>
                                </div>
                                <button onClick={() => setShowNewProject(true)} className="h-10 px-4 rounded-xl bg-primary text-primary-foreground text-[13px] font-semibold hover:opacity-90 inline-flex items-center gap-2 shadow-[0_0_15px_rgba(245,168,0,0.15)] whitespace-nowrap">
                                    <Plus size={15} /> Novo Projeto
                                </button>
                            </div>
                        </div>

                        {/* ── Empty State ── */}
                        {projects.length === 0 ? (
                            <div className="text-center py-24 bg-card border border-border rounded-xl">
                                <FolderKanban size={32} className="mx-auto text-muted-foreground mb-4 opacity-50" />
                                <p className="text-[15px] font-medium text-foreground mb-2">A esteira operacional está vazia.</p>
                                <button onClick={() => setShowNewProject(true)} className="h-10 px-5 rounded-lg bg-primary text-primary-foreground font-semibold text-[13px] hover:opacity-90 inline-flex items-center gap-2 mt-4">Novo Projeto</button>
                            </div>
                        ) : filteredGroups.length === 0 ? (
                            <div className="text-center py-20 bg-card border border-dashed border-border/50 rounded-2xl">
                                <Search size={28} className="mx-auto text-muted-foreground mb-3 opacity-30" />
                                <p className="text-[14px] font-medium text-muted-foreground">Nenhum resultado encontrado.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {filteredGroups.map(group => {
                                    const isClientExpanded = expandedClientId === group.clientName;
                                    const hasRejected = group.projects.some(p => p.preview_status === 'rejected');
                                    const hasPending = group.projects.some(p => p.preview_status === 'pending');
                                    const doneCount = group.projects.filter(p => p.current_stage === 6).length;
                                    const progressPct = group.projects.length > 0 ? Math.round((doneCount / group.projects.length) * 100) : 0;
                                    const initials = group.clientName.split(' ').slice(0,2).map((n: string) => n[0]).join('').toUpperCase();

                                    return (
                                        <div key={group.clientName} className={`rounded-2xl overflow-hidden transition-all duration-300 border ${
                                            hasRejected ? 'border-red-500/30 shadow-[0_0_30px_-8px_rgba(239,68,68,0.15)]' :
                                            hasPending ? 'border-amber-500/30 shadow-[0_0_30px_-8px_rgba(245,158,11,0.12)]' :
                                            'border-border'
                                        }`}>

                                            {/* ── Client Card Header ── */}
                                            <div
                                                onClick={() => setExpandedClientId(isClientExpanded ? null : group.clientName)}
                                                className="w-full text-left bg-card hover:bg-card/80 transition-colors cursor-pointer"
                                            >
                                                <div className="p-5 sm:p-6 flex items-center gap-5">
                                                       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black shrink-0 aspect-square ${
                                                        hasRejected ? 'bg-red-500/20 text-red-400' :
                                                        hasPending ? 'bg-amber-500/20 text-amber-400' :
                                                        'bg-primary/15 text-primary'
                                                    }`}>
                                                        {initials}
                                                    </div>

                                                    {/* Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2.5 flex-wrap mb-1">
                                                            <h3 className="text-[16px] font-bold text-foreground tracking-tight">{group.clientName}</h3>
                                                            {hasRejected && (
                                                                <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border bg-red-500/10 border-red-500/30 text-red-400 animate-pulse">
                                                                    <AlertCircle size={8} /> Ajuste Pendente
                                                                </span>
                                                            )}
                                                            {!hasRejected && hasPending && (
                                                                <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border bg-amber-500/10 border-amber-500/30 text-amber-400">
                                                                    <Clock size={8} /> Em Homologação
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-4 text-[11px] text-muted-foreground font-medium">
                                                            <span className="flex items-center gap-1.5"><Briefcase size={11} /> {group.projects.length} projeto{group.projects.length !== 1 ? 's' : ''}</span>
                                                            {group.clientEmail && <span className="truncate max-w-[200px]">{group.clientEmail}</span>}
                                                        </div>
                                                        {/* Per-client progress bar */}
                                                        <div className="mt-3 flex items-center gap-3">
                                                            <div className="flex-1 bg-border/30 h-1 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full rounded-full transition-all duration-1000"
                                                                    style={{
                                                                        width: `${progressPct}%`,
                                                                        background: progressPct === 100 ? 'oklch(0.72 0.17 145)' : 'oklch(0.78 0.18 80)'
                                                                    }}
                                                                />
                                                            </div>
                                                            <span className="text-[10px] font-bold text-muted-foreground shrink-0">{doneCount}/{group.projects.length} concluído{doneCount !== 1 ? 's' : ''}</span>
                                                        </div>
                                                    </div>

                                                    {/* Right: quick actions + chevron */}
                                                    <div className="flex items-center gap-3 shrink-0">
                                                        <button
                                                            onClick={e => { e.stopPropagation(); setNewProjectClientId(group.client?.id || ''); setShowNewProject(true); }}
                                                            className="h-9 px-3 bg-secondary/80 hover:bg-primary hover:text-primary-foreground border border-border hover:border-primary rounded-lg text-[12px] font-semibold inline-flex items-center gap-1.5 transition-all"
                                                            title="Novo Projeto para este cliente"
                                                        >
                                                            <Plus size={13} />
                                                            <span className="hidden sm:inline">Projeto</span>
                                                        </button>
                                                        <div className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${
                                                            isClientExpanded ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-background border-border text-muted-foreground'
                                                        }`}>
                                                            {isClientExpanded ? <ChevronUp size={15}/> : <ChevronDown size={15}/>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* ── Expanded: Projects list ── */}
                                            {isClientExpanded && (
                                                <div className="border-t border-border/50 bg-background/50 p-4 sm:p-5 space-y-4 animate-in slide-in-from-top-2 duration-300">
                                                    {group.projects.map(proj => {
                                                        const isExpanded = expandedProjectId === proj.id;
                                                        const ps = proj.preview_status ?? 'none';

                                                        return (
                                                        <div key={proj.id} className="bg-card border border-border/70 rounded-2xl overflow-hidden shadow-md transition-all">
                                                            {/* Project Card Header */}
                                                            <div className="p-5 relative">
                                                                <div className="absolute top-0 right-0 w-48 h-full bg-primary/5 blur-[40px] pointer-events-none" />
                                                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
                                                                    <div className="space-y-1.5 flex-1 pr-4">
                                                                        <div className="flex items-center gap-2 flex-wrap">
                                                                            <span className="bg-primary/20 text-primary text-[9px] uppercase font-black px-2 py-0.5 rounded-sm tracking-widest border border-primary/20">
                                                                                Etapa {proj.current_stage}/6
                                                                            </span>
                                                                            {ps === 'pending' && (
                                                                                <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border bg-amber-500/10 border-amber-500/30 text-amber-400">
                                                                                    <Clock size={9} /> Aguardando Avaliação
                                                                                </span>
                                                                            )}
                                                                            {ps === 'approved' && (
                                                                                <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border bg-green-500/10 border-green-500/30 text-green-400">
                                                                                    <ThumbsUp size={9} /> Aprovado
                                                                                </span>
                                                                            )}
                                                                            {ps === 'rejected' && (
                                                                                <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border bg-red-500/10 border-red-500/30 text-red-400 animate-pulse">
                                                                                    <AlertCircle size={9} /> Ajustes Solicitados
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <h3 className="font-bold text-[18px] tracking-tight text-foreground flex items-center gap-2">
                                                                            {proj.name}
                                                                            <button onClick={() => openEditProjectModal(proj)} className="text-muted-foreground hover:text-primary transition-colors hover:bg-secondary p-1 rounded-md" title="Editar Metadados">
                                                                                <FileEdit size={14} />
                                                                            </button>
                                                                            <button 
                                                                                onClick={() => { setDeletingProject(proj); setPermanentDelete(false); }}
                                                                                className="text-muted-foreground hover:text-red-500 transition-colors hover:bg-red-500/10 p-1 rounded-md" 
                                                                                title="Mover para Lixeira"
                                                                            >
                                                                                <Trash2 size={14} />
                                                                            </button>
                                                                        </h3>
                                                                        {ps === 'rejected' && proj.preview_feedback && (
                                                                            <div className="mt-2 bg-red-500/5 border border-red-500/20 rounded-lg p-3 animate-in slide-in-from-left-2 duration-500 w-fit">
                                                                                <div className="flex items-center gap-1.5 text-red-400 font-bold text-[9px] uppercase tracking-wider mb-1"><MessageSquareText size={10} /> Feedback do Cliente:</div>
                                                                                <p className="text-[12px] text-foreground font-medium leading-relaxed italic">"{proj.preview_feedback}"</p>
                                                                            </div>
                                                                        )}
                                                                            <div className="flex items-center gap-3 text-[12px] text-muted-foreground font-medium pt-1">
                                                                                {proj.preview_url ? (
                                                                                    <span className="flex items-center gap-1.5"><LinkIcon size={12} className="text-green-500" /> Link de teste configurado</span>
                                                                                ) : (
                                                                                    <span className="text-muted-foreground/60">Sem link de visualização</span>
                                                                                )}
                                                                            </div>
                                                                            
                                                                            {/* Project Squad / Assignments */}
                                                                            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/30">
                                                                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Squad Responsável:</span>
                                                                                <div className="flex -space-x-2">
                                                                                    {projectAssignments.filter(a => a.project_id === proj.id).map(a => {
                                                                                        const user = users.find(u => u.id === a.user_id);
                                                                                        if (!user) return null;
                                                                                        return (
                                                                                            <div key={user.id} className="w-8 h-8 rounded-full border-2 border-background bg-secondary relative group shrink-0 aspect-square">
                                                                                                {user.avatar_url ? (
                                                                                                    <img src={user.avatar_url} alt={user.name} className="w-full h-full rounded-full object-cover" />
                                                                                                ) : (
                                                                                                    <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-primary">{user.name.charAt(0)}</div>
                                                                                                )}
                                                                                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-card border border-border px-2 py-1 rounded text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                                                                                                    {user.name}
                                                                                                </div>
                                                                                                <button onClick={(e) => { e.stopPropagation(); handleRemoveAssignment(proj.id, user.id); }} className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[8px] text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                                                                                    <X size={8} />
                                                                                                </button>
                                                                                            </div>
                                                                                        );
                                                                                    })}
                                                                                    <button 
                                                                                        onClick={() => setAssigningProject(proj)}
                                                                                        className="w-8 h-8 rounded-full border-2 border-dashed border-primary/40 bg-primary/5 flex items-center justify-center text-primary hover:bg-primary/20 transition-all"
                                                                                    >
                                                                                        <Plus size={12} />
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    <button
                                                                        onClick={() => setExpandedProjectId(isExpanded ? null : proj.id)}
                                                                        className="w-full lg:w-auto h-10 px-5 bg-secondary/80 hover:bg-white/5 border border-border rounded-xl text-[12px] font-semibold inline-flex items-center justify-center gap-2 transition-all mt-3 lg:mt-0"
                                                                    >
                                                                        {isExpanded ? 'Esconder Diário' : 'Abrir Linha do Tempo'}
                                                                        {isExpanded ? <ChevronUp size={14} className="text-primary"/> : <ChevronDown size={14} className="text-primary"/>}
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            {/* Expanded Timeline View */}
                                                            {isExpanded && (
                                                                <div className="bg-background border-t border-border animate-fade-in overflow-hidden">
                                                                    
                                                                    {/* Dispatch new update block */}
                                                                    <div className="p-5 sm:p-6 border-b border-border/50 bg-secondary/10">
                                                                        {isUpdating === proj.id ? (
                                                                            <form onSubmit={(e) => handlePostUpdate(e, proj.id)} className="space-y-4 bg-background p-5 sm:p-6 rounded-xl border border-primary/30 shadow-2xl relative">
                                                                                <div className="absolute top-0 left-0 w-2 h-full bg-primary rounded-l-xl" />
                                                                                
                                                                                <div className="flex items-center justify-between">
                                                                                    <h4 className="text-[14px] sm:text-[15px] font-semibold text-foreground">Disparar Atualização para o Cliente</h4>
                                                                                    <button type="button" onClick={() => setIsUpdating(null)} className="p-1 rounded bg-secondary text-muted-foreground hover:text-foreground"><X size={16} /></button>
                                                                                </div>
                                                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                                                    <div className="md:col-span-1">
                                                                                        <label className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-2 block">Selecione Fase</label>
                                                                                        <select value={updateStage} onChange={e => setUpdateStage(Number(e.target.value))} className="w-full bg-card border border-border rounded-md px-3 py-2.5 text-[13px] text-foreground focus:border-primary outline-none font-semibold">
                                                                                            {STAGES.map(s => <option key={s.id} value={s.id}>Et. {s.id}: {s.label}</option>)}
                                                                                        </select>
                                                                                    </div>
                                                                                    <div className="md:col-span-3">
                                                                                        <label className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-2 block">Ato / Título (Notificação)</label>
                                                                                        <input type="text" placeholder="Ex: Layout Premium Aprovado" required value={updateTitle} onChange={e => setUpdateTitle(e.target.value)} className="w-full bg-card border border-border rounded-md px-3 py-2.5 text-[13px] text-foreground focus:border-primary outline-none font-medium" />
                                                                                    </div>
                                                                                </div>
                                                                                
                                                                                <div>
                                                                                    <label className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-2 block">Mensagem Estruturada (Opcional)</label>
                                                                                    <textarea placeholder="Relate o que foi finalizado e quais são as orientações..." rows={3} value={updateMessage} onChange={e => setUpdateMessage(e.target.value)} className="w-full bg-card border border-border rounded-md px-3 py-2.5 text-[13px] resize-y text-foreground focus:border-primary outline-none placeholder:text-muted-foreground/40" />
                                                                                </div>

                                                                                <div className="bg-secondary/30 p-4 rounded-lg border border-border/50">
                                                                                    <label className="text-[11px] font-bold uppercase text-primary tracking-wider mb-2 flex items-center gap-2">
                                                                                        <LinkIcon size={12}/> Link de Homologação (Injetar Automático)
                                                                                     </label>
                                                                                     <p className="text-[11px] text-muted-foreground mb-3 leading-relaxed">
                                                        Se você inserir uma url aqui, o botão principal do *Dashboard do Cliente* e o registro dele será imediatamente substituído para este novo link. Deixe vazio para manter a URL atual do projeto.
                                                    </p>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex-1">
                                                            <input type="url" placeholder="Ex: https://nordex-preview.com/projeto-v2" value={updatePreviewUrl} onChange={e => setUpdatePreviewUrl(e.target.value)} className="w-full bg-background border border-border rounded-md px-3 py-2 text-[13px] text-foreground focus:border-primary outline-none font-mono" />
                                                        </div>
                                                        <div className="w-32">
                                                            <input type="number" placeholder="Horas" value={updateHours} onChange={e => setUpdateHours(e.target.value)} className="w-full bg-background border border-border rounded-md px-3 py-2 text-[13px] text-foreground focus:border-primary outline-none" />
                                                            <p className="text-[9px] text-muted-foreground mt-1 text-center font-bold">HORAS GASTAS</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                                                
                                                                                <div className="flex justify-end pt-2">
                                                                                    <button type="submit" className="h-10 px-6 sm:h-11 sm:px-8 bg-primary text-primary-foreground rounded-lg text-[12px] sm:text-[13px] font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(245,168,0,0.2)]">
                                                                                        <Send size={15} /> Enviar Atualização para a Nuvem
                                                                                    </button>
                                                                                </div>
                                                                            </form>
                                                                        ) : (
                                                                            <button onClick={() => { setIsUpdating(proj.id); setUpdateStage(proj.current_stage); setUpdatePreviewUrl(''); }} className="w-full h-11 flex items-center justify-center gap-2 bg-background border border-dashed border-primary/50 text-foreground hover:bg-secondary/50 rounded-xl transition-all text-[13px] font-semibold">
                                                                                <Plus size={16} className="text-primary"/> Criar Nova Atualização de Pipeline
                                                                            </button>
                                                                        )}
                                                                    </div>

                                                                    {/* Mirror Timeline Feed */}
                                                                    <div className="p-6 px-6 sm:px-10 bg-background">
                                                                        {(() => {
                                                                            const pUpdates = proj.updates || []; // Aggregated via SQL GET route
                                                                            if (pUpdates.length === 0) return <p className="text-[13px] text-muted-foreground text-center py-6">Este projeto ainda não recebeu nenhuma atualização estrutural na pipeline.</p>;
                                                                            
                                                                            return (
                                                                                <div className="relative border-l-2 border-border/50 ml-3 space-y-10 pb-4">
                                                                                    {pUpdates.map((upd: any) => (
                                                                                        <div key={upd.id} className="relative pl-7 group">
                                                                                            <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-card border-[3px] border-primary shadow-[0_0_10px_rgba(245,168,0,0.4)]" />
                                                                                            
                                                                                            <div className="flex items-center justify-between mb-2">
                                                                                                <span className="text-[10px] sm:text-[11px] font-bold text-primary tracking-widest uppercase bg-primary/10 px-2 py-0.5 rounded-sm">
                                                                                                    Etapa {upd.stage}
                                                                                                </span>
                                                                                                <span className="text-[11px] sm:text-[12px] font-medium text-muted-foreground">
                                                                                                    {format(new Date(upd.created_at), "dd 'de' MMM 'às' HH:mm", { locale: ptBR })}
                                                                                                </span>
                                                                                            </div>
                                                                                            <h4 className="text-[15px] sm:text-[16px] font-semibold text-foreground mb-1">{upd.title}</h4>
                                                                                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-3">
                                                                                                <Users size={12} className="text-primary/60" /> 
                                                                                                <span>Postado por: <b className="text-foreground">{upd.creator_name || 'Sistema'}</b></span>
                                                                                            </div>
                                                                                            {upd.message && <div className="text-[13px] sm:text-[14px] text-muted-foreground/90 leading-relaxed bg-secondary/30 p-3 rounded-lg border border-border">{upd.message}</div>}

                                                                                            {/* Audit & Engagement Indicators */}
                                                                                            <div className="mt-4 pt-4 border-t border-border/30">
                                                                                                <div className="flex flex-wrap items-center gap-3 mb-4">
                                                                                                    {upd.viewed_at ? (
                                                                                                        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-green-500/10 text-green-400 text-[10px] font-bold border border-green-500/20">
                                                                                                            <CheckCircle2 size={12}/> Visto pelo cliente em {format(new Date(upd.viewed_at), "dd/MM, HH:mm")}
                                                                                                        </div>
                                                                                                    ) : (
                                                                                                        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/10 text-muted-foreground text-[10px] font-bold border border-border">
                                                                                                            <Clock size={12}/> Ainda não visualizado
                                                                                                        </div>
                                                                                                    )}

                                                                                                    {upd.status === 'authorized' && (
                                                                                                        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10 text-primary text-[10px] font-bold border border-primary/20">
                                                                                                            <ThumbsUp size={12}/> Autorizado pelo Cliente
                                                                                                        </div>
                                                                                                    )}

                                                                                                    {upd.status === 'denied' && (
                                                                                                        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-red-500/10 text-red-400 text-[10px] font-bold border border-red-500/20">
                                                                                                            <ThumbsDown size={12}/> Ajuste Solicitado
                                                                                                        </div>
                                                                                                    )}
                                                                                                </div>

                                                                                                {upd.status === 'denied' && upd.feedback && (
                                                                                                    <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 mb-4 relative">
                                                                                                        <div className="absolute -top-2 left-4 bg-background border border-red-500/30 px-3 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest text-red-400 flex items-center gap-1.5">
                                                                                                            <AlertCircle size={10}/> Restrição do Cliente
                                                                                                        </div>
                                                                                                        <p className="text-[13px] text-foreground font-medium italic leading-relaxed">
                                                                                                            "{upd.feedback}"
                                                                                                        </p>
                                                                                                    </div>
                                                                                                )}

                                                                                                {upd.client_note ? (
                                                                                                    <div className="bg-card border border-primary/30 rounded-xl p-4 sm:p-5 shadow-sm relative">
                                                                                                        <div className="absolute -top-3 left-4 bg-background border border-primary/30 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest text-primary flex items-center gap-1.5">
                                                                                                            <MessageSquareText size={11}/> Diário do Cliente
                                                                                                        </div>
                                                                                                        <p className="text-[13px] sm:text-[14px] text-foreground/90 leading-relaxed whitespace-pre-wrap mt-2 font-medium">
                                                                                                            {upd.client_note}
                                                                                                        </p>
                                                                                                    </div>
                                                                                                ) : (
                                                                                                    <div className="inline-flex items-center gap-2 text-[11px] sm:text-[12px] font-medium text-muted-foreground italic px-3 py-2 bg-secondary/20 rounded-lg">
                                                                                                        <Clock size={13} className="opacity-50"/> Cliente ainda não mandou anotações para este update.
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
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

                {/* TAB: Relatórios Profissionais */}
                {activeTab === 'reports' && (
                    <div className="animate-fade-in max-w-6xl mx-auto space-y-8 pb-20">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                            <div>
                                <h3 className="text-2xl font-black tracking-tight text-foreground uppercase">Relatórios de Performance</h3>
                                <p className="text-[14px] text-muted-foreground font-medium">Auditoria de eficiência, volume e saúde das operações</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="flex items-center gap-2 bg-card border border-border p-1 rounded-xl">
                                    <select 
                                        value={reportProjectId} 
                                        onChange={e => setReportProjectId(e.target.value)}
                                        className="bg-transparent text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 outline-none text-foreground cursor-pointer"
                                    >
                                        <option value="all">Todos os Projetos</option>
                                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                    <div className="h-4 w-px bg-border" />
                                    <input 
                                        type="date" 
                                        value={reportStartDate} 
                                        onChange={e => setReportStartDate(e.target.value)}
                                        className="bg-transparent text-[11px] font-bold px-3 py-1.5 outline-none text-muted-foreground"
                                    />
                                    <span className="text-muted-foreground text-[10px]">até</span>
                                    <input 
                                        type="date" 
                                        value={reportEndDate} 
                                        onChange={e => setReportEndDate(e.target.value)}
                                        className="bg-transparent text-[11px] font-bold px-3 py-1.5 outline-none text-muted-foreground"
                                    />
                                </div>
                                <button className="h-10 px-4 rounded-xl bg-primary text-primary-foreground text-[12px] font-black uppercase tracking-widest hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20">
                                    <FileDown size={16} /> Exportar
                                </button>
                            </div>
                        </div>

                        {/* Project Specific Deep Metrics */}
                        {reportProjectId !== 'all' && projectSpecificStats && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
                                <div className="bg-card border border-border rounded-2xl p-6 flex flex-col md:flex-row gap-8">
                                    <div className="flex-1">
                                        <h4 className="text-[12px] font-black uppercase tracking-widest text-primary mb-3">Resumo do Projeto</h4>
                                        <p className="text-[14px] text-foreground font-medium leading-relaxed">
                                            {projects.find(p => p.id === reportProjectId)?.description || "Sem descrição informada."}
                                        </p>
                                        <div className="mt-4 flex gap-4">
                                            <div className="bg-secondary/20 px-3 py-1.5 rounded-lg border border-border">
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase mr-2">Status:</span>
                                                <span className="text-[11px] font-black text-foreground uppercase">
                                                    {STAGES.find(s => s.id === (projects.find(p => p.id === reportProjectId)?.current_stage || 1))?.label}
                                                </span>
                                            </div>
                                            <div className="bg-secondary/20 px-3 py-1.5 rounded-lg border border-border">
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase mr-2">Início:</span>
                                                <span className="text-[11px] font-black text-foreground">
                                                    {format(new Date(projects.find(p => p.id === reportProjectId)!.created_at), 'dd/MM/yyyy')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-px bg-border hidden md:block" />
                                    <div className="flex-1">
                                        <h4 className="text-[12px] font-black uppercase tracking-widest text-primary mb-3">Equipe Alocada</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {projectAssignments.filter(a => a.project_id === reportProjectId).length > 0 ? (
                                                projectAssignments.filter(a => a.project_id === reportProjectId).map((a, i) => {
                                                    const u = users.find(user => user.id === a.user_id);
                                                    return (
                                                        <div key={i} className="flex items-center gap-2 bg-secondary/10 border border-border p-1.5 pr-3 rounded-full">
                                                            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                                                                {u?.name.substring(0, 1) || '?'}
                                                            </div>
                                                            <span className="text-[11px] font-black text-foreground">{u?.name || 'Desconhecido'}</span>
                                                        </div>
                                                    )
                                                })
                                            ) : (
                                                <span className="text-[11px] text-muted-foreground italic">Nenhum squad definido para este projeto.</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Lead Time</p>
                                        <p className="text-2xl font-black text-foreground">{projectSpecificStats.leadTime}</p>
                                        <p className="text-[11px] text-muted-foreground mt-1 italic">Duração do ciclo</p>
                                    </div>
                                    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Primeira Aprovação</p>
                                        <p className="text-2xl font-black text-foreground">{projectSpecificStats.approvalRate}%</p>
                                        <p className="text-[11px] text-muted-foreground mt-1 italic">Assertividade técnica</p>
                                    </div>
                                    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Volume Produzido</p>
                                        <p className="text-2xl font-black text-foreground">{projectSpecificStats.totalUpdates}</p>
                                        <p className="text-[11px] text-muted-foreground mt-1 italic">Entregas realizadas</p>
                                    </div>
                                    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Feedback Loop</p>
                                        <p className="text-2xl font-black text-foreground">{projectSpecificStats.rejectionCount}</p>
                                        <p className="text-[11px] text-muted-foreground mt-1 italic">Ajustes solicitados</p>
                                    </div>
                                    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Esforço (Horas)</p>
                                        <p className="text-2xl font-black text-foreground">{projectSpecificStats.totalHours} / {projectSpecificStats.estimatedHours}</p>
                                        <p className="text-[11px] text-muted-foreground mt-1 italic">Atual vs Estimado</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* General Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-card border border-border rounded-3xl p-8 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl pointer-events-none" />
                                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">Volume Filtrado</p>
                                <div className="flex items-end gap-3 mb-2">
                                    <span className="text-4xl font-black text-foreground tracking-tighter">{filteredReportProjects.length}</span>
                                    <span className="text-[13px] font-bold text-primary mb-1.5">Projetos</span>
                                </div>
                                <p className="text-[12px] text-muted-foreground">Projetos que iniciaram no período selecionado</p>
                            </div>

                            <div className="bg-card border border-border rounded-3xl p-8 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 blur-3xl pointer-events-none" />
                                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">Saúde Situacional</p>
                                <div className="flex items-end gap-3 mb-2">
                                    <span className="text-4xl font-black text-foreground tracking-tighter">
                                        {filteredReportProjects.length > 0 ? Math.round((filteredReportProjects.filter(p => p.current_stage === 6).length / filteredReportProjects.length) * 100) : 0}%
                                    </span>
                                    <span className="text-[13px] font-bold text-green-500 mb-1.5">Conclusão</span>
                                </div>
                                <p className="text-[12px] text-muted-foreground">Relação de entrega para o conjunto atual</p>
                            </div>

                            <div className="bg-card border border-border rounded-3xl p-8 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl pointer-events-none" />
                                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">Esforço Operacional</p>
                                <div className="flex items-end gap-3 mb-2">
                                    <span className="text-4xl font-black text-foreground tracking-tighter">
                                        {filteredReportProjects.reduce((acc, p) => acc + (p.updates?.length || 0), 0)}
                                    </span>
                                    <span className="text-[13px] font-bold text-blue-500 mb-1.5">Updates Totais</span>
                                </div>
                                <p className="text-[12px] text-muted-foreground">Volume de produção técnica no período</p>
                            </div>
                        </div>

                        {/* Distribution Charts in Reports */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-card border border-border rounded-3xl p-8">
                                <h4 className="text-[15px] font-black uppercase tracking-widest text-foreground mb-8">Status Atual da Pipeline (Filtrado)</h4>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={STAGES.map(s => ({
                                            name: s.label,
                                            count: filteredReportProjects.filter(p => p.current_stage === s.id).length
                                        }))}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                                            <RechartsTooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px' }} />
                                            <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={40} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="bg-card border border-border rounded-3xl p-8 flex flex-col items-center justify-center">
                                <h4 className="text-[15px] font-black uppercase tracking-widest text-foreground mb-8 self-start">Comprometimento de Equipe</h4>
                                <div className="h-[260px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={teamStats?.workload?.map(w => ({ name: w.name, value: Number(w.project_count) })) || []}
                                                cx="50%" cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {teamStats?.workload?.map((entry: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={`oklch(0.78 0.18 ${60 + (index * 40)})`} />
                                                )) || []}
                                            </Pie>
                                            <RechartsTooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="mt-4 grid grid-cols-2 gap-4 w-full">
                                    {teamStats?.workload?.map((w: any, i: number) => (
                                        <div key={w.id} className="flex items-center justify-between text-[11px] font-bold">
                                            <span className="text-muted-foreground flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: `oklch(0.78 0.18 ${60 + (i * 40)})` }} />
                                                {w.name}
                                            </span>
                                            <span className="text-foreground">{w.project_count} proj.</span>
                                        </div>
                                    )) || []}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'team' && (
                    <div className="animate-fade-in max-w-6xl mx-auto space-y-8 pb-20">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-black tracking-tight text-foreground">Gestão de Equipe</h3>
                                <p className="text-[14px] text-muted-foreground font-medium">Administradores e Especialistas Nordex</p>
                            </div>
                            <button 
                                onClick={() => setShowAddTeamMember(true)}
                                className="h-10 px-5 rounded-xl bg-primary text-primary-foreground font-black text-[12px] hover:opacity-90 transition-all shadow-[0_0_20px_rgba(245,168,0,0.2)] flex items-center gap-2 uppercase tracking-widest"
                            >
                                <Plus size={16} /> Adicionar Integrante
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {users.filter(u => u.role === 'admin').map((admin) => (
                                <div key={admin.id} className="bg-card border border-border rounded-3xl p-8 relative overflow-hidden group transition-all hover:border-primary/30 shadow-xl">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl pointer-events-none" />
                                    
                                    <div className="flex items-center gap-5 mb-6">
                                        <div className="w-16 h-16 rounded-full bg-secondary border-2 border-primary/20 overflow-hidden shrink-0">
                                            {admin.avatar_url ? (
                                                <img src={admin.avatar_url} alt={admin.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-primary font-black text-xl">{admin.name.charAt(0)}</div>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-black text-[17px] text-foreground truncate">{admin.name}</h4>
                                            <p className="text-[11px] font-black uppercase tracking-widest text-primary">{admin.position || 'Administrador'}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-8">
                                        <p className="text-[13px] text-muted-foreground leading-relaxed line-clamp-3 italic">
                                            {admin.bio || "Este membro ainda não definiu uma biografia profissional."}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between pt-6 border-t border-border/50">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Ativo</span>
                                            </div>
                                            <p className="text-[10px] text-primary font-bold mt-1">
                                                {teamStats.workload.find(w => w.id === admin.id)?.project_count || 0} Projetos
                                            </p>
                                        </div>
                                        <button 
                                            onClick={() => {
                                                setEditingTeamMember(admin);
                                                setEditTeamAvatar(admin.avatar_url || '');
                                                setEditTeamPosition(admin.position || '');
                                                setEditTeamBio(admin.bio || '');
                                            }}
                                            className="h-9 px-4 rounded-xl bg-secondary hover:bg-white/5 border border-border text-[11px] font-bold text-foreground transition-all flex items-center gap-2"
                                        >
                                            <Edit size={14} /> Editar Perfil
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
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
                                                    <div className="inline-flex items-center gap-2">
                                                        {u.role === 'client' && (
                                                            <button 
                                                                onClick={() => handlePromoteUser(u)}
                                                                className="inline-flex h-8 items-center justify-center bg-primary/10 border border-primary/30 hover:bg-primary hover:text-primary-foreground px-3 rounded text-[10px] font-black uppercase tracking-wider transition-all gap-1.5 text-primary"
                                                                title="Promover para Equipe"
                                                            >
                                                                <Plus size={12} /> Equipe
                                                            </button>
                                                        )}
                                                        <button onClick={() => { setEditingUser(u); setEditUserName(u.name); setEditUserEmail(u.email); setEditUserRole(u.role); setEditUserPassword(''); }} className="inline-flex h-8 items-center justify-center bg-background border border-border hover:border-primary px-3 rounded text-[12px] font-medium transition-all gap-1.5 focus:outline-none focus:ring-1 focus:ring-primary shadow-sm hover:text-primary">
                                                            <Edit size={12} /> Editar
                                                        </button>
                                                        <button onClick={() => { setDeletingUser(u); setDeleteWarning(null); }} className="inline-flex h-8 items-center justify-center bg-background border border-red-500/30 hover:border-red-500 hover:bg-red-500/10 px-3 rounded text-[12px] font-medium transition-all gap-1.5 text-red-400 hover:text-red-400 focus:outline-none focus:ring-1 focus:ring-red-500 shadow-sm">
                                                            <Trash2 size={12} /> Excluir
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'trash' && (
                    <div className="animate-fade-in max-w-5xl mx-auto space-y-6">
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 flex flex-col items-center text-center">
                            <Trash2 size={40} className="text-amber-500 mb-4 opacity-50" />
                            <h3 className="text-[18px] font-bold text-foreground">Lixeira de Projetos</h3>
                            <p className="text-[14px] text-muted-foreground max-w-lg mt-2 leading-relaxed">
                                Projetos nesta lista foram removidos mas ainda podem ser restaurados. Eles ficarão disponíveis aqui para recuperação ou exclusão permanente.
                            </p>
                        </div>

                        {trashProjects.length === 0 ? (
                            <div className="py-20 bg-card border border-dashed border-border/50 rounded-2xl text-center">
                                <CheckCircle2 size={32} className="mx-auto text-muted-foreground/20 mb-3" />
                                <p className="text-[14px] font-medium text-muted-foreground">A lixeira está vazia.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {trashProjects.map(proj => (
                                    <div key={proj.id} className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-all flex items-center justify-between group">
                                        <div className="min-w-0">
                                            <h4 className="font-bold text-[15px] truncate">{proj.name}</h4>
                                            <p className="text-[11px] text-muted-foreground">Originalmente de: {proj.client_name}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => handleRestoreProject(proj.id)}
                                                className="h-9 px-3 bg-secondary/80 hover:bg-primary hover:text-primary-foreground border border-border hover:border-primary rounded-lg text-[12px] font-semibold transition-all"
                                                title="Restaurar Projeto"
                                            >
                                                Restaurar
                                            </button>
                                            <button 
                                                onClick={() => { setDeletingProject(proj); setPermanentDelete(true); }}
                                                className="h-9 px-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/30 rounded-lg text-[12px] font-semibold transition-all"
                                                title="Excluir Permanentemente"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Project Delete Confirmation Pop-up */}
            {deletingProject && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-background/90 backdrop-blur-md animate-fade-in">
                    <div className="bg-card border border-red-500/30 rounded-2xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-red-500" />
                        <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 mb-6">
                            <Trash2 size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-foreground mb-3 tracking-tight">
                            {permanentDelete ? 'Excluir Permanentemente?' : 'Mover para Lixeira?'}
                        </h2>
                        <div className="text-[14px] text-muted-foreground leading-relaxed mb-6 space-y-4">
                            {permanentDelete ? (
                                <p className="bg-red-500/10 p-3 rounded-lg text-red-400 font-bold border border-red-500/20">
                                    AVISO CRÍTICO: Esta ação não pode ser desfeita. Todos os diários, atualizações e anotações do projeto "{deletingProject.name}" serão apagados para sempre.
                                </p>
                            ) : (
                                <p>
                                    Você está prestes a remover o projeto <b>{deletingProject.name}</b>. Ele ficará na lixeira e não estará mais visível para o cliente.
                                </p>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeletingProject(null)}
                                className="flex-1 h-11 bg-secondary text-foreground font-semibold text-[13px] rounded-xl hover:bg-secondary/80 transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => handleDeleteProject(deletingProject, permanentDelete)}
                                disabled={deleteLoading}
                                className="flex-1 h-11 bg-red-500 text-white font-semibold text-[13px] rounded-xl hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 disabled:opacity-50"
                            >
                                {deleteLoading ? <Loader2 size={16} className="animate-spin mx-auto" /> : (permanentDelete ? 'Confirmar Exclusão' : 'Excluir')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wide mb-1.5 text-muted-foreground">Horas Totais Estimadas</label>
                                <input value={editProjectHours} onChange={e => setEditProjectHours(e.target.value)} type="number" className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-[14px] text-foreground focus:border-primary outline-none" placeholder="Ex: 40" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-wide mb-1.5 text-amber-500">Link de Stage</label>
                                    <input value={editProjectStageUrl} onChange={e => setEditProjectStageUrl(e.target.value)} type="url" className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-[14px] text-foreground focus:border-primary outline-none" placeholder="https://stage..." />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-wide mb-1.5 text-green-500">Link de Produção</label>
                                    <input value={editProjectProdUrl} onChange={e => setEditProjectProdUrl(e.target.value)} type="url" className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-[14px] text-foreground focus:border-primary outline-none" placeholder="https://prod..." />
                                </div>
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

                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wide mb-1.5 text-muted-foreground">Volume de Horas Previsto</label>
                                <input value={newProjectHours} onChange={e => setNewProjectHours(e.target.value)} type="number" className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-[14px] focus:border-primary outline-none" placeholder="Ex: 50" />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-wide mb-1.5 text-amber-500">Link de Stage</label>
                                    <input value={newProjectStageUrl} onChange={e => setNewProjectStageUrl(e.target.value)} type="url" className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-[14px] focus:border-primary outline-none" placeholder="https://stage..." />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-wide mb-1.5 text-green-500">Link de Produção</label>
                                    <input value={newProjectProdUrl} onChange={e => setNewProjectProdUrl(e.target.value)} type="url" className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-[14px] focus:border-primary outline-none" placeholder="https://prod..." />
                                </div>
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
            
            {/* MODAL: Editor de Usuário */}
            {editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-card border border-border rounded-xl w-full max-w-md shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b border-border bg-secondary/10">
                            <h3 className="text-[16px] font-semibold text-foreground">Gestão de Identidade</h3>
                            <button onClick={() => setEditingUser(null)} className="text-muted-foreground hover:text-foreground bg-background p-1.5 rounded border border-border shadow-sm"><X size={16} /></button>
                        </div>
                        <form onSubmit={handleEditUser} className="p-6 space-y-4">
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wide mb-1.5 text-muted-foreground">Nome Completo</label>
                                <input required value={editUserName} onChange={e => setEditUserName(e.target.value)} type="text" className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-[14px] text-foreground focus:border-primary outline-none" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wide mb-1.5 text-muted-foreground">E-mail</label>
                                <input required value={editUserEmail} onChange={e => setEditUserEmail(e.target.value)} type="email" className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-[14px] text-foreground focus:border-primary outline-none" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wide mb-1.5 text-muted-foreground">Privilégio Administrativo</label>
                                <select value={editUserRole} onChange={e => setEditUserRole(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-[14px] text-foreground focus:border-primary outline-none font-medium">
                                    <option value="client">Client Pool / Observador</option>
                                    <option value="admin">Engenharia / Super Admin</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wide mb-1.5 text-primary">Nova Senha (deixe vazio para manter)</label>
                                <input value={editUserPassword} onChange={e => setEditUserPassword(e.target.value)} type="password" placeholder="••••••••" className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-[14px] text-foreground focus:border-primary outline-none" />
                            </div>
                            <div className="pt-6 flex gap-3">
                                <button type="button" onClick={() => setEditingUser(null)} className="flex-1 h-11 bg-secondary hover:bg-white/5 rounded-lg text-[13px] font-semibold transition-colors">Voltar</button>
                                <button type="submit" disabled={editUserLoading} className="flex-1 h-11 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg text-[13px] font-semibold transition-colors flex justify-center items-center">
                                    {editUserLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sincronizar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: Confirmação de Exclusão de Usuário */}
            {deletingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-card border border-red-500/30 rounded-xl w-full max-w-md shadow-[0_0_50px_rgba(239,68,68,0.15)] relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-red-500/60" />
                        <div className="p-6 border-b border-border">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center shrink-0">
                                    <Trash2 size={18} className="text-red-500" />
                                </div>
                                <div>
                                    <h3 className="text-[16px] font-semibold text-foreground">Remoção Permanente</h3>
                                    <p className="text-[12px] text-muted-foreground">Esta ação não poderá ser desfeita.</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            {deleteWarning ? (
                                <>
                                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                                        <p className="text-[13px] font-semibold text-red-400 mb-3 flex items-center gap-2">
                                            <AlertCircle size={15} /> {deleteWarning.message}
                                        </p>
                                        <ul className="space-y-1">
                                            {deleteWarning.projects.map(p => (
                                                <li key={p.id} className="text-[12px] text-foreground/70 flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                                                    {p.name}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <p className="text-[13px] text-muted-foreground leading-relaxed">
                                        Confirme abaixo para excluir o usuário <b className="text-foreground">{deletingUser.name}</b> juntamente com todos os projetos e históricos vinculados.
                                    </p>
                                    <div className="flex gap-3 pt-2">
                                        <button onClick={() => { setDeletingUser(null); setDeleteWarning(null); }} className="flex-1 h-11 bg-secondary hover:bg-white/5 rounded-lg text-[13px] font-semibold transition-colors">Cancelar</button>
                                        <button onClick={() => handleDeleteUser(true)} disabled={deleteLoading} className="flex-1 h-11 bg-red-500 hover:bg-red-600 text-white rounded-lg text-[13px] font-semibold transition-colors flex justify-center items-center gap-2">
                                            {deleteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Trash2 size={14} /> Excluir Tudo</>}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <p className="text-[14px] text-foreground/80 leading-relaxed">
                                        Deseja remover permanentemente o usuário <b className="text-foreground">{deletingUser.name}</b> ({deletingUser.email})?
                                    </p>
                                    <div className="flex gap-3 pt-2">
                                        <button onClick={() => setDeletingUser(null)} className="flex-1 h-11 bg-secondary hover:bg-white/5 rounded-lg text-[13px] font-semibold transition-colors">Cancelar</button>
                                        <button onClick={() => handleDeleteUser(false)} disabled={deleteLoading} className="flex-1 h-11 bg-red-500 hover:bg-red-600 text-white rounded-lg text-[13px] font-semibold transition-colors flex justify-center items-center gap-2">
                                            {deleteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Trash2 size={14} /> Confirmar Exclusão</>}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {/* MODAL: Editor de Equipe */}
            {editingTeamMember && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fade-in">
                    <div className="bg-card border border-border rounded-3xl w-full max-w-lg shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl pointer-events-none" />
                        <div className="flex justify-between items-center p-8 border-b border-border bg-secondary/10">
                            <div>
                                <h3 className="text-xl font-bold text-foreground tracking-tight">Editar Perfil da Equipe</h3>
                                <p className="text-[12px] text-muted-foreground mt-1">Atualize as informações públicas de {editingTeamMember.name}</p>
                            </div>
                            <button onClick={() => setEditingTeamMember(null)} className="text-muted-foreground hover:text-foreground bg-background p-2 rounded-xl border border-border shadow-sm"><X size={18} /></button>
                        </div>
                        <form onSubmit={handleEditTeamMember} className="p-8 space-y-5">
                            <div className="flex items-center gap-6 mb-2">
                                <div className="w-20 h-20 rounded-full bg-secondary border-2 border-primary/20 overflow-hidden relative group shrink-0 aspect-square">
                                    {editTeamAvatar ? (
                                        <img src={editTeamAvatar} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-primary/40"><Users size={32} /></div>
                                    )}
                                </div>
                                <div className="flex-1 space-y-3">
                                    <label className="block text-[11px] font-black uppercase tracking-widest text-primary">Foto de Perfil</label>
                                    <div className="flex gap-2">
                                        <div className="flex-1 bg-secondary/50 border border-border rounded-xl px-4 py-2 text-[12px] text-muted-foreground truncate flex items-center">
                                            {editTeamAvatar || "Nenhuma imagem selecionada"}
                                        </div>
                                        <button 
                                            type="button"
                                            onClick={(e) => handleFileUploadClick(e, 'team')}
                                            className="h-10 px-4 bg-primary text-primary-foreground rounded-xl text-[12px] font-bold hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
                                        >
                                            {uploadLoading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                                            {editTeamAvatar ? 'Alterar Foto' : 'Subir Foto'}
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground italic">* Faça o upload de um arquivo local e defina o recorte perfeito.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-1.5">Cargo / Especialidade</label>
                                    <input required value={editTeamPosition} onChange={e => setEditTeamPosition(e.target.value)} type="text" placeholder="Ex: Engenheiro de Software Fullstack" className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-[14px] font-medium focus:border-primary outline-none transition-all" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-1.5">Biografia Profissional</label>
                                <textarea value={editTeamBio} onChange={e => setEditTeamBio(e.target.value)} rows={4} placeholder="Conte um pouco sobre suas responsabilidades..." className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-[14px] leading-relaxed focus:border-primary outline-none transition-all resize-none" />
                            </div>

                            <div className="pt-4 flex gap-4">
                                <button type="button" onClick={() => setEditingTeamMember(null)} className="flex-1 h-12 bg-secondary text-foreground hover:bg-white/5 rounded-2xl text-[13px] font-bold transition-all border border-border">Cancelar</button>
                                <button type="submit" disabled={editTeamLoading} className="flex-2 h-12 bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl text-[13px] font-bold transition-all flex justify-center items-center px-8 shadow-xl shadow-primary/20">
                                    {editTeamLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Salvar Alterações'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* MODAL: Atribuição de Equipe */}
            {assigningProject && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-card border border-border rounded-3xl w-full max-w-md shadow-2xl relative overflow-hidden">
                        <div className="p-8 border-b border-border bg-secondary/10 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-foreground tracking-tight">Atribuir Squad</h3>
                                <p className="text-[12px] text-muted-foreground mt-1">Selecione quem cuidará de {assigningProject.name}</p>
                            </div>
                            <button onClick={() => setAssigningProject(null)} className="text-muted-foreground hover:text-foreground bg-background p-2 rounded-xl border border-border shadow-sm"><X size={18} /></button>
                        </div>
                        <div className="p-6 space-y-2 max-h-[400px] overflow-y-auto">
                            {users.filter(u => u.role === 'admin' && !projectAssignments.some(a => a.project_id === assigningProject.id && a.user_id === u.id)).map(squadMember => (
                                <button 
                                    key={squadMember.id} 
                                    onClick={() => handleAssignTeam(assigningProject.id, squadMember.id)}
                                    className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-secondary/50 border border-transparent hover:border-border transition-all group"
                                >
                                    <div className="w-12 h-12 rounded-full bg-secondary overflow-hidden border border-border group-hover:border-primary/50 transition-colors">
                                        {squadMember.avatar_url ? (
                                            <img src={squadMember.avatar_url} alt={squadMember.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-primary font-bold">{squadMember.name.charAt(0)}</div>
                                        )}
                                    </div>
                                    <div className="text-left flex-1">
                                        <p className="text-[14px] font-bold text-foreground">{squadMember.name}</p>
                                        <p className="text-[11px] text-muted-foreground">{squadMember.position || (squadMember.role === 'admin' ? 'Administrador' : 'Observador / Cliente')}</p>
                                    </div>
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Plus size={16} />
                                    </div>
                                </button>
                            ))}
                            {users.filter(u => !projectAssignments.some(a => a.project_id === assigningProject.id && a.user_id === u.id)).length === 0 && (
                                <p className="text-center py-8 text-[13px] text-muted-foreground italic">Todos os membros disponíveis já foram atribuídos a este projeto.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: Adicionar Integrante Existente */}
            {showAddTeamMember && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fade-in">
                    <div className="bg-card border border-border rounded-3xl w-full max-w-md shadow-2xl relative overflow-hidden">
                        <div className="p-8 border-b border-border bg-secondary/10 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-black text-foreground tracking-tight uppercase">Integrar Especialista</h3>
                                <p className="text-[12px] text-muted-foreground mt-1 font-medium">Promova um usuário existente (Requer status de Super Admin)</p>
                            </div>
                            <button onClick={() => setShowAddTeamMember(false)} className="text-muted-foreground hover:text-foreground bg-background p-2 rounded-xl border border-border shadow-sm transition-all hover:rotate-90"><X size={18} /></button>
                        </div>
                        <div className="p-6 space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                            {users.filter(u => u.role === 'client').map(client => (
                                <button 
                                    key={client.id} 
                                    onClick={() => handlePromoteUser(client)}
                                    className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-primary/5 border border-transparent hover:border-primary/20 transition-all group"
                                >
                                    <div className="w-12 h-12 rounded-full bg-secondary overflow-hidden border border-border group-hover:border-primary/50 transition-colors">
                                        {client.avatar_url ? (
                                            <img src={client.avatar_url} alt={client.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-primary/40 font-black text-lg">{client.name.charAt(0)}</div>
                                        )}
                                    </div>
                                    <div className="text-left flex-1">
                                        <p className="text-[14px] font-black text-foreground group-hover:text-primary transition-colors">{client.name}</p>
                                        <p className="text-[11px] text-muted-foreground font-mono">{client.email}</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
                                        <Plus size={18} />
                                    </div>
                                </button>
                            ))}
                            {users.filter(u => u.role === 'client').length === 0 && (
                                <div className="text-center py-10 space-y-3">
                                    <Users size={40} className="mx-auto text-muted-foreground/20" />
                                    <p className="text-[13px] text-muted-foreground italic font-medium px-10">Não há usuários comuns para promover. Crie um novo usuário primeiro.</p>
                                </div>
                            )}
                        </div>
                        <div className="p-6 bg-secondary/10 border-t border-border flex justify-center">
                            <button onClick={() => { setShowAddTeamMember(false); setShowNewClient(true); }} className="text-[12px] font-black text-primary uppercase tracking-widest hover:underline">+ Criar Novo Usuário</button>
                        </div>
                    </div>
                </div>
            )}

            <ImageCropperModal 
                open={showCropper}
                onClose={() => {
                    setShowCropper(false);
                    setCropperTarget(null);
                }}
                onCropComplete={handleCropComplete}
            />
        </div>
    )
}
