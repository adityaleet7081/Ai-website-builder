import api from "@/configs/axios";
import { authClient } from "@/lib/auth-client";
import { Loader2Icon, SparklesIcon, Zap, Layers, Code2, Wand2, ArrowRight, ChevronDown } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Footer from "../components/Footer";

const Home = () => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const { data: session } = authClient.useSession();
  const navigate = useNavigate();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [typedText, setTypedText] = useState("");
  const heroRef = useRef<HTMLDivElement>(null);

  const phrases = [
    "a SaaS landing page with pricing...",
    "a portfolio with dark mode...",
    "an e-commerce store for shoes...",
    "a blog with newsletter signup...",
  ];
  const [phraseIdx, setPhraseIdx] = useState(0);

  useEffect(() => {
    let charIdx = 0;
    let deleting = false;
    const phrase = phrases[phraseIdx];
    const interval = setInterval(() => {
      if (!deleting) {
        setTypedText(phrase.slice(0, charIdx + 1));
        charIdx++;
        if (charIdx >= phrase.length) {
          deleting = true;
          setTimeout(() => {}, 1500);
        }
      } else {
        setTypedText(phrase.slice(0, charIdx - 1));
        charIdx--;
        if (charIdx <= 0) {
          deleting = false;
          setPhraseIdx((p) => (p + 1) % phrases.length);
          clearInterval(interval);
        }
      }
    }, deleting ? 30 : 60);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phraseIdx]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: (e.clientX / window.innerWidth - 0.5) * 2, y: (e.clientY / window.innerHeight - 0.5) * 2 });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const onSubmitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!session?.user) return toast.error("Please sign in to create a project");
      if (!input.trim()) return toast.error("Please enter a message");
      setLoading(true);
      const { data } = await api.post("/api/user/project", { initial_prompt: input });
      setLoading(false);
      navigate(`/projects/${data.projectId}`);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }, message?: string };
      setLoading(false);
      toast.error(err?.response?.data?.message || err.message || "An error occurred");
    }
  };

  const features = [
    { icon: Wand2, title: "AI-Powered Generation", desc: "Describe your vision in plain English. Our AI handles the rest — layout, styling, content.", color: "#7c3aed" },
    { icon: Zap, title: "Instant Results", desc: "Go from idea to a fully functional website in under 3 minutes. No templates needed.", color: "#06b6d4" },
    { icon: Layers, title: "Visual Editor", desc: "Click any element to edit. Change colors, text, layout — all without touching code.", color: "#ec4899" },
    { icon: Code2, title: "Production Code", desc: "Download clean, semantic HTML/CSS/JS. Deploy anywhere — Vercel, Netlify, or your own server.", color: "#7c3aed" },
  ];

  const steps = [
    { num: "01", title: "Describe", text: "Tell AI what you want. Be specific or keep it simple — AI adapts to your level of detail." },
    { num: "02", title: "Generate", text: "Watch as AI builds your complete website with responsive design, animations, and real content." },
    { num: "03", title: "Customize & Ship", text: "Use the visual editor to tweak anything. Then download or publish with one click." },
  ];

  return (
    <div className="relative overflow-hidden" style={{ background: "var(--bg-primary)" }}>
      {/* ===== HERO ===== */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
        
        {/* Premium 3D Stacked Glass Effect */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none hero-3d-container">
          <div 
            style={{ 
              transform: `rotateX(${15 + mousePos.y * -8}deg) rotateY(${mousePos.x * 12}deg) rotateZ(-2deg) translateZ(-150px)`,
              width: '900px', height: '600px',
              animation: 'hero-float-up-down 8s ease-in-out infinite'
            }} 
            className="hero-3d-card">
            
            <div className="hero-3d-card-inner p-8">
              <div className="w-40 h-5 rounded-full bg-white/5 mb-4" />
              <div className="w-64 h-4 rounded-full bg-white/5 mb-12" />
              <div className="flex gap-4">
                <div className="w-full h-32 rounded-xl bg-violet-500/10 border border-violet-500/20" />
                <div className="w-full h-32 rounded-xl bg-cyan-500/10 border border-cyan-500/20" />
                <div className="w-full h-32 rounded-xl bg-pink-500/10 border border-pink-500/20" />
              </div>
            </div>

            {/* Middle Layer */}
            <div 
              style={{ 
                transform: 'translateZ(100px) translateX(60px) translateY(60px)',
                width: '600px', height: '400px'
              }} 
              className="hero-3d-card">
              <div className="hero-3d-card-inner p-6">
                <div className="w-32 h-5 rounded-full bg-white/10 mb-8" />
                <div className="w-full h-40 rounded-xl bg-gradient-to-br from-violet-500/10 to-transparent border border-white/5" />
              </div>
            </div>

            {/* Top Layer */}
            <div 
              style={{ 
                transform: 'translateZ(200px) translateX(-50px) translateY(-30px)',
                width: '450px', height: '280px'
              }} 
              className="hero-3d-card shadow-2xl">
              <div className="hero-3d-card-inner flex items-center justify-center">
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.1)_0%,transparent_70%)]" />
                 <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center"
                      style={{ boxShadow: '0 0 30px rgba(124,58,237,0.2)' }}>
                    <SparklesIcon className="size-8 text-violet-400 opacity-50" />
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Animated background blobs with mouse parallax */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-[800px] h-[800px] -top-40 -right-40 blob-violet opacity-20 blur-[150px] anim-float1"
            style={{ transform: `translate(${mousePos.x * 20}px, ${mousePos.y * 20}px)` }} />
          <div className="absolute w-[600px] h-[600px] -bottom-20 -left-40 blob-cyan opacity-15 blur-[120px] anim-float2"
            style={{ transform: `translate(${mousePos.x * -15}px, ${mousePos.y * -15}px)` }} />
        </div>

        {/* Radial vignette to fade edges into background */}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 50%, transparent 0%, var(--bg-primary) 100%)' }} />

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center max-w-4xl mx-auto text-center mt-10">
          {/* Badge */}
          <div className="anim-fadeUp delay-1 opacity-0">
            <a href="/pricing" className="group inline-flex items-center gap-2 px-1 pr-4 py-1 rounded-full border border-violet-500/20 bg-violet-500/5 hover:bg-violet-500/10 transition-all mb-8"
              style={{ boxShadow: '0 0 20px -5px rgba(124,58,237,0.2)' }}>
              <span className="bg-violet-600 text-[11px] font-semibold tracking-wide uppercase px-3 py-1 rounded-full text-white">New</span>
              <span className="text-[13px] text-violet-300 group-hover:text-violet-200 transition-colors flex items-center gap-1.5">
                30 days free trial <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </a>
          </div>

          {/* 3D Heading with mouse-tracked perspective */}
          <div className="anim-fadeUp delay-2 opacity-0" style={{
            transform: `perspective(1000px) rotateX(${mousePos.y * -2}deg) rotateY(${mousePos.x * 2}deg)`,
            transition: 'transform 0.1s ease-out',
          }}>
            <h1 className="text-5xl md:text-7xl lg:text-[84px] font-bold tracking-tight leading-[1.05]">
              Build websites
              <br />
              <span className="text-gradient relative">
                with AI magic
                {/* Glow shadow behind text */}
                <span className="absolute inset-0 text-gradient blur-2xl opacity-50 -z-10" aria-hidden="true">with AI magic</span>
              </span>
            </h1>
          </div>

          {/* Subtitle */}
          <p className="anim-fadeUp delay-3 opacity-0 text-lg md:text-xl mt-6 max-w-xl leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Describe what you want. AI generates a complete, production-ready website. Edit visually. Ship instantly.
          </p>

          {/* Animated border prompt box */}
          <div className="anim-fadeUp delay-4 opacity-0 w-full max-w-2xl mt-10">
            <form onSubmit={onSubmitHandler} className="animated-border">
              <div className="input-dark rounded-[18px] p-1" style={{ position: 'relative', zIndex: 2 }}>
                <div className="p-4 pb-2">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="bg-transparent outline-none resize-none w-full text-base placeholder-transparent"
                    style={{ color: 'var(--text-primary)' }}
                    rows={3}
                    placeholder="Describe your website..."
                    required
                  />
                  {!input && (
                    <div className="absolute top-5 left-5 pointer-events-none text-base" style={{ color: 'var(--text-muted)', zIndex: 3 }}>
                      Build me {typedText}<span className="inline-block w-0.5 h-5 bg-violet-500 ml-0.5 align-middle" style={{ animation: 'typing-cursor 0.8s step-end infinite' }} />
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between px-4 pb-3">
                  <span className="text-xs font-mono hidden sm:block" style={{ color: 'var(--text-muted)' }}>⌘ + Enter to submit</span>
                  <button type="submit" disabled={loading}
                    className="btn-glow flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
                    {!loading ? (
                      <><SparklesIcon className="size-4" /> Generate Website</>
                    ) : (
                      <>Generating <Loader2Icon className="animate-spin size-4" /></>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Stats with 3D perspective */}
          <div className="anim-fadeUp delay-5 opacity-0 flex items-center gap-8 mt-12 text-sm" style={{ color: 'var(--text-muted)' }}>
            {[
              { val: "2k+", label: "Websites Built" },
              { val: "<3m", label: "Avg Build Time" },
              { val: "100%", label: "Your Code" },
            ].map((stat, i) => (
              <React.Fragment key={i}>
                {i > 0 && <div className={`w-px h-8 ${i === 2 ? 'hidden sm:block' : ''}`} style={{ background: 'var(--border-subtle)' }} />}
                <div className={`${i === 2 ? 'hidden sm:block' : ''} text-center`}>
                  <span className="text-gradient font-bold text-2xl block">{stat.val}</span>
                  <span className="text-[12px]">{stat.label}</span>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 anim-fadeIn delay-7 opacity-0">
          <ChevronDown className="size-5 animate-bounce" style={{ color: 'var(--text-muted)' }} />
        </div>
      </section>

      {/* ===== FEATURES - 3D Floating Cards ===== */}
      <section className="relative py-32 px-4 overflow-hidden">
        {/* Subtle 3D background effect to blend sections perfectly */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
          <div className="grid-3d" style={{ top: '0', height: '200%', transform: 'perspective(1000px) rotateX(75deg) translateZ(-100px)', animation: 'hero-float-up-down 12s ease-in-out infinite' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-violet-600/5 blur-[120px] rounded-full" />
        </div>
        
        <div className="absolute inset-0 dot-grid opacity-10" />

        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-sm font-semibold tracking-widest uppercase mb-3" style={{ color: 'var(--accent-violet)' }}>Features</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Everything you need to <span className="text-gradient">ship fast</span>
            </h2>
            <p className="mt-4 max-w-lg mx-auto" style={{ color: 'var(--text-secondary)' }}>
              From idea to live website in minutes. AI does the heavy lifting.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 scene-3d">
            {features.map((f, i) => (
              <div key={i} className={`anim-fadeUp opacity-0 delay-${i + 1}`}>
                <div
                  className="float-card-3d card card-shimmer p-7 group h-full"
                  style={{
                    animation: `card-float-${(i % 3) + 1} ${6 + i}s ease-in-out infinite`,
                    background: 'rgba(15, 15, 35, 0.4)',
                    backdropFilter: 'blur(12px)',
                  }}>
                  {/* Glowing icon */}
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 relative"
                    style={{ background: `${f.color}15`, border: `1px solid ${f.color}30` }}>
                    <f.icon className="size-6" style={{ color: f.color }} />
                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ boxShadow: `0 0 30px 5px ${f.color}20` }} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS - 3D Timeline ===== */}
      <section className="relative py-32 px-4 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'var(--border-dim)' }} />
        {/* 3D grid in background */}
        <div className="grid-3d" style={{ opacity: 0.4, top: '30%', height: '80%' }} />

        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-sm font-semibold tracking-widest uppercase mb-3" style={{ color: 'var(--accent-cyan)' }}>How It Works</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Three steps to <span className="text-gradient-warm">launch</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={i}
                className={`card p-8 relative overflow-hidden group anim-fadeUp opacity-0 delay-${i + 1}`}
                style={{ transformStyle: 'preserve-3d' }}>
                {/* Large background number */}
                <span className="absolute -top-4 -right-2 text-[120px] font-bold leading-none select-none transition-colors duration-500"
                  style={{ color: 'rgba(124,58,237,0.03)', WebkitTextStroke: '1px rgba(124,58,237,0.05)' }}>{s.num}</span>
                {/* Hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-2xl"
                  style={{ background: 'radial-gradient(circle at 50% 0%, rgba(124,58,237,0.08) 0%, transparent 60%)' }} />
                <div className="relative z-10">
                  {/* Step number badge */}
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold mb-6 relative"
                    style={{ background: 'linear-gradient(135deg, var(--accent-violet), #9333ea)', color: 'white' }}>
                    {s.num}
                    {/* Ripple ring */}
                    <div className="absolute inset-0 rounded-xl" style={{ animation: 'glow-pulse-ring 3s ease-in-out infinite', animationDelay: `${i * 1}s` }} />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{s.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{s.text}</p>
                </div>
                {/* Connecting line */}
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-px" style={{ background: 'linear-gradient(90deg, var(--accent-violet), transparent)' }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA - Premium Clean Version ===== */}
      <section className="relative py-32 px-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-[500px] h-[500px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 blob-violet opacity-10 blur-[120px]" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto text-center scene-3d">
          <div className="card p-16 md:p-20 relative overflow-hidden float-card-3d"
            style={{
              background: 'rgba(15, 15, 35, 0.4)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
              transform: `perspective(1200px) rotateX(${mousePos.y * -2}deg) rotateY(${mousePos.x * 2}deg)`,
              transition: 'transform 0.15s ease-out',
            }}>
            {/* Subtle top border glow instead of full gradient border */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-50" />
            
            <h2 className="text-3xl md:text-5xl font-bold mb-4 relative z-10">
              Start building for <span className="text-gradient">free</span>
            </h2>
            <p className="text-base mb-10 max-w-md mx-auto relative z-10" style={{ color: 'var(--text-secondary)' }}>
              Join thousands of creators shipping stunning websites with AI. No credit card required.
            </p>
            <div className="relative z-10">
              <button onClick={() => navigate(session?.user ? "/" : "/auth/signin")}
                className="btn-glow rounded-xl px-8 py-3.5 text-base font-semibold inline-flex items-center gap-2">
                Get Started <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
