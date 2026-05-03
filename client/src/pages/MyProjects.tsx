import { useState, useEffect } from "react"
import type { Project } from "../types";
import { Loader2Icon, Plus, Trash2, FolderOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import api from "@/configs/axios";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

const MyProjects = () => {
    const { data: session, isPending } = authClient.useSession()
    const [loading, setLoading] = useState(true);
    const [projects, setProjects] = useState<Project[]>([])
    const navigate = useNavigate()

    const fetchProjects = async () => {
        try {
            const { data } = await api.get('/api/user/projects')
            setProjects(data.projects)
            setLoading(false)
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }, message?: string };
            toast.error(err?.response?.data?.message || err.message || "An error occurred");
        }
    }

    const deleteProject = async (projectId: string) => {
        try {
            const confirm = window.confirm('Are you sure you want to delete this project?');
            if (!confirm) return;
            const { data } = await api.delete(`/api/project/${projectId}`)
            toast.success(data.message);
            void fetchProjects()
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }, message?: string };
            toast.error(err?.response?.data?.message || err.message || "An error occurred");
        }
    }

    useEffect(() => {
        if (session?.user && !isPending) void fetchProjects()
        else if (!isPending && !session?.user) { navigate('/'); toast('Please login to view your projects'); }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session?.user, isPending])

    return (
        <>
            <div className="px-4 md:px-16 lg:px-24 xl:px-32 pt-28 relative">
                <div className="fixed inset-0 dot-grid opacity-15 pointer-events-none -z-10" />

                {loading ? (
                    <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
                        <Loader2Icon className="size-8 animate-spin" style={{ color: 'var(--accent-violet)' }} />
                        <p className="text-sm font-mono" style={{ color: 'var(--text-muted)' }}>Loading projects...</p>
                    </div>
                ) : projects.length > 0 ? (
                    <div className="py-6 min-h-[80vh]">
                        <div className="flex items-center justify-between mb-12 anim-fadeUp opacity-0 delay-1">
                            <div>
                                <p className="text-sm font-semibold tracking-widest uppercase mb-2" style={{ color: 'var(--accent-violet)' }}>Dashboard</p>
                                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">My Projects</h1>
                                <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
                            </div>
                            <button onClick={() => navigate('/')} className="btn-glow flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold">
                                <Plus size={16} /> New Project
                            </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {projects.map((project, idx) => (
                                <div onClick={() => navigate(`/projects/${project.id}`)} key={project.id}
                                    className="relative group card overflow-hidden cursor-pointer anim-fadeUp opacity-0"
                                    style={{ animationDelay: `${0.1 + idx * 0.05}s` }}>
                                    <div className="relative w-full h-44 overflow-hidden" style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-dim)' }}>
                                        {project.current_code ? (
                                            <iframe srcDoc={project.current_code} className="absolute top-0 left-0 w-[1200px] h-[800px] origin-top-left pointer-events-none"
                                                sandbox='allow-scripts allow-same-origin' style={{ transform: 'scale(0.25)' }} />
                                        ) : (
                                            <div className="flex items-center justify-center h-full" style={{ color: 'var(--text-muted)' }}>No Preview</div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <h2 className="text-sm font-semibold line-clamp-1 group-hover:text-violet-400 transition-colors">{project.name}</h2>
                                        <p className="mt-1.5 text-xs line-clamp-2" style={{ color: 'var(--text-muted)' }}>{project.initial_prompt}</p>
                                        <div onClick={e => e.stopPropagation()} className="flex justify-between items-center mt-3 pt-3" style={{ borderTop: '1px solid var(--border-dim)' }}>
                                            <span className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>{new Date(project.createdAt).toLocaleDateString()}</span>
                                            <div className="flex gap-1.5">
                                                <button onClick={() => navigate(`/preview/${project.id}`)} className="btn-ghost px-2.5 py-1 rounded-lg text-[11px]">Preview</button>
                                                <button onClick={() => navigate(`/projects/${project.id}`)} className="btn-ghost px-2.5 py-1 rounded-lg text-[11px]">Edit</button>
                                            </div>
                                        </div>
                                    </div>
                                    <div onClick={e => e.stopPropagation()}>
                                        <Trash2 onClick={() => deleteProject(project.id)}
                                            className="absolute top-3 right-3 scale-0 group-hover:scale-100 p-1.5 size-7 rounded-lg cursor-pointer transition-all duration-300 hover:text-red-400"
                                            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
                        <FolderOpen className="size-12" style={{ color: 'var(--text-muted)' }} />
                        <h1 className="text-2xl font-bold">No projects yet</h1>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Create your first AI-powered website</p>
                        <button onClick={() => navigate('/')} className="btn-glow flex items-center gap-2 px-6 py-2.5 mt-2 rounded-xl text-sm font-semibold">
                            <Plus size={16} /> Create Project
                        </button>
                    </div>
                )}
            </div>
            <Footer />
        </>
    )
}

export default MyProjects