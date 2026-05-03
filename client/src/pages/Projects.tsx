import { useEffect, useRef, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import type { Project } from "../types"
import { ArrowDownToLine, Eye, EyeOff, Maximize, Monitor, Smartphone, Tablet, Loader2, Save, MessageSquare, X } from "lucide-react"
import Sidebar from "../components/Sidebar"
import ProjectPreview, { type ProjectPreviewRef } from "../components/ProjectPreview"
import api from "@/configs/axios"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"

const Projects = () => {
    const { projectId } = useParams()
    const navigate = useNavigate()
    const { data: session, isPending } = authClient.useSession()

    const [project, setProject] = useState<Project | null>(null)
    const [loading, setLoading] = useState(true)
    const [isGenerating, setIsGenerating] = useState(true)
    const [device, setDevice] = useState<'phone' | 'tablet' | 'desktop'>("desktop")
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const previewRef = useRef<ProjectPreviewRef>(null)

    const fetchProject = async () => {
        try {
            const { data } = await api.get(`/api/user/project/${projectId}`);
            setProject(data.project)
            setIsGenerating(data.project.current_code ? false : true)
            setLoading(false)
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }, message?: string };
            toast.error(err?.response?.data?.message || err.message || "An error occurred");
            setLoading(false)
        }
    }
    const saveProject = async () => {
        if (!previewRef.current) return;
        const code = previewRef.current.getCode();
        if (!code) return;
        setIsSaving(true);
        try {
            const { data } = await api.put(`/api/project/save/${projectId}`, { code });
            toast.success(data.message)
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }, message?: string };
            toast.error(err?.response?.data?.message || err.message || "An error occurred");
        } finally {
            setIsSaving(false);
        }
    }

    const downloadCode = () => {
        const code = previewRef.current?.getCode() || project?.current_code;
        if (!code) return;
        const element = document.createElement('a');
        const file = new Blob([code], { type: "text/html" });
        element.href = URL.createObjectURL(file)
        element.download = "index.html"
        document.body.appendChild(element)
        element.click();
    }

    const togglePublish = async () => {
        try {
            const { data } = await api.get(`/api/user/publish-toggle/${projectId}`);
            toast.success(data.message)
            setProject((prev) => prev ? ({ ...prev, isPublished: !prev.isPublished }) : null)
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }, message?: string };
            toast.error(err?.response?.data?.message || err.message || "An error occurred");
        }
    }

    useEffect(() => {
        if (session?.user) fetchProject();
        else if (!isPending && !session?.user) { navigate("/"); toast("Please login"); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session?.user, isPending])

    useEffect(() => {
        if (project && !project.current_code) {
            const intervalId = setInterval(fetchProject, 10000);
            return () => clearInterval(intervalId)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [project])

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen gap-4 bg-[var(--bg-primary)]">
                <Loader2 className="size-8 animate-spin" style={{ color: 'var(--accent-violet)' }} />
                <p className="text-sm font-mono" style={{ color: 'var(--text-muted)' }}>Loading editor...</p>
            </div>
        )
    }

    return project ? (
        <div className="flex flex-col h-screen w-full bg-[var(--bg-primary)]">
            {/* Toolbar */}
            <div className="flex max-sm:flex-col sm:items-center gap-4 px-4 py-2.5 z-10" style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-dim)' }}>
                {/* Left */}
                <div className="flex items-center gap-3 sm:min-w-[280px]">
                    <div onClick={() => navigate('/')} className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
                        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', color: 'var(--accent-violet)' }}>
                        <span className="font-bold font-mono text-xs">AI</span>
                    </div>
                    <div className="max-w-[200px]">
                        <p className="text-[13px] font-semibold truncate">{project.name}</p>
                        <p className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>Draft • Saved</p>
                    </div>
                    <div className="sm:hidden flex-1 flex justify-end">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-1.5 rounded-md btn-ghost">
                            {isMenuOpen ? <X size={16} /> : <MessageSquare size={16} />}
                        </button>
                    </div>
                </div>

                {/* Middle - Device switcher */}
                <div className="hidden sm:flex p-1 rounded-lg gap-1 mx-auto" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                    {[
                        { icon: Smartphone, value: 'phone' as const },
                        { icon: Tablet, value: 'tablet' as const },
                        { icon: Monitor, value: 'desktop' as const },
                    ].map(({ icon: Icon, value }) => (
                        <button key={value} onClick={() => setDevice(value)}
                            className={`p-1.5 rounded-md transition-all ${device === value ? 'bg-violet-500/10 text-violet-400' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}>
                            <Icon size={16} />
                        </button>
                    ))}
                </div>

                {/* Right */}
                <div className="flex items-center justify-end gap-2 flex-1">
                    <button onClick={saveProject} disabled={isSaving} className="max-sm:hidden btn-ghost px-3 py-1.5 flex items-center gap-2 rounded-lg text-xs font-medium">
                        {isSaving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />} Save
                    </button>
                    <Link target='_blank' to={`/preview/${projectId}`} className="btn-ghost px-3 py-1.5 flex items-center gap-2 rounded-lg text-xs font-medium">
                        <Maximize size={14} /> Preview
                    </Link>
                    <button onClick={downloadCode} className="btn-glow px-3 py-1.5 flex items-center gap-2 rounded-lg text-xs font-semibold">
                        <ArrowDownToLine size={14} /> Download
                    </button>
                    <button onClick={togglePublish} className="btn-ghost px-3 py-1.5 flex items-center gap-2 rounded-lg text-xs font-medium">
                        {project.isPublished ? <EyeOff size={14} /> : <Eye size={14} />}
                        {project.isPublished ? "Unpublish" : "Publish"}
                    </button>
                </div>
            </div>

            {/* Main Area */}
            <div className="flex-1 flex overflow-hidden relative">
                <Sidebar isMenuOpen={isMenuOpen} project={project} setProject={(p) => setProject(p)} isGenerating={isGenerating} setIsGenerating={setIsGenerating} />
                <div className="flex-1 p-2 h-full flex flex-col relative z-0">
                    <div className="absolute inset-0 dot-grid opacity-20 pointer-events-none" />
                    <ProjectPreview ref={previewRef} project={project} isGenerating={isGenerating} device={device} />
                </div>
            </div>
        </div>
    ) : (
        <div className="flex flex-col items-center justify-center h-screen gap-4 bg-[var(--bg-primary)]">
            <X className="size-12" style={{ color: 'var(--text-muted)' }} />
            <p className="text-xl font-bold">Project not found</p>
            <button onClick={() => navigate('/')} className="btn-glow px-6 py-2.5 rounded-xl text-sm font-semibold">Go Home</button>
        </div>
    )
}

export default Projects