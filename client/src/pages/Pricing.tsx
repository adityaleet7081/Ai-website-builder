import React from "react"
import { appPlans } from "../assets/assets";
import Footer from "../components/Footer";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import api from "@/configs/axios";
import { Check } from "lucide-react";

interface Plan {
    id: string; name: string; price: string; credits: number; description: string; features: string[];
}

const Pricing = () => {
    const { data: session } = authClient.useSession()
    const [plans] = React.useState<Plan[]>(appPlans)

    const handlePurchase = async (planId: string) => {
        try {
            if (!session?.user) return toast('Please login to purchase credits')
            const { data } = await api.post('/api/user/purchase-credits', { planId })
            window.location.assign(data.payment_link);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }, message?: string };
            toast.error(err?.response?.data?.message || err.message || "An error occurred");
        }
    }

    return (
        <>
            <div className="w-full max-w-6xl mx-auto px-4 min-h-[80vh] pt-28 pb-16 relative">
                <div className="absolute inset-0 dot-grid opacity-20 pointer-events-none" />
                <div className="absolute w-[500px] h-[500px] top-0 left-1/2 -translate-x-1/2 blob-violet opacity-10 blur-[120px] pointer-events-none" />

                <div className="text-center mb-14 anim-fadeUp delay-1 opacity-0 relative z-10">
                    <p className="text-sm font-semibold tracking-widest uppercase mb-3" style={{ color: 'var(--accent-violet)' }}>Pricing</p>
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                        Choose Your <span className="text-gradient">Plan</span>
                    </h2>
                    <p className="text-base max-w-lg mx-auto" style={{ color: 'var(--text-secondary)' }}>
                        Start free, scale as you grow. Simple credits, no subscriptions.
                    </p>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-3 gap-5 relative z-10'>
                    {plans.map((plan, idx) => {
                        const isPopular = idx === 1;
                        return (
                            <div key={idx} className={`mx-auto w-full max-w-sm anim-fadeUp opacity-0 delay-${idx + 2} ${isPopular ? 'gradient-border' : 'card'}`}
                                style={!isPopular ? {} : { padding: 0 }}>
                                <div className={`p-7 rounded-2xl relative ${isPopular ? '' : ''}`} style={isPopular ? { background: 'var(--bg-card)' } : {}}>
                                    {isPopular && (
                                        <div className="absolute -top-px left-1/2 -translate-x-1/2 px-4 py-1 rounded-b-lg text-[11px] font-semibold tracking-wide uppercase"
                                            style={{ background: 'linear-gradient(135deg, var(--accent-violet), var(--accent-cyan))', color: 'white' }}>
                                            Most Popular
                                        </div>
                                    )}
                                    <h3 className="text-base font-semibold mt-2" style={{ color: 'var(--text-secondary)' }}>{plan.name}</h3>
                                    <div className="my-5 flex items-baseline gap-1">
                                        <span className="text-5xl font-bold">{plan.price}</span>
                                        <span className="text-sm font-mono" style={{ color: 'var(--text-muted)' }}>/ {plan.credits} credits</span>
                                    </div>
                                    <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>{plan.description}</p>
                                    <button onClick={() => handlePurchase(plan.id)}
                                        className={`w-full py-3 rounded-xl text-sm font-semibold transition-all active:scale-[0.97] ${isPopular ? 'btn-glow' : 'btn-ghost'}`}>
                                        Get Started
                                    </button>
                                    <ul className="mt-7 space-y-3">
                                        {plan.features.map((f, i) => (
                                            <li key={i} className="flex items-center gap-3">
                                                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                                                    style={{ background: isPopular ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.04)' }}>
                                                    <Check className="size-3" style={{ color: isPopular ? 'var(--accent-violet)' : 'var(--text-muted)' }} />
                                                </div>
                                                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{f}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="card p-5 mt-14 text-center max-w-2xl mx-auto anim-fadeUp opacity-0 delay-6 relative z-10">
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Each project <span style={{ color: 'var(--text-primary)' }}>Creation / Revision</span> uses <span className="font-mono font-semibold" style={{ color: 'var(--accent-violet)' }}>5 credits</span>.
                    </p>
                </div>
            </div>
            <Footer />
        </>
    )
}

export default Pricing