import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom";
import { Loader2Icon } from "lucide-react";
import ProjectPreview from "../components/ProjectPreview";
import type { Project, Version } from "../types";
import api from "@/configs/axios";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

const Preview = () => {

    const { data: session, isPending } = authClient.useSession()
    const { projectId, versionId } = useParams()
    const navigate = useNavigate();
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchCode = async () => {
        try {
            const { data } = await api.get(`/api/project/preview/${projectId}`)

            if (!data.project) {
                toast.error('Project not found');
                navigate('/my-projects');
                return;
            }

            let projectCode = data.project.current_code;

            if (versionId) {
                const version = data.project.versions.find((v: Version) => v.id === versionId);
                if (version) {
                    projectCode = version.code;
                }
            }

            if (!projectCode || projectCode.trim() === '') {
                toast.error('No code found for this project. Please generate the website first.');
                navigate(`/editor/${projectId}`);
                return;
            }

            setCode(projectCode);
            setLoading(false);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }, message?: string };
            toast.error(err?.response?.data?.message || err.message || "An error occurred");
            setLoading(false);
            setTimeout(() => navigate('/my-projects'), 2000);
        }
    }

    useEffect(() => {
        if (!isPending && session?.user) {
            void fetchCode()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session?.user, isPending]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen gap-4" style={{ background: 'var(--bg-primary)' }}>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                    <Loader2Icon className="size-7 animate-spin" style={{ color: 'var(--accent-violet)' }} />
                </div>
                <p className="text-sm animate-pulse" style={{ color: 'var(--text-muted)' }}>Loading preview...</p>
            </div>
        )
    }

    if (!code) {
        return (
            <div className="flex flex-col items-center justify-center h-screen gap-4" style={{ background: 'var(--bg-primary)' }}>
                <p style={{ color: 'var(--text-secondary)' }}>No preview available for this project.</p>
                <button
                    onClick={() => navigate(`/editor/${projectId}`)}
                    className="btn-glow px-5 py-2 rounded-xl text-sm font-medium"
                >
                    Go to Editor
                </button>
            </div>
        )
    }

    return (
        <div className="h-screen" style={{ background: 'var(--bg-primary)' }}>
            <ProjectPreview project={{ current_code: code } as Project}
                isGenerating={false} showEditorPanel={false} />
        </div>
    )
}

export default Preview