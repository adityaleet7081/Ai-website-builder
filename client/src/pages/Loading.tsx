import { Loader2Icon } from 'lucide-react'
import { useEffect } from 'react'

const Loading = () => {

    useEffect(() => {
        const timer = setTimeout(() => {
            window.location.assign('/')
        }, 6000)
        return () => clearTimeout(timer)
    }, [])

    return (
        <div className='h-screen flex flex-col' style={{ background: 'var(--bg-primary)' }}>
            <div className="absolute inset-0 dot-grid opacity-20" />
            <div className='flex flex-col items-center justify-center flex-1 gap-4 relative z-10'>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                    <Loader2Icon className='size-7 animate-spin' style={{ color: 'var(--accent-violet)' }} />
                </div>
                <p className="text-sm animate-pulse" style={{ color: 'var(--text-muted)' }}>Redirecting...</p>
            </div>
        </div>
    )
}
export default Loading