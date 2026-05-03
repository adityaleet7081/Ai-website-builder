import React, { useEffect, useRef, useState } from "react"
import type { Message, Project, Version } from "../types";
import { Bot, Eye, Loader2, Send, User, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import api from "@/configs/axios";
import { toast } from "sonner";

interface SidebarProps {
    isMenuOpen: boolean;
    project: Project;
    setProject: (project: Project) => void;
    isGenerating: boolean;
    setIsGenerating: (isGenerating: boolean) => void;
}

const Sidebar = ({ isMenuOpen, project, setProject, isGenerating, setIsGenerating }: SidebarProps) => {
    const messageRef = useRef<HTMLDivElement>(null)
    const [input, setInput] = useState('')

    const fetchProject = async () => {
        try {
            const { data } = await api.get(`/api/user/project/${project.id}`)
            setProject(data.project)
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }, message?: string };
            toast.error(err?.response?.data?.message || err.message || "An error occurred");
        }
    }

    const handleRollback = async (versionId: string) => {
        try {
            const confirm = window.confirm('Roll back to this version?')
            if (!confirm) return;
            setIsGenerating(true)
            const { data } = await api.get(`/api/project/rollback/${project.id}/${versionId}`);
            const { data: data2 } = await api.get(`/api/user/project/${project.id}`);
            toast.success(data.message)
            setProject(data2.project)
            setIsGenerating(false)
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }, message?: string };
            setIsGenerating(false)
            toast.error(err?.response?.data?.message || err.message || "An error occurred");
        }
    }

    const handleRevisions = async (e: React.FormEvent) => {
        e.preventDefault()
        let interval: number | undefined;
        try {
            setIsGenerating(true);
            interval = window.setInterval(fetchProject, 10000)
            const { data } = await api.post(`/api/project/revision/${project.id}`, { message: input })
            await fetchProject();
            toast.success(data.message)
            setInput('')
            clearInterval(interval)
            setIsGenerating(false)
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }, message?: string };
            toast.error(err?.response?.data?.message || err.message || "An error occurred");
            clearInterval(interval)
        }
    }

    useEffect(() => {
        if (messageRef.current) messageRef.current.scrollIntoView({ behavior: 'smooth' })
    }, [project.conversation.length, isGenerating])

    return (
        <div className={`h-full z-10 transition-all duration-300 ${isMenuOpen ? 'w-0 opacity-0 overflow-hidden sm:w-80 sm:opacity-100' : 'w-full sm:w-80'}`}
            style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border-dim)' }}>
            <div className="flex flex-col h-full">
                {/* Header */}
                <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: 'var(--border-dim)' }}>
                    <Sparkles className="size-4" style={{ color: 'var(--accent-violet)' }} />
                    <span className="text-[13px] font-semibold uppercase tracking-widest">AI Assistant</span>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto no-scrollbar p-4 flex flex-col gap-4">
                    {[...project.conversation, ...project.versions]
                        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()).map((message) => {
                            const isMessage = 'content' in message;
                            if (isMessage) {
                                const msg = message as Message;
                                const isUser = msg.role === 'user';
                                return (
                                    <div key={msg.id} className={`flex items-start gap-2.5 ${isUser ? "justify-end" : "justify-start"} anim-fadeUp`}>
                                        {!isUser && (
                                            <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(124,58,237,0.1)' }}>
                                                <Bot className="size-3" style={{ color: 'var(--accent-violet)' }} />
                                            </div>
                                        )}
                                        <div className={`max-w-[85%] p-3 text-[13px] leading-relaxed rounded-xl ${isUser ? "rounded-tr-sm" : "rounded-tl-sm"}`}
                                            style={isUser ? { background: 'var(--accent-violet)', color: 'white' } : { background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                                            {msg.content}
                                        </div>
                                        {isUser && (
                                            <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                                                <User className="size-3" style={{ color: 'var(--text-muted)' }} />
                                            </div>
                                        )}
                                    </div>
                                )
                            } else {
                                const ver = message as Version;
                                return (
                                    <div key={ver.id} className="w-[90%] mx-auto my-2 p-3 rounded-xl flex flex-col gap-2 anim-fadeIn"
                                        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                                        <div className="text-[11px] font-mono" style={{ color: 'var(--accent-cyan)' }}>
                                            <span className="font-semibold">v.updated</span>
                                            <span className="block mt-0.5" style={{ color: 'var(--text-muted)' }}>{new Date(ver.timestamp).toLocaleTimeString()}</span>
                                        </div>
                                        <div className="flex items-center justify-between mt-1">
                                            {project.current_version_index === ver.id ? (
                                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase" style={{ background: 'rgba(6,182,212,0.1)', color: 'var(--accent-cyan)' }}>Current</span>
                                            ) : (
                                                <button onClick={() => handleRollback(ver.id)} className="px-2 py-1 rounded text-[11px] font-semibold transition-colors hover:bg-white/5"
                                                    style={{ border: '1px solid var(--border-dim)' }}>Roll back</button>
                                            )}
                                            <Link target="_blank" to={`/preview/${project.id}/${ver.id}`} className="p-1 rounded hover:bg-white/5 transition-colors">
                                                <Eye className="size-4" style={{ color: 'var(--text-muted)' }} />
                                            </Link>
                                        </div>
                                    </div>
                                )
                            }
                        })}
                    {isGenerating && (
                        <div className="flex items-start gap-2.5 justify-start">
                            <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(124,58,237,0.1)' }}>
                                <Bot className="size-3" style={{ color: 'var(--accent-violet)' }} />
                            </div>
                            <div className="flex gap-1 h-full items-center p-2 rounded-xl" style={{ background: 'var(--bg-card)' }}>
                                <span className="size-1.5 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: '0s' }} />
                                <span className="size-1.5 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: '0.2s' }} />
                                <span className="size-1.5 rounded-full bg-pink-500 animate-bounce" style={{ animationDelay: '0.4s' }} />
                            </div>
                        </div>
                    )}
                    <div ref={messageRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleRevisions} className="p-4 pt-2">
                    <div className="relative">
                        <textarea onChange={(e) => setInput(e.target.value)} value={input} rows={2}
                            placeholder="Ask AI to change..." disabled={isGenerating}
                            className="input-dark w-full p-3 pr-10 rounded-xl resize-none text-[13px]" />
                        <button disabled={isGenerating || !input.trim()}
                            className="absolute bottom-2.5 right-2.5 p-1.5 rounded-lg disabled:opacity-30 transition-all text-white"
                            style={input.trim() ? { background: 'var(--accent-violet)' } : { background: 'var(--border-subtle)' }}>
                            {isGenerating ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
export default Sidebar