import React, { useEffect, useState } from "react"
import { assets } from "../assets/assets";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { authClient } from "@/lib/auth-client";
import { UserButton } from '@daveyplate/better-auth-ui'
import api from "@/configs/axios";
import { toast } from "sonner";
import { Menu, X } from "lucide-react";

const Navbar = () => {
    const [menuOpen, setMenuOpen] = React.useState(false);
    const [scrolled, setScrolled] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const [credits, setCredits] = useState(0);
    const { data: session } = authClient.useSession();

    useEffect(() => {
        if (!session?.user) return;
        let cancelled = false;
        const fetchCredits = async () => {
            try {
                const { data } = await api.get('/api/user/credits');
                if (!cancelled) setCredits(data.credits);
            } catch (error: unknown) {
                const err = error as { response?: { data?: { message?: string } }, message?: string };
                if (!cancelled) toast.error(err?.response?.data?.message || err.message || "An error occurred");
            }
        };
        fetchCredits();
        return () => { cancelled = true; };
    }, [session?.user])

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { to: '/', label: 'Home' },
        { to: '/projects', label: 'My Projects' },
        { to: '/community', label: 'Community' },
        { to: '/pricing', label: 'Pricing' },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <>
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'nav-glass py-3' : 'py-4 bg-transparent'}`}>
                <div className="flex items-center justify-between w-full px-5 md:px-16 lg:px-24 xl:px-32 max-w-[1440px] mx-auto">
                    <Link to='/' className="flex items-center gap-2 group">
                        <img src={assets.logo} alt="logo" className='h-5 sm:h-6 transition-transform duration-300 group-hover:scale-105' />
                    </Link>

                    <div className="hidden md:flex items-center gap-0.5 rounded-full px-1 py-1" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-dim)' }}>
                        {navLinks.map((link) => (
                            <Link key={link.to} to={link.to}
                                className={`relative px-4 py-1.5 text-[13px] font-medium rounded-full transition-all duration-300 ${isActive(link.to)
                                    ? 'text-white'
                                    : 'hover:text-white'
                                }`}
                                style={{ color: isActive(link.to) ? 'var(--text-primary)' : 'var(--text-secondary)', background: isActive(link.to) ? 'var(--accent-violet)' : 'transparent' }}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        {!session?.user ? (
                            <button onClick={() => navigate('/auth/signin')}
                                className="btn-glow px-5 py-2 text-[13px] font-semibold rounded-lg">
                                Get started
                            </button>
                        ) : (
                            <>
                                <div className="px-3.5 py-1.5 rounded-full text-xs font-mono" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                                    <span style={{ color: 'var(--accent-violet)' }}>{credits}</span> credits
                                </div>
                                <UserButton size='icon' />
                            </>
                        )}
                        <button className="md:hidden active:scale-90 transition-transform" onClick={() => setMenuOpen(true)} style={{ color: 'var(--text-secondary)' }}>
                            <Menu className="size-5" />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu */}
            {menuOpen && (
                <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 md:hidden anim-fadeIn" style={{ background: 'rgba(3,0,20,0.95)', backdropFilter: 'blur(20px)' }}>
                    {navLinks.map((link) => (
                        <Link key={link.to} to={link.to} onClick={() => setMenuOpen(false)}
                            className="text-xl font-medium transition-colors duration-300"
                            style={{ color: isActive(link.to) ? 'var(--accent-violet)' : 'var(--text-primary)' }}>
                            {link.label}
                        </Link>
                    ))}
                    <button className="mt-6 p-3 rounded-xl active:scale-90 transition-all" onClick={() => setMenuOpen(false)}
                        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                        <X className="size-5" />
                    </button>
                </div>
            )}
        </>
    )
}

export default Navbar