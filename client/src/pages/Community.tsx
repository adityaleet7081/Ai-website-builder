import { useState, useEffect } from "react"
import type { Project } from "../types";
import { Loader2Icon, Globe } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import api from "@/configs/axios";
import { toast } from "sonner";

const Community = () => {
    const [loading, setLoading] = useState(true);
    const [projects, setProjects] = useState<Project[]>([])
    const navigate = useNavigate()

    useEffect(() => {
        let cancelled = false;
        const fetchProjects = async () => {
            try {
                const { data } = await api.get('/api/project/published');
                if (!cancelled) {
                    setProjects(data.projects || []);
                    setLoading(false);
                }
            } catch (error: unknown) {
                const err = error as { response?: { data?: { message?: string } }, message?: string };
                if (!cancelled) {
                    setLoading(false);
                    toast.error(err?.response?.data?.message || err.message || "An error occurred");
                }
            }
        }
        fetchProjects();
        return () => { cancelled = true; }
    }, [])

    return (
        <>
            <div className="px-4 md:px-16 lg:px-24 xl:px-32 pt-28 relative">
                <div className="fixed inset-0 dot-grid opacity-15 pointer-events-none -z-10" />
                <div className="fixed w-[400px] h-[400px] top-20 right-0 blob-violet opacity-8 blur-[120px] pointer-events-none -z-10" />

                {loading ? (
                    <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
                        <Loader2Icon className="size-8 animate-spin" style={{ color: 'var(--accent-violet)' }} />
                        <p className="text-sm font-mono" style={{ color: 'var(--text-muted)' }}>Loading projects...</p>
                    </div>
                ) : projects.length > 0 ? (
                    <div className="py-6 min-h-[80vh]">
                        <div className="mb-12 anim-fadeUp opacity-0 delay-1">
                            <p className="text-sm font-semibold tracking-widest uppercase mb-2" style={{ color: 'var(--accent-cyan)' }}>Community</p>
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Explore What Others Built</h1>
                            <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>{projects.length} published projects</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {projects.map((project, idx) => (
                                <Link key={project.id} to={`/view/${project.id}`} target='_blank'
                                    className={`group card overflow-hidden anim-fadeUp opacity-0`}
                                    style={{ animationDelay: `${0.1 + idx * 0.05}s` }}>
                                    <div className="relative w-full h-44 overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
                                        {project.current_code ? (
                                            <iframe srcDoc={project.current_code} className="absolute top-0 left-0 w-[1200px] h-[800px] origin-top-left pointer-events-none"
                                                sandbox='allow-scripts' title={project.name} style={{ transform: 'scale(0.25)' }} />
                                        ) : (
                                            <div className="flex items-center justify-center h-full" style={{ color: 'var(--text-muted)' }}><Globe className="size-8" /></div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#030014] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    </div>
                                    <div className="p-4">
                                        <div className='flex items-start justify-between gap-2'>
                                            <h2 className="text-sm font-semibold line-clamp-1 group-hover:text-violet-400 transition-colors">{project.name}</h2>
                                            <span className="px-2 py-0.5 text-[10px] font-mono rounded-full flex-shrink-0" style={{ background: 'rgba(124,58,237,0.1)', color: 'var(--accent-violet)', border: '1px solid rgba(124,58,237,0.2)' }}>Web</span>
                                        </div>
                                        <p className="mt-1.5 text-xs line-clamp-2" style={{ color: 'var(--text-muted)' }}>{project.initial_prompt}</p>
                                        <div className="flex justify-between items-center mt-3 pt-3" style={{ borderTop: '1px solid var(--border-dim)' }}>
                                            <span className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>{new Date(project.createdAt).toLocaleDateString()}</span>
                                            <div className="flex items-center gap-2 text-xs">
                                                <span className="size-5 rounded-full text-[10px] font-bold flex items-center justify-center" style={{ background: 'var(--accent-violet)', color: 'white' }}>
                                                    {project.user?.name?.slice(0, 1) || 'U'}
                                                </span>
                                                <span style={{ color: 'var(--text-muted)' }}>{project.user?.name || 'Unknown'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
                        <Globe className="size-12" style={{ color: 'var(--text-muted)' }} />
                        <h1 className="text-2xl font-bold">No published projects yet</h1>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Be the first to create and publish</p>
                        <button onClick={() => navigate('/')} className="btn-glow px-6 py-2.5 mt-2 rounded-xl text-sm font-semibold">Create Project</button>
                    </div>
                )}
            </div>
            <Footer />
        </>
    )
}

export default Community