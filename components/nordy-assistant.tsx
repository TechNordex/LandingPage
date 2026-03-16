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

export default function NordyAssistant({ project }: { project: Project | null }) {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isTutorial, setIsTutorial] = useState(false)
    const [tutorialStep, setTutorialStep] = useState(0)
    const [spotlight, setSpotlight] = useState<{ top: number, left: number, width: number, height: number } | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const tutorialSteps: Step[] = [
        {
            title: "Bem-vindo ao seu Portal!",
            content: "Olá! Eu sou o Nordy. Vou te mostrar como acompanhar seu projeto de forma profissional aqui na Nordex Tech. Pronto?",
        },
        {
            title: "Ambientes de Visualização",
            content: "Aqui no topo, você encontra os botões 'Stage' e 'Prod'. O Stage é para você testar as novidades em primeira mão e o Prod é o link oficial!",
            target: "tour-env-links"
        },
        {
            title: "Squad Especialista",
            content: "Logo abaixo, você vê quem são os especialistas cuidando de cada detalhe com carinho. Sua equipe está sempre a um clique!",
            target: "tour-squad"
        },
        {
            title: "Linha do Tempo (Pipeline)",
            content: "Aqui à esquerda, você vê exatamente em qual etapa seu projeto está. De 'Briefing' até 'Lançamento', controle total.",
            target: "tour-pipeline"
        },
        {
            title: "Histórico e Aprovações",
            content: "No centro, postamos cada avanço. Você pode aprovar etapas ou solicitar ajustes. Sua opinião guia o projeto!",
            target: "tour-updates"
        },
        {
            title: "Dúvidas? Fale comigo!",
            content: "Sempre que precisar de algo ou tiver uma dúvida técnica, é só me chamar aqui. Finalizamos nosso tour! Como posso te ajudar agora?",
        }
    ]

    useEffect(() => {
        // Check if first time
        const hasSeenTutorial = localStorage.getItem('nordy_tutorial_seen')
        if (!hasSeenTutorial && project) {
            setTimeout(() => {
                setIsOpen(true)
                setIsTutorial(true)
                setMessages([{ role: 'assistant', content: tutorialSteps[0].content }])
            }, 2000)
        } else {
            setMessages([{ 
                role: 'assistant', 
                content: `Olá! 😊 Sou o Nordy. Como posso ajudar você hoje com o projeto ${project?.name || 'seu projeto'}?` 
            }])
        }
    }, [project])

    useEffect(() => {
        if (isTutorial && tutorialSteps[tutorialStep].target) {
            const el = document.getElementById(tutorialSteps[tutorialStep].target!)
            if (el) {
                const rect = el.getBoundingClientRect()
                setSpotlight({
                    top: rect.top + window.scrollY,
                    left: rect.left + window.scrollX,
                    width: rect.width,
                    height: rect.height
                })
                el.scrollIntoView({ behavior: 'smooth', block: 'center' })
            } else {
                setSpotlight(null)
            }
        } else {
            setSpotlight(null)
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

    const nextTutorialStep = () => {
        if (tutorialStep < tutorialSteps.length - 1) {
            const nextStep = tutorialStep + 1
            setTutorialStep(nextStep)
            setMessages(prev => [...prev, { role: 'assistant', content: tutorialSteps[nextStep].content }])
        } else {
            setIsTutorial(false)
            setSpotlight(null)
            localStorage.setItem('nordy_tutorial_seen', 'true')
            setMessages(prev => [...prev, { role: 'assistant', content: "Ótimo! Agora você já sabe como tudo funciona. Explore seu novo painel!" }])
        }
    }

    return (
        <>
            {/* Visual Spotlight Overlay */}
            <AnimatePresence>
                {isTutorial && spotlight && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[45] pointer-events-none"
                    >
                        {/* Dimmed background around spotlight */}
                        <div className="absolute inset-0 bg-background/20 backdrop-blur-[2px]" />
                        
                        {/* The Actual Spotlight */}
                        <motion.div
                            animate={{
                                top: spotlight.top - 8,
                                left: spotlight.left - 8,
                                width: spotlight.width + 16,
                                height: spotlight.height + 16,
                            }}
                            className="absolute bg-transparent border-2 border-primary shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] rounded-2xl pointer-events-none z-[46]"
                        >
                            <motion.div 
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="absolute -inset-1 border-2 border-primary rounded-2xl animate-pulse" 
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Nordy Floating Trigger */}
            <motion.div 
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.1 }}
                className="fixed bottom-6 right-6 z-50"
            >
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="relative w-16 h-16 rounded-full bg-primary text-primary-foreground shadow-[0_0_30px_rgba(245,168,0,0.4)] flex items-center justify-center group overflow-hidden"
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
                        {isOpen ? <X size={28} /> : <Bot size={28} />}
                    </motion.div>
                    
                    {/* Decorative Ring */}
                    <div className="absolute inset-0 border-2 border-primary-foreground/20 rounded-full animate-ping opacity-20" />
                </button>
                
                {/* Status Badge */}
                {!isOpen && (
                    <div className="absolute top-0 right-0 w-4 h-4 bg-green-500 border-2 border-background rounded-full" />
                )}
            </motion.div>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9, x: 20 }}
                        animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9, x: 20 }}
                        className="fixed bottom-24 right-6 z-50 w-[380px] h-[550px] bg-card border border-border rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.4)] flex flex-col overflow-hidden backdrop-blur-xl"
                    >
                        {/* Header */}
                        <div className="p-4 bg-primary text-primary-foreground flex items-center justify-between shadow-lg">
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
                            <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-2 rounded-full transition-colors">
                                <X size={20} />
                            </button>
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
