"use client"

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, X, Send, User, Loader2, Sparkles, ChevronRight, HelpCircle } from 'lucide-react'
import type { Project } from '@/lib/types'

interface Message {
    role: 'user' | 'assistant'
    content: string
}

interface Step {
    title: string
    content: string
    target?: string
}

export default function NordyAssistant({ project, tourCompleted, tourEnabled = true }: { project: Project | null, tourCompleted?: boolean, tourEnabled?: boolean }) {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isTutorial, setIsTutorial] = useState(false)
    const [tutorialStep, setTutorialStep] = useState(0)
    const [spotlight, setSpotlight] = useState<{ top: number, left: number, width: number, height: number } | null>(null)
    const [bubblePos, setBubblePos] = useState<'top' | 'bottom' | 'left' | 'right'>('bottom')
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const tutorialSteps: Step[] = [
        {
            title: "Bem-vindo ao seu Portal!",
            content: "Olá! Eu sou o Nordy. Vou te mostrar como acompanhar seu projeto de forma profissional aqui na Nordex Tech. Pronto?",
            target: "tour-welcome"
        },
        {
            title: "Ambientes de Visualização",
            content: "Aqui no menu lateral, ficam os botões 'Stage' e 'Prod'. O Stage é para você testar novidades em primeira mão, e o Prod é o link em produção!",
            target: "tour-env-links"
        },
        {
            title: "Squad Especialista",
            content: "Abaixo dos ambientes, você vê quem são os especialistas Nordex cuidando do seu projeto. Um clique revela o perfil deles!",
            target: "tour-squad"
        },
        {
            title: "Linha do Tempo (Pipeline)",
            content: "Aqui à esquerda, você vê exatamente em qual etapa seu projeto está. De 'Briefing' até 'Lançamento', controle total.",
            target: "tour-pipeline"
        },
        {
            title: "Histórico e Aprovações",
            content: "Neste painel principal, postamos cada avanço do desenvolvimento. Você pode aprovar etapas ou solicitar ajustes. Sua opinião guia o projeto!",
            target: "tour-updates"
        },
        {
            title: "Dúvidas? Fale comigo!",
            content: "Sempre que precisar de algo ou tiver uma dúvida técnica, é só me chamar aqui. Finalizamos nosso tour! Como posso te ajudar agora?",
            target: "tour-nordy-trigger"
        }
    ]

    useEffect(() => {
        // Automatic Trigger: Only if NOT completed in DB, project exists, and tour logic is enabled
        if (tourCompleted === false && project && tourEnabled) {
            const timer = setTimeout(() => {
                startTutorial()
            }, 1500)
            return () => clearTimeout(timer)
        }
    }, [project, tourCompleted, tourEnabled])

    const startTutorial = () => {
        setIsTutorial(true)
        setTutorialStep(0)
        // Ensure Nordy icon is visible but chat isn't taking over
        setIsOpen(false) 
    }

    const updateSpotlight = () => {
        if (!isTutorial || !tutorialSteps[tutorialStep].target) {
            setSpotlight(null)
            return
        }

        const el = document.getElementById(tutorialSteps[tutorialStep].target!)
        if (el) {
            const rect = el.getBoundingClientRect()
            
            // Fixed positioning means we only care about viewport-relative rect
            setSpotlight({
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height
            })

            const midX = rect.left + rect.width / 2
            const midY = rect.top + rect.height / 2
            const winW = window.innerWidth
            const winH = window.innerHeight

            // Determine best bubble position based on viewport quadrants
            if (midX < winW / 3) setBubblePos('right')
            else if (midX > (2 * winW) / 3) setBubblePos('left')
            else if (midY > winH / 2) setBubblePos('top')
            else setBubblePos('bottom')
        } else {
            setSpotlight(null)
        }
    }

    useEffect(() => {
        if (isTutorial) {
            // Initial position
            updateSpotlight()
            
            setIsOpen(false)

            // Dynamic sync during interactions
            window.addEventListener('scroll', updateSpotlight, { passive: true })
            window.addEventListener('resize', updateSpotlight, { passive: true })
            
            const targetEl = tutorialSteps[tutorialStep].target 
                ? document.getElementById(tutorialSteps[tutorialStep].target!) 
                : null
                
            if (targetEl) {
                targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
                // Re-sync after scroll animation finishes
                const timer = setTimeout(updateSpotlight, 800)
                return () => {
                    clearTimeout(timer)
                    window.removeEventListener('scroll', updateSpotlight)
                    window.removeEventListener('resize', updateSpotlight)
                }
            }

            return () => {
                window.removeEventListener('scroll', updateSpotlight)
                window.removeEventListener('resize', updateSpotlight)
            }
        }
    }, [tutorialStep, isTutorial])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSend = async (text: string = input) => {
        if (!text.trim() || isLoading) return
        
        const newMessages: Message[] = [...messages, { role: 'user', content: text }]
        setMessages(newMessages)
        setInput('')
        setIsLoading(true)

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    messages: newMessages,
                    context: `O usuário está no Portal do Cliente da Nordex Tech. O projeto atual é "${project?.name}". Descrição: ${project?.description}.`
                }),
            })
            const data = await res.json()
            setMessages(prev => [...prev, { role: 'assistant', content: data.reply || "Desculpe, tive um pequeno curto-circuito. Pode repetir?" }])
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Ops! Minha conexão falhou. Tente novamente em instantes." }])
        } finally {
            setIsLoading(false)
        }
    }

    const nextTutorialStep = async () => {
        if (tutorialStep < tutorialSteps.length - 1) {
            setTutorialStep(tutorialStep + 1)
        } else {
            setIsTutorial(false)
            setSpotlight(null)
            
            // Persist completion in DB
            try {
                await fetch('/api/dashboard/tour-status', { method: 'POST' })
            } catch (err) {
                console.error('Failed to save tour status', err)
            }

            setIsOpen(true) // Open chat at the end to say goodbye
            setMessages([{ role: 'assistant', content: "Ótimo! Agora você já sabe como tudo funciona por aqui. Explore seu novo painel e me chame se precisar!" }])
        }
    }

    return (
        <>
            {/* 1. Professional Spotlight & Bubble Tour */}
            <AnimatePresence>
                {isTutorial && (
                    <div className="fixed inset-0 z-[200] pointer-events-none">
                        {/* Semi-transparent Overlay */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/10 pointer-events-auto cursor-pointer" 
                            onClick={nextTutorialStep}
                        />
                        
                        {/* The Spotlight Highlighting the Element */}
                        {spotlight && (
                            <motion.div
                                animate={{
                                    top: spotlight.top - 12,
                                    left: spotlight.left - 12,
                                    width: spotlight.width + 24,
                                    height: spotlight.height + 24,
                                }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                className="fixed bg-transparent border-2 border-primary shadow-[0_0_0_9999px_rgba(0,0,0,0.3)] rounded-2xl z-[201] pointer-events-none"
                            >
                                <motion.div 
                                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                    className="absolute -inset-2 border border-primary/50 rounded-[20px]" 
                                />
                            </motion.div>
                        )}

                        {/* Speech Bubble (Nordy Popover) */}
                        <motion.div
                            key={tutorialStep}
                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                            animate={{ 
                                opacity: 1, 
                                scale: 1, 
                                y: 0,
                                top: spotlight 
                                    ? (window.innerWidth < 640 
                                        ? 'auto' 
                                        : Math.max(20, Math.min(window.innerHeight - (bubblePos === 'top' ? 320 : 280), 
                                            bubblePos === 'top' ? spotlight.top - 280 : (bubblePos === 'bottom' ? spotlight.top + spotlight.height + 40 : spotlight.top + (spotlight.height / 2) - 130)
                                          )))
                                    : '50%',
                                bottom: (window.innerWidth < 640 && spotlight) ? 40 : 'auto',
                                left: spotlight 
                                    ? (window.innerWidth < 640 
                                        ? '50%' 
                                        : Math.max(20, Math.min(window.innerWidth - 370, 
                                            bubblePos === 'left' ? spotlight.left - 380 : (bubblePos === 'right' ? spotlight.left + spotlight.width + 40 : spotlight.left + (spotlight.width / 2) - 175)
                                          )))
                                    : '50%',
                                x: spotlight ? (window.innerWidth < 640 ? '-50%' : 0) : '-50%',
                                marginTop: spotlight ? 0 : '-100px'
                            }}
                            className="fixed z-[210] w-[calc(100vw-32px)] sm:w-[350px] pointer-events-auto"
                        >
                            <div className="relative p-5 sm:p-6 bg-card/85 backdrop-blur-2xl border border-primary/20 rounded-[24px] sm:rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden group">
                                {/* Professional Glass Effects */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10" />
                                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
                                
                                <div className="flex gap-4 items-start relative z-10">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                                        <Bot size={window.innerWidth < 640 ? 20 : 24} className="text-primary-foreground" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-primary mb-1.5 sm:mb-2 italic">
                                            {tutorialSteps[tutorialStep].title}
                                        </h4>
                                        <p className="text-[14px] sm:text-[15px] font-medium leading-relaxed text-foreground/95">
                                            {tutorialSteps[tutorialStep].content}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-6 sm:mt-8 flex items-center justify-between relative z-10">
                                    <div className="flex gap-1.5">
                                        {tutorialSteps.map((_, i) => (
                                            <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === tutorialStep ? 'w-6 sm:w-8 bg-primary shadow-[0_0_8px_rgba(245,168,0,0.4)]' : 'w-1.5 sm:w-2 bg-primary/10'}`} />
                                        ))}
                                    </div>
                                    <button 
                                        onClick={nextTutorialStep}
                                        className="h-9 sm:h-11 px-4 sm:px-6 bg-primary text-primary-foreground text-[12px] sm:text-[13px] font-bold rounded-full flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/10"
                                    >
                                        <span className="truncate">{tutorialStep === tutorialSteps.length - 1 ? 'Começar' : 'Próximo'}</span>
                                        <ChevronRight size={14} className="shrink-0" />
                                    </button>
                                </div>
                            </div>
                            
                            {/* Professional Bubble Arrow - Hidden on Mobile */}
                            {spotlight && window.innerWidth >= 640 && (
                                <div className={`absolute w-5 h-5 bg-card/85 border-primary/20 border transform rotate-45 z-[-1] ${
                                    bubblePos === 'top' ? 'bottom-[-10px] left-1/2 -translate-x-1/2 border-t-0 border-l-0' :
                                    bubblePos === 'bottom' ? 'top-[-10px] left-1/2 -translate-x-1/2 border-b-0 border-r-0' :
                                    bubblePos === 'left' ? 'right-[-10px] top-1/2 -translate-y-1/2 border-b-0 border-l-0' :
                                    'left-[-10px] top-1/2 -translate-y-1/2 border-t-0 border-r-0'
                                }`} />
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* Nordy Floating Trigger */}
            <motion.div 
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.1 }}
                className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[110]"
            >
                <button
                    id="tour-nordy-trigger"
                    onClick={() => setIsOpen(!isOpen)}
                    className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary text-primary-foreground shadow-[0_0_30px_rgba(245,168,0,0.4)] flex items-center justify-center group overflow-hidden"
                >
                    <motion.div
                        animate={{ 
                            y: [0, -4, 0],
                            rotate: [0, -5, 5, 0]
                        }}
                        transition={{ 
                            duration: 4, 
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    >
                        {isOpen ? <X size={24} className="sm:size-[28px]" /> : <Bot size={24} className="sm:size-[28px]" />}
                    </motion.div>
                    
                    {/* Decorative Ring */}
                    <div className="absolute inset-0 border-2 border-primary-foreground/20 rounded-full animate-ping opacity-20" />
                </button>
                
                {/* Status Badge */}
                {!isOpen && (
                    <div className="absolute top-0 right-0 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-green-500 border-2 border-background rounded-full" />
                )}
            </motion.div>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9, x: 20 }}
                        animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9, x: 20 }}
                        className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-[110] w-[calc(100vw-32px)] sm:w-[380px] h-[70vh] sm:h-[550px] bg-card border border-border rounded-2xl sm:rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.4)] flex flex-col overflow-hidden backdrop-blur-xl"
                    >
                        {/* Header */}
                        <div className="p-3 sm:p-4 bg-primary text-primary-foreground flex items-center justify-between shadow-lg shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center relative">
                                    <Bot size={20} />
                                    <motion.div 
                                        animate={{ scale: [1, 1.2, 1] }} 
                                        transition={{ repeat: Infinity, duration: 2 }}
                                        className="absolute -top-1 -right-1"
                                    >
                                        <Sparkles size={12} className="text-yellow-300" />
                                    </motion.div>
                                </div>
                                <div>
                                    <p className="font-bold text-[14px] leading-none">Nordy</p>
                                    <p className="text-[11px] opacity-80 mt-1">Seu Guia de Tecnologia</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button 
                                    onClick={startTutorial} 
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-[11px] font-bold transition-all mr-2"
                                    title="Reiniciar Tour"
                                >
                                    <HelpCircle size={14} />
                                    <span>Tour</span>
                                </button>
                                <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-2 rounded-full transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-background/30">
                            {messages.map((msg, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[85%] p-3 rounded-2xl text-[13.5px] leading-relaxed shadow-sm ${
                                        msg.role === 'user' 
                                        ? 'bg-primary text-primary-foreground rounded-tr-none' 
                                        : 'bg-secondary border border-border/50 text-foreground rounded-tl-none'
                                    }`}>
                                        {msg.content}
                                    </div>
                                </motion.div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-secondary border border-border/50 p-3 rounded-2xl rounded-tl-none flex items-center gap-2">
                                        <Loader2 size={14} className="animate-spin text-primary" />
                                        <span className="text-[12px] text-muted-foreground italic">Processando...</span>
                                    </div>
                                </div>
                            )}
                            {!isTutorial && messages.length === 1 && (
                                <div className="px-4 pb-4">
                                    <button 
                                        onClick={startTutorial}
                                        className="w-full py-3 bg-primary/10 border border-primary/20 rounded-xl text-primary text-[13px] font-bold flex items-center justify-center gap-2 hover:bg-primary/20 transition-all"
                                    >
                                        <Sparkles size={16} />
                                        Fazer o Tour pelo Portal
                                    </button>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Tutorial Controls */}
                        {isTutorial && (
                            <div className="px-4 py-3 bg-primary/5 border-y border-primary/10 flex items-center justify-between">
                                <div className="flex gap-1">
                                    {tutorialSteps.map((_, i) => (
                                        <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === tutorialStep ? 'bg-primary w-4' : 'bg-primary/20'}`} />
                                    ))}
                                </div>
                                <button 
                                    onClick={nextTutorialStep}
                                    className="px-3 py-1.5 bg-primary text-primary-foreground text-[12px] font-bold rounded-lg flex items-center gap-1 hover:opacity-90 transition-opacity"
                                >
                                    {tutorialStep === tutorialSteps.length - 1 ? 'Concluir' : 'Próximo'}
                                    <ChevronRight size={14} />
                                </button>
                            </div>
                        )}

                        {/* Input Area */}
                        {!isTutorial && (
                            <div className="p-4 bg-card border-t border-border">
                                <div className="relative">
                                    <input 
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                        placeholder="Tire uma dúvida sobre seu projeto..."
                                        className="w-full bg-background border border-border rounded-xl px-4 py-3 pr-12 text-[13px] outline-none focus:border-primary transition-colors pr-10"
                                    />
                                    <button 
                                        onClick={() => handleSend()}
                                        disabled={isLoading || !input.trim()}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-primary text-primary-foreground rounded-lg flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-40"
                                    >
                                        <Send size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
