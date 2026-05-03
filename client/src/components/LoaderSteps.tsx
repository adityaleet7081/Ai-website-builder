import { ScanLine, LayoutTemplate, Layers, CheckCircle2 } from "lucide-react"
import { useEffect, useState } from "react"

const steps = [
    { icon: ScanLine, label: "Parsing requirements...", color: "var(--accent-violet)" },
    { icon: LayoutTemplate, label: "Scaffolding structure...", color: "var(--accent-cyan)" },
    { icon: Layers, label: "Applying styles...", color: "var(--accent-pink)" },
    { icon: CheckCircle2, label: "Finalizing bundle...", color: "var(--text-primary)" },
]
const STEP_DURATION = 45000

const LoaderSteps = () => {
    const [current, setCurrent] = useState(0)
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrent((s) => (s + 1) % steps.length)
            setProgress(0)
        }, STEP_DURATION);
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        const progressInterval = setInterval(() => {
            setProgress(p => Math.min(p + 0.5, 100))
        }, STEP_DURATION / 200)
        return () => clearInterval(progressInterval)
    }, [current])

    const Icon = steps[current].icon

    return (
        <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
            <div className="absolute inset-0 dot-grid opacity-20" />

            <div className="relative z-10 flex flex-col items-center">
                {/* Core spinner */}
                <div className="relative w-32 h-32 flex items-center justify-center mb-8">
                    {/* Outer ring */}
                    <div className="absolute inset-0 rounded-full border-t border-r border-transparent anim-spin-slow"
                        style={{ borderTopColor: 'var(--accent-violet)', borderRightColor: 'var(--accent-cyan)' }} />
                    <div className="absolute inset-2 rounded-full border-b border-l border-transparent anim-spin-slow"
                        style={{ borderBottomColor: 'var(--accent-pink)', borderLeftColor: 'var(--accent-violet)', animationDirection: 'reverse', animationDuration: '20s' }} />

                    {/* Center Icon */}
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center anim-pulse-glow"
                        style={{ background: 'var(--bg-card)', border: `1px solid ${steps[current].color}`, boxShadow: `0 0 20px -5px ${steps[current].color}` }}>
                        <Icon className="w-6 h-6" style={{ color: steps[current].color }} />
                    </div>
                </div>

                {/* Text & Progress */}
                <div className="text-center w-64">
                    <p className="text-sm font-mono tracking-tight anim-fadeUp mb-4" style={{ color: steps[current].color }}>
                        [{current + 1}/{steps.length}] {steps[current].label}
                    </p>

                    <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-card)' }}>
                        <div className="h-full transition-all duration-300"
                            style={{ width: `${progress}%`, background: steps[current].color }} />
                    </div>

                    <p className="text-[10px] uppercase tracking-widest mt-6" style={{ color: 'var(--text-muted)' }}>
                        Building in progress
                    </p>
                </div>
            </div>
        </div>
    )
}

export default LoaderSteps