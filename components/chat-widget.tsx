"use client"

import { useState, useRef, useEffect } from "react"
import { MessageCircle, X, Send, Bot, User, Loader2 } from "lucide-react"

interface Message {
    role: "user" | "assistant"
    content: string
}

export function ChatWidget() {
    const [open, setOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content: "Olá! Sou o Nordy, assistente virtual da Nordex Tech! Fico feliz em te ajudar. Pode perguntar o que quiser sobre a nossa empresa, serviços ou equipe!",
        },
    ])
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)
    const bottomRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages, open])

    useEffect(() => {
        const handleOpenChat = () => setOpen(true)
        window.addEventListener("open-nordy-chat", handleOpenChat)
        return () => window.removeEventListener("open-nordy-chat", handleOpenChat)
    }, [])

    async function handleSend() {
        const text = input.trim()
        if (!text || loading) return

        const newMessages: Message[] = [...messages, { role: "user", content: text }]
        setMessages(newMessages)
        setInput("")
        setLoading(true)

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: newMessages }),
            })
            const data = await res.json()
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: data.reply || data.error || "Erro ao obter resposta." },
            ])
        } catch {
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: "Erro de conexão. Tente novamente." },
            ])
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            {/* Botão flutuante */}
            <button
                onClick={() => setOpen((v) => !v)}
                aria-label="Abrir chat"
                className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:opacity-90 transition-all duration-300 hover:scale-105 cursor-pointer"
                style={{ boxShadow: "0 0 0 4px oklch(0.78 0.18 80 / 0.2)" }}
            >
                {open ? <X size={22} /> : <MessageCircle size={22} />}
            </button>

            {/* Janela do chat */}
            {open && (
                <div className="fixed bottom-24 right-6 z-50 w-[350px] max-h-[520px] flex flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                    {/* Header */}
                    <div className="flex items-center gap-3 px-4 py-3 bg-primary text-primary-foreground shrink-0">
                        <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                            <Bot size={16} />
                        </div>
                        <div>
                            <p className="text-sm font-bold leading-none">Nordy</p>
                            <p className="text-xs opacity-75 mt-0.5">Assistente Virtual Nordex Tech</p>
                        </div>
                        <div className="ml-auto w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    </div>

                    {/* Mensagens */}
                    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 min-h-0">
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`flex items-start gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                            >
                                <div
                                    className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${msg.role === "user"
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-primary/15 text-primary"
                                        }`}
                                >
                                    {msg.role === "user" ? <User size={13} /> : <Bot size={13} />}
                                </div>
                                <div
                                    className={`max-w-[80%] px-3 py-2 rounded-xl text-sm leading-relaxed ${msg.role === "user"
                                        ? "bg-primary text-primary-foreground rounded-tr-none"
                                        : "bg-secondary text-foreground rounded-tl-none"
                                        }`}
                                    style={{ wordBreak: "break-word" }}
                                >
                                    {msg.content.split(/(https?:\/\/[^\s]+|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g).map((part, index) => {
                                        if (part.match(/^https?:\/\//)) {
                                            return (
                                                <a key={index} href={part} target="_blank" rel="noopener noreferrer" className="underline font-medium hover:opacity-80 transition-opacity">
                                                    {part}
                                                </a>
                                            )
                                        } else if (part.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
                                            return (
                                                <a key={index} href={`mailto:${part}`} className="underline font-medium hover:opacity-80 transition-opacity">
                                                    {part}
                                                </a>
                                            )
                                        }
                                        return <span key={index}>{part}</span>
                                    })}
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="flex items-start gap-2">
                                <div className="w-7 h-7 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0">
                                    <Bot size={13} />
                                </div>
                                <div className="bg-secondary px-3 py-2 rounded-xl rounded-tl-none flex items-center gap-1.5">
                                    <Loader2 size={14} className="animate-spin text-primary" />
                                    <span className="text-xs text-muted-foreground">Digitando...</span>
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* Input */}
                    <div className="px-3 py-3 border-t border-border bg-background shrink-0">
                        <div className="flex gap-2">
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                                placeholder="Digite sua pergunta..."
                                className="flex-1 px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                                disabled={loading}
                            />
                            <button
                                onClick={handleSend}
                                disabled={loading || !input.trim()}
                                className="w-9 h-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-40 shrink-0 cursor-pointer disabled:cursor-not-allowed"
                            >
                                <Send size={15} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
