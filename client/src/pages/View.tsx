import { useState, useEffect } from "react"
import { useParams } from "react-router-dom";
import { Loader2Icon } from "lucide-react";
import api from "@/configs/axios";
import { toast } from "sonner";

const View = () => {
    const { projectId } = useParams()
    const [code, setCode] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let cancelled = false;
        const fetchCode = async () => {
            try {
                const { data } = await api.get(`/api/project/published/${projectId}`)
                if (!cancelled) {
                    setCode(data.code)
                    setLoading(false)
                }
            } catch (error: unknown) {
                const err = error as { response?: { data?: { message?: string } }, message?: string };
                if (!cancelled) toast.error(err?.response?.data?.message || err.message || "An error occurred");
            }
        }
        fetchCode();
        return () => { cancelled = true; }
    }, [projectId]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen gap-4" style={{ background: 'var(--bg-primary)' }}>
                <Loader2Icon className="size-7 animate-spin" style={{ color: 'var(--accent-violet)' }} />
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading...</p>
            </div>
        )
    }

    return (
        <div className="h-screen" style={{ background: 'var(--bg-primary)' }}>
            <iframe srcDoc={code} className="w-full h-full border-0" title="Published Website" />
        </div>
    )
}

export default View