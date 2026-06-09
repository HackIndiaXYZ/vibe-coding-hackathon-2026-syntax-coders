'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Home() {
  // Navbar scroll shadow state
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Scroll reveal Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.15 }
    )
    document.querySelectorAll('.scroll-reveal').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  // Count up animation for stats
  useEffect(() => {
    const counters = document.querySelectorAll('.count-up')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement
            const end = parseFloat(target.dataset.target || '0')
            const duration = 2000
            const start = performance.now()
            const update = (time: number) => {
              const progress = Math.min((time - start) / duration, 1)
              const eased = 1 - Math.pow(1 - progress, 3)
              target.textContent =
                end % 1 !== 0
                  ? (eased * end).toFixed(1)
                  : Math.floor(eased * end).toLocaleString()
              if (progress < 1) requestAnimationFrame(update)
            }
            requestAnimationFrame(update)
            observer.unobserve(target)
          }
        })
      },
      { threshold: 0.5 }
    )
    counters.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  // Mobile hamburger menu toggle
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // QR mock patterns (static to avoid server-client hydration mismatch)
  const heroQrPattern = [
    1, 1, 1, 1, 1, 1, 1,
    1, 0, 0, 0, 0, 0, 1,
    1, 0, 1, 1, 1, 0, 1,
    1, 0, 1, 0, 1, 0, 1,
    1, 0, 1, 1, 1, 0, 1,
    1, 0, 0, 0, 0, 0, 1,
    1, 1, 1, 1, 1, 1, 1
  ]

  const emergencyQrPattern = [
    1, 1, 1, 0, 0, 1, 1, 1,
    1, 0, 1, 0, 1, 0, 1, 0,
    1, 1, 1, 1, 0, 1, 1, 1,
    0, 0, 1, 0, 1, 0, 0, 0,
    1, 0, 0, 1, 0, 1, 1, 0,
    1, 1, 1, 0, 1, 0, 0, 1,
    1, 0, 1, 0, 0, 1, 0, 1,
    1, 1, 1, 1, 0, 1, 1, 0
  ]

  return (
    <div className="min-h-screen bg-[#FDF6EE] font-sans selection:bg-[#7C5CBF]/20 selection:text-[#7C5CBF]">
      <style>{`
        .hero-bg {
          background-color: #FDF6EE;
          background-image: 
            radial-gradient(ellipse 80% 50% at 20% 20%, 
              rgba(124,92,191,0.08) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 80% 80%, 
              rgba(62,207,170,0.08) 0%, transparent 60%),
            radial-gradient(ellipse 40% 30% at 60% 10%, 
              rgba(124,92,191,0.05) 0%, transparent 50%),
            url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%237C5CBF' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-8px) rotate(0.5deg); }
          66% { transform: translateY(-4px) rotate(-0.5deg); }
        }
        @keyframes slowSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes blobFloat {
          0%, 100% { transform: scale(1) translate(0px, 0px); }
          50% { transform: scale(1.08) translate(15px, -15px); }
        }
        @keyframes typingBounce {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes countUp {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .float-1 { animation: float 4s ease-in-out infinite; }
        .float-2 { animation: float 4s ease-in-out infinite; animation-delay: 1.5s; }
        .float-3 { animation: float 4s ease-in-out infinite; animation-delay: 0.8s; }
        .blob-1 { animation: blobFloat 10s ease-in-out infinite; }
        .blob-2 { animation: blobFloat 12s ease-in-out infinite reverse; }
        .spin-slow { animation: slowSpin 40s linear infinite; }
        .spin-slow-reverse { animation: slowSpin 25s linear infinite reverse; }
        .fade-up-1 { animation: fadeUp 0.6s ease-out 0.1s forwards; opacity: 0; }
        .fade-up-2 { animation: fadeUp 0.6s ease-out 0.2s forwards; opacity: 0; }
        .fade-up-3 { animation: fadeUp 0.6s ease-out 0.3s forwards; opacity: 0; }
        .fade-up-4 { animation: fadeUp 0.6s ease-out 0.4s forwards; opacity: 0; }
        .typing-dot-1 { animation: typingBounce 1s ease-in-out infinite; }
        .typing-dot-2 { animation: typingBounce 1s ease-in-out infinite; animation-delay: 0.2s; }
        .typing-dot-3 { animation: typingBounce 1s ease-in-out infinite; animation-delay: 0.4s; }
        .scroll-reveal { 
          opacity: 0; 
          transform: translateY(30px); 
          transition: opacity 0.6s ease, transform 0.6s ease; 
        }
        .scroll-reveal.visible { 
          opacity: 1; 
          transform: translateY(0); 
        }
      `}</style>

      {/* NAVBAR */}
      <header className={`sticky top-0 z-50 bg-[#FDF6EE]/95 backdrop-blur-md border-b border-[#EDE9F8] transition-shadow duration-300 ${scrolled ? 'shadow-md' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Left: Brand */}
          <Link href="/" className="flex items-center gap-2 group">
            <svg viewBox="0 0 24 24" fill="none" stroke="#3ECFAA" strokeWidth="2" strokeLinecap="round" className="w-7 h-7 transition-transform group-hover:scale-110">
              <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
            </svg>
            <span className="font-bold text-xl text-[#1E1B2E] tracking-tight">LifeLink</span>
          </Link>

          {/* Center: Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm text-[#6B7280] hover:text-[#7C5CBF] transition font-medium">Features</Link>
            <Link href="#how-it-works" className="text-sm text-[#6B7280] hover:text-[#7C5CBF] transition font-medium">How It Works</Link>
            <Link href="#for-doctors" className="text-sm text-[#6B7280] hover:text-[#7C5CBF] transition font-medium">For Doctors</Link>
            <Link href="#emergency" className="text-sm text-[#6B7280] hover:text-[#7C5CBF] transition font-medium">Emergency</Link>
          </nav>

          {/* Right: Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/login" className="text-sm text-[#6B7280] hover:text-[#7C5CBF] transition font-semibold">Log in</Link>
            <Link href="/register" className="bg-[#7C5CBF] text-white rounded-full px-5 py-2.5 text-sm font-semibold hover:bg-[#6a4daa] hover:shadow-lg transition-all duration-300">
              Sign up free
            </Link>
          </div>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#1E1B2E] hover:text-[#7C5CBF] transition-colors focus:outline-none"
            aria-label="Toggle Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#FDF6EE] border-t border-[#EDE9F8] px-6 py-4 space-y-4">
            <Link href="#features" className="block text-sm text-[#6B7280] hover:text-[#7C5CBF] transition font-medium" onClick={() => setMobileMenuOpen(false)}>Features</Link>
            <Link href="#how-it-works" className="block text-sm text-[#6B7280] hover:text-[#7C5CBF] transition font-medium" onClick={() => setMobileMenuOpen(false)}>How It Works</Link>
            <Link href="#for-doctors" className="block text-sm text-[#6B7280] hover:text-[#7C5CBF] transition font-medium" onClick={() => setMobileMenuOpen(false)}>For Doctors</Link>
            <Link href="#emergency" className="block text-sm text-[#6B7280] hover:text-[#7C5CBF] transition font-medium" onClick={() => setMobileMenuOpen(false)}>Emergency</Link>
            <div className="pt-4 border-t border-[#EDE9F8] flex flex-col gap-3">
              <Link href="/login" className="text-sm text-[#6B7280] hover:text-[#7C5CBF] transition font-semibold" onClick={() => setMobileMenuOpen(false)}>Log in</Link>
              <Link href="/register" className="bg-[#7C5CBF] text-white rounded-full px-5 py-2.5 text-sm font-semibold hover:bg-[#6a4daa] transition-all text-center" onClick={() => setMobileMenuOpen(false)}>
                Sign up free
              </Link>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* SECTION 1 — HERO */}
        <section className="min-h-screen flex items-center hero-bg pt-20 pb-16 px-6 relative overflow-hidden">
          <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* HERO LEFT SIDE */}
            <div className="flex flex-col items-start text-left">
              <span className="inline-flex items-center gap-2 bg-[#EDE9F8] text-[#7C5CBF] rounded-full px-4 py-1.5 text-sm font-semibold fade-up-1">
                ✦ AI-Powered Healthcare Platform
              </span>

              <h1 className="text-5xl lg:text-6xl font-bold tracking-tight text-[#1E1B2E] mt-6 leading-[1.1] fade-up-2">
                Healthcare that<br />feels like it<br />
                <span className="bg-gradient-to-r from-[#7C5CBF] to-[#3ECFAA] bg-clip-text text-transparent">
                  cares about you
                </span>
              </h1>

              <p className="text-[#6B7280] leading-relaxed text-lg max-w-lg mt-5 fade-up-3">
                LifeLink brings AI triage, secure medical records, and emergency-ready tools together — so you always have the right care at the right time.
              </p>

              <div className="flex gap-4 mt-8 flex-wrap items-center fade-up-4">
                <Link href="/register" className="bg-[#7C5CBF] text-white rounded-full px-8 py-4 font-semibold hover:shadow-xl hover:scale-105 hover:bg-[#6a4daa] transition-all duration-300">
                  Get started free →
                </Link>
                <Link href="#how-it-works" className="border-2 border-[#EDE9F8] text-[#7C5CBF] rounded-full px-8 py-4 font-semibold hover:bg-[#EDE9F8] transition-all duration-300">
                  See how it works
                </Link>
              </div>

              {/* Social Proof */}
              <div className="flex items-center gap-3 mt-10 fade-up-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full border-2 border-[#FDF6EE] bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs font-bold z-30">
                    P
                  </div>
                  <div className="w-8 h-8 rounded-full border-2 border-[#FDF6EE] bg-gradient-to-br from-[#3ECFAA] to-teal-400 flex items-center justify-center text-white text-xs font-bold -ml-2.5 z-20">
                    R
                  </div>
                  <div className="w-8 h-8 rounded-full border-2 border-[#FDF6EE] bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center text-white text-xs font-bold -ml-2.5 z-10">
                    A
                  </div>
                </div>
                <span className="text-sm text-[#6B7280] font-medium">
                  Loved by 10,000+ patients across India ⭐
                </span>
              </div>
            </div>

            {/* HERO RIGHT SIDE — PHONE MOCKUP */}
            <div className="relative w-full max-w-xl mx-auto h-[600px] flex items-center justify-center">
              
              {/* DECORATIVE RINGS */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full border-2 border-[#7C5CBF]/10 spin-slow pointer-events-none -z-10" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] h-[360px] rounded-full border border-[#3ECFAA]/15 spin-slow-reverse pointer-events-none -z-10" />

              {/* BACKGROUND BLOBS */}
              <div className="absolute w-72 h-72 rounded-full bg-[#EDE9F8] blur-3xl opacity-50 top-10 right-10 blob-1 -z-10 pointer-events-none" />
              <div className="absolute w-56 h-56 rounded-full bg-[#E6FAF5] blur-3xl opacity-40 bottom-10 left-10 blob-2 -z-10 pointer-events-none" />

              {/* PHONE FRAME */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-[500px] bg-[#1E1B2E] rounded-[2.5rem] shadow-[0_40px_80px_rgba(124,92,191,0.3)] border-4 border-[#2d2840] overflow-hidden z-10 transition-transform duration-500 hover:scale-[1.02]">
                
                {/* Phone notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 w-24 h-6 bg-[#1E1B2E] rounded-b-2xl" />

                {/* Phone screen */}
                <div className="absolute inset-1 bg-[#FDF6EE] rounded-[2rem] overflow-hidden flex flex-col justify-between pt-6 pb-4">
                  
                  <div>
                    {/* STATUS BAR */}
                    <div className="px-5 pt-1 pb-1 flex justify-between items-center text-[#1E1B2E]">
                      <span className="text-[10px] font-bold">9:41</span>
                      <div className="flex gap-1 items-center">
                        {/* Signal SVG */}
                        <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2 20h.01M7 20v-4M12 20v-8M17 20v-12M22 20V4" />
                        </svg>
                        {/* Wifi SVG */}
                        <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0" />
                          <circle cx="12" cy="20" r="1" fill="currentColor" />
                        </svg>
                        {/* Battery SVG */}
                        <svg className="w-3.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="7" width="16" height="10" rx="1.5" />
                          <line x1="22" y1="11" x2="22" y2="13" />
                        </svg>
                      </div>
                    </div>

                    {/* APP HEADER */}
                    <div className="px-4 py-2 flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-lg bg-[#7C5CBF] flex items-center justify-center">
                        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" className="w-3.5 h-3.5 animate-pulse">
                          <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
                        </svg>
                      </div>
                      <span className="text-xs font-bold text-[#1E1B2E]">LifeLink</span>
                      
                      <div className="ml-auto w-6 h-6 rounded-full bg-[#EDE9F8] flex items-center justify-center cursor-pointer hover:bg-[#7C5CBF]/10 transition-colors">
                        <svg viewBox="0 0 24 24" fill="none" stroke="#7C5CBF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                      </div>
                    </div>

                    {/* GREETING */}
                    <div className="px-4 py-1.5 text-left">
                      <h3 className="text-xs font-bold text-[#1E1B2E]">Good morning, Priya 👋</h3>
                      <p className="text-[10px] text-[#6B7280]">How are you feeling today?</p>
                    </div>

                    {/* HEALTH SCORE CARD */}
                    <div className="mx-3.5 mb-2.5 bg-gradient-to-br from-[#7C5CBF] to-[#5a3d9e] rounded-xl p-3 text-white text-left shadow-sm">
                      <span className="text-[9px] opacity-80 block font-medium">Today's Health Score</span>
                      <div className="flex items-end gap-0.5 mt-0.5">
                        <span className="text-2xl font-bold leading-none">92</span>
                        <span className="text-[10px] opacity-70 mb-0.5">/100</span>
                      </div>
                      
                      {/* Sparkline */}
                      <div className="flex items-end gap-0.5 mt-2 h-6">
                        <div className="bg-white/30 rounded-[1px] w-2 h-2" />
                        <div className="bg-white/30 rounded-[1px] w-2 h-3" />
                        <div className="bg-white/30 rounded-[1px] w-2 h-2.5" />
                        <div className="bg-white/30 rounded-[1px] w-2 h-4" />
                        <div className="bg-white/30 rounded-[1px] w-2 h-3" />
                        <div className="bg-white/80 rounded-[1px] w-2 h-5" />
                      </div>
                      <span className="text-[8px] opacity-75 mt-1 block">↑ 4pts from yesterday</span>
                    </div>

                    {/* QUICK ACTIONS */}
                    <div className="px-4 mb-2.5 text-left">
                      <span className="text-[10px] font-bold text-[#1E1B2E] block mb-1.5">Quick Actions</span>
                      <div className="grid grid-cols-3 gap-1.5">
                        
                        {/* Action 1 */}
                        <div className="bg-white rounded-lg p-1.5 text-center shadow-[0_2px_8px_rgba(0,0,0,0.02)] border border-[#EDE9F8] cursor-pointer hover:border-[#7C5CBF]/30 hover:scale-[1.02] transition-all">
                          <div className="bg-[#EDE9F8] w-6 h-6 rounded-md mx-auto mb-1 flex items-center justify-center">
                            <svg viewBox="0 0 24 24" fill="none" stroke="#7C5CBF" strokeWidth="2" className="w-3 h-3">
                              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                              <line x1="12" y1="22.08" x2="12" y2="12" />
                            </svg>
                          </div>
                          <span className="text-[8px] font-bold text-[#1E1B2E] block">AI Chat</span>
                        </div>

                        {/* Action 2 */}
                        <div className="bg-white rounded-lg p-1.5 text-center shadow-[0_2px_8px_rgba(0,0,0,0.02)] border border-[#EDE9F8] cursor-pointer hover:border-[#3ECFAA]/30 hover:scale-[1.02] transition-all">
                          <div className="bg-[#E6FAF5] w-6 h-6 rounded-md mx-auto mb-1 flex items-center justify-center">
                            <svg viewBox="0 0 24 24" fill="none" stroke="#3ECFAA" strokeWidth="2.5" className="w-3 h-3">
                              <rect x="3" y="3" width="7" height="7" />
                              <rect x="14" y="3" width="7" height="7" />
                              <rect x="14" y="14" width="7" height="7" />
                              <rect x="3" y="14" width="7" height="7" />
                            </svg>
                          </div>
                          <span className="text-[8px] font-bold text-[#1E1B2E] block">Beacon</span>
                        </div>

                        {/* Action 3 */}
                        <div className="bg-white rounded-lg p-1.5 text-center shadow-[0_2px_8px_rgba(0,0,0,0.02)] border border-[#EDE9F8] cursor-pointer hover:border-amber-400/30 hover:scale-[1.02] transition-all">
                          <div className="bg-amber-50 w-6 h-6 rounded-md mx-auto mb-1 flex items-center justify-center">
                            <svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" className="w-3 h-3">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                            </svg>
                          </div>
                          <span className="text-[8px] font-bold text-[#1E1B2E] block">Records</span>
                        </div>

                      </div>
                    </div>

                  </div>

                  {/* ALERT CARD */}
                  <div className="mx-3.5 bg-amber-50 rounded-xl p-2.5 border border-amber-100 flex items-start gap-1.5 text-left shadow-sm">
                    <div className="w-6 h-6 rounded-lg bg-amber-100 flex-shrink-0 flex items-center justify-center">
                      <svg viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" className="w-3.5 h-3.5">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] font-bold text-amber-800 block">Reminder</span>
                      <p className="text-[8px] text-amber-700/90 leading-normal truncate mt-0.5">
                        Dr. Sharma appt. tomorrow 10am
                      </p>
                    </div>
                  </div>

                </div>
              </div>

              {/* FLOATING CARD 1 (Records Safe) */}
              <div className="hidden lg:block absolute -left-10 top-14 float-1 z-20 bg-white rounded-2xl shadow-xl p-4 w-44 border-l-4 border-[#3ECFAA] text-left">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-8 h-8 rounded-xl bg-[#E6FAF5] flex items-center justify-center flex-shrink-0">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#3ECFAA" strokeWidth="2.5" className="w-4 h-4">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      <polyline points="9 11 11 13 15 9" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-[#1E1B2E]">Records Safe</span>
                </div>
                <p className="text-[10px] text-gray-400 font-medium">IPFS · Encrypted</p>
                <div className="border-t border-gray-100 my-2.5" />
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-[10px] text-gray-400 font-medium">3 files synced</span>
                </div>
              </div>

              {/* FLOATING CARD 2 (Emergency Beacon) */}
              <div className="hidden lg:block absolute -right-10 bottom-20 float-2 z-20 bg-white rounded-2xl shadow-xl p-4 w-48 text-left">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                      <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" className="w-4 h-4">
                        <rect x="3" y="3" width="7" height="7" />
                        <rect x="14" y="3" width="7" height="7" />
                        <rect x="14" y="14" width="7" height="7" />
                        <rect x="3" y="14" width="7" height="7" />
                      </svg>
                    </div>
                    <span className="text-sm font-semibold text-[#1E1B2E]">Emergency</span>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                </div>

                {/* Mini QR Layout */}
                <div className="w-20 h-20 mx-auto my-2 bg-gray-50 rounded-xl p-2 grid grid-cols-7 gap-px">
                  {heroQrPattern.map((cell, idx) => (
                    <div
                      key={idx}
                      className={`w-full aspect-square rounded-[1px] ${
                        cell ? 'bg-[#1E1B2E]' : 'bg-transparent'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[10px] text-gray-400 text-center font-medium mt-1">Tap to activate</p>
              </div>

              {/* FLOATING PILL (Active Users) */}
              <div className="hidden lg:block absolute -right-6 top-10 float-3 z-20 bg-[#7C5CBF] rounded-2xl shadow-xl p-4 w-36 text-white text-left">
                <span className="text-[10px] opacity-60 block font-medium">Active Users</span>
                <span className="text-2xl font-bold tracking-tight block">2,847</span>
                
                {/* Mini Sparkline */}
                <div className="flex items-end gap-0.5 mt-2 h-6">
                  <div className="bg-white/30 rounded-sm w-2 h-2" />
                  <div className="bg-white/30 rounded-sm w-2 h-3" />
                  <div className="bg-white/30 rounded-sm w-2 h-2" />
                  <div className="bg-white/30 rounded-sm w-2 h-4" />
                  <div className="bg-white/80 rounded-sm w-2 h-5" />
                </div>
                <span className="text-[9px] opacity-80 mt-2 block">↑ 12% today</span>
              </div>

              {/* AI STATUS BADGE */}
              <div className="absolute left-2 bottom-10 z-20 float-1 bg-white rounded-full shadow-lg px-4 py-2 flex items-center gap-2 border border-gray-50" style={{ animationDelay: '1.5s' }}>
                <div className="w-2 h-2 rounded-full bg-[#3ECFAA] animate-pulse" />
                <span className="text-xs font-semibold text-[#1E1B2E]">AI Online · Ready</span>
              </div>

            </div>

          </div>
        </section>

        {/* SECTION 2 — STATS STRIP */}
        <section id="stats-strip" className="bg-[#1E1B2E] py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              
              {/* Stat 1 */}
              <div className="text-center lg:border-r border-white/10 scroll-reveal">
                <div className="text-4xl font-bold text-white tracking-tight">
                  <span className="count-up" data-target="10000">0</span>+
                </div>
                <p className="text-sm text-white/50 mt-2 uppercase tracking-widest font-semibold">Patients Assisted</p>
              </div>

              {/* Stat 2 */}
              <div className="text-center lg:border-r border-white/10 scroll-reveal" style={{ transitionDelay: '100ms' }}>
                <div className="text-4xl font-bold text-white tracking-tight">
                  <span className="count-up" data-target="2.3">0</span>s
                </div>
                <p className="text-sm text-white/50 mt-2 uppercase tracking-widest font-semibold">Avg AI Response</p>
              </div>

              {/* Stat 3 */}
              <div className="text-center lg:border-r border-white/10 scroll-reveal" style={{ transitionDelay: '200ms' }}>
                <div className="text-4xl font-bold text-white tracking-tight">
                  <span className="count-up" data-target="99.9">0</span>%
                </div>
                <p className="text-sm text-white/50 mt-2 uppercase tracking-widest font-semibold">Platform Uptime</p>
              </div>

              {/* Stat 4 */}
              <div className="text-center scroll-reveal" style={{ transitionDelay: '300ms' }}>
                <div className="text-4xl font-bold text-white tracking-tight">
                  <span className="count-up" data-target="100">0</span>%
                </div>
                <p className="text-sm text-white/50 mt-2 uppercase tracking-widest font-semibold">Blockchain Secured</p>
              </div>

            </div>
          </div>
        </section>

        {/* SECTION 3 — FEATURES */}
        <section id="features" className="bg-[#FDF6EE] py-24 px-6 relative overflow-hidden">
          <div className="max-w-7xl mx-auto">
            
            {/* Features Header */}
            <div className="text-center mb-16 scroll-reveal">
              <span className="uppercase tracking-widest text-xs text-[#7C5CBF] font-bold">WHAT WE OFFER</span>
              <h2 className="text-4xl font-bold text-[#1E1B2E] mt-3 tracking-tight">Everything your health journey needs</h2>
              <p className="text-[#6B7280] leading-relaxed mt-4 max-w-xl mx-auto text-lg font-medium">
                Simple, powerful tools built for patients, doctors, and families.
              </p>
            </div>

            {/* Features Grid */}
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Card 1 */}
              <div className="bg-white rounded-3xl p-8 border border-[#EDE9F8] hover:shadow-xl hover:-translate-y-1.5 hover:border-[#7C5CBF]/30 transition-all duration-300 scroll-reveal flex flex-col justify-between">
                <div>
                  <div className="bg-[#EDE9F8] rounded-2xl p-3 w-fit mb-5">
                    {/* Brain SVG */}
                    <svg viewBox="0 0 24 24" fill="none" stroke="#7C5CBF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1 0-3.12 3.01 3.01 0 0 1 0-4.88 2.5 2.5 0 0 1 0-3.12A2.5 2.5 0 0 1 9.5 2z" />
                      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 0-3.12 3.01 3.01 0 0 0 0-4.88 2.5 2.5 0 0 0 0-3.12A2.5 2.5 0 0 0 14.5 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-[#1E1B2E] mb-3">AI Health Assistant</h3>
                  <p className="text-[#6B7280] leading-relaxed text-sm">
                    Chat with LLaMA 3.3 70B about your symptoms anytime. Get instant triage, risk assessment, and personalized guidance — in plain language you understand.
                  </p>
                </div>
                <div className="mt-6 bg-[#E6FAF5] text-[#3ECFAA] text-xs rounded-full px-4 py-1.5 w-fit font-semibold tracking-wide">
                  ✦ Powered by Groq
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white rounded-3xl p-8 border border-[#EDE9F8] hover:shadow-xl hover:-translate-y-1.5 hover:border-[#7C5CBF]/30 transition-all duration-300 scroll-reveal flex flex-col justify-between" style={{ transitionDelay: '100ms' }}>
                <div>
                  <div className="bg-[#EDE9F8] rounded-2xl p-3 w-fit mb-5">
                    {/* Cloud+lock SVG */}
                    <svg viewBox="0 0 24 24" fill="none" stroke="#7C5CBF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                      <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
                      <rect x="10" y="13" width="4" height="4" rx="1" fill="#7C5CBF" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-[#1E1B2E] mb-3">Decentralized Records</h3>
                  <p className="text-[#6B7280] leading-relaxed text-sm">
                    Upload your reports, scans, and prescriptions. Stored on IPFS — tamper-proof, always accessible, permanently yours.
                  </p>
                </div>
                <div className="mt-6 bg-[#E6FAF5] text-[#3ECFAA] text-xs rounded-full px-4 py-1.5 w-fit font-semibold tracking-wide">
                  ✦ IPFS + Pinata
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-white rounded-3xl p-8 border border-[#EDE9F8] hover:shadow-xl hover:-translate-y-1.5 hover:border-[#7C5CBF]/30 transition-all duration-300 scroll-reveal flex flex-col justify-between" style={{ transitionDelay: '150ms' }}>
                <div>
                  <div className="bg-[#EDE9F8] rounded-2xl p-3 w-fit mb-5">
                    {/* QR SVG */}
                    <svg viewBox="0 0 24 24" fill="none" stroke="#7C5CBF" strokeWidth="2.5" strokeLinecap="round" className="w-6 h-6">
                      <rect x="3" y="3" width="7" height="7" rx="1" />
                      <rect x="14" y="3" width="7" height="7" rx="1" />
                      <rect x="14" y="14" width="7" height="7" rx="1" />
                      <rect x="3" y="14" width="7" height="7" rx="1" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-[#1E1B2E] mb-3">Emergency Beacon</h3>
                  <p className="text-[#6B7280] leading-relaxed text-sm">
                    One tap generates a QR with your blood type, allergies, and emergency contacts. First responders scan it — no app, no login, no delay.
                  </p>
                </div>
                <div className="mt-6 bg-[#E6FAF5] text-[#3ECFAA] text-xs rounded-full px-4 py-1.5 w-fit font-semibold tracking-wide">
                  ✦ Zero login needed
                </div>
              </div>

              {/* Card 4 */}
              <div className="bg-white rounded-3xl p-8 border border-[#EDE9F8] hover:shadow-xl hover:-translate-y-1.5 hover:border-[#7C5CBF]/30 transition-all duration-300 scroll-reveal flex flex-col justify-between" style={{ transitionDelay: '200ms' }}>
                <div>
                  <div className="bg-[#EDE9F8] rounded-2xl p-3 w-fit mb-5">
                    {/* Chain SVG */}
                    <svg viewBox="0 0 24 24" fill="none" stroke="#7C5CBF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-[#1E1B2E] mb-3">Consent on Chain</h3>
                  <p className="text-[#6B7280] leading-relaxed text-sm">
                    Control exactly who sees your data with blockchain-verified consent. Every approval is immutable, transparent, and auditable.
                  </p>
                </div>
                <div className="mt-6 bg-[#E6FAF5] text-[#3ECFAA] text-xs rounded-full px-4 py-1.5 w-fit font-semibold tracking-wide">
                  ✦ Ethereum Sepolia
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* SECTION 4 — HOW IT WORKS */}
        <section id="how-it-works" className="bg-white py-24 px-6 relative">
          <div className="max-w-7xl mx-auto">
            
            {/* Header */}
            <div className="text-center mb-16 scroll-reveal">
              <span className="uppercase tracking-widest text-xs text-[#7C5CBF] font-bold">HOW IT WORKS</span>
              <h2 className="text-4xl font-bold text-[#1E1B2E] mt-3 tracking-tight">Simple steps to better care</h2>
            </div>

            {/* Steps Container */}
            <div className="max-w-5xl mx-auto relative">
              {/* Dashed connector line */}
              <div className="hidden md:block absolute top-16 left-1/4 right-1/4 border-t-2 border-dashed border-[#EDE9F8] -z-0 pointer-events-none" />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                
                {/* Step 1 */}
                <div className="bg-[#FDF6EE] rounded-3xl p-8 text-center border border-[#EDE9F8] hover:shadow-md hover:-translate-y-1 transition-all duration-300 scroll-reveal">
                  <div className="w-12 h-12 rounded-full bg-[#7C5CBF] text-white flex items-center justify-center text-lg font-bold shadow-lg shadow-[0_8px_20px_rgba(124,92,191,0.3)] mx-auto mb-6">
                    01
                  </div>
                  <div className="w-24 h-24 rounded-2xl bg-[#EDE9F8] flex items-center justify-center mx-auto mb-6">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#7C5CBF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-lg text-[#1E1B2E] mb-3">Describe your symptoms</h3>
                  <p className="text-sm text-[#6B7280] leading-relaxed">
                    Open LifeLink and chat naturally with our AI. No forms, no jargon — just a conversation.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="bg-[#FDF6EE] rounded-3xl p-8 text-center border border-[#EDE9F8] hover:shadow-md hover:-translate-y-1 transition-all duration-300 scroll-reveal" style={{ transitionDelay: '100ms' }}>
                  <div className="w-12 h-12 rounded-full bg-[#7C5CBF] text-white flex items-center justify-center text-lg font-bold shadow-lg shadow-[0_8px_20px_rgba(124,92,191,0.3)] mx-auto mb-6">
                    02
                  </div>
                  <div className="w-24 h-24 rounded-2xl bg-[#EDE9F8] flex items-center justify-center mx-auto mb-6">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#7C5CBF" strokeWidth="2" strokeLinecap="round" className="w-10 h-10">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-lg text-[#1E1B2E] mb-3">Get triaged instantly</h3>
                  <p className="text-sm text-[#6B7280] leading-relaxed">
                    AI assesses your risk in seconds and gives you clear, actionable next steps.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="bg-[#FDF6EE] rounded-3xl p-8 text-center border border-[#EDE9F8] hover:shadow-md hover:-translate-y-1 transition-all duration-300 scroll-reveal" style={{ transitionDelay: '200ms' }}>
                  <div className="w-12 h-12 rounded-full bg-[#7C5CBF] text-white flex items-center justify-center text-lg font-bold shadow-lg shadow-[0_8px_20px_rgba(124,92,191,0.3)] mx-auto mb-6">
                    03
                  </div>
                  <div className="w-24 h-24 rounded-2xl bg-[#EDE9F8] flex items-center justify-center mx-auto mb-6">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#7C5CBF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-lg text-[#1E1B2E] mb-3">Connect with your doctor</h3>
                  <p className="text-sm text-[#6B7280] leading-relaxed">
                    Verified doctors review your AI summary and records — and respond with full context loaded.
                  </p>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5 — FOR DOCTORS */}
        <section id="for-doctors" className="bg-[#FDF6EE] py-24 px-6 relative overflow-hidden">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* LEFT — Dashboard Mockup */}
            <div className="relative scroll-reveal">
              <div className="absolute w-72 h-72 bg-[#EDE9F8] rounded-full blur-3xl opacity-50 -z-10 blob-1 pointer-events-none" />

              {/* Main dashboard mockup card */}
              <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-50 max-w-md mx-auto relative z-10 transition-transform duration-500 hover:scale-[1.01]">
                <div className="flex items-center justify-between mb-5">
                  <span className="font-bold text-[#1E1B2E]">Patient Dashboard</span>
                  <span className="bg-[#EDE9F8] text-[#7C5CBF] rounded-full px-3 py-1 text-xs font-semibold">3 new</span>
                </div>

                <div className="space-y-3">
                  
                  {/* Row 1 */}
                  <div className="flex items-center gap-3 p-3 bg-[#FAFAFA] rounded-2xl hover:bg-[#EDE9F8] transition cursor-pointer">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                      P
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <h4 className="text-sm font-bold text-[#1E1B2E] truncate">Priya Mehta</h4>
                      <p className="text-xs text-[#6B7280] truncate mt-0.5">Fever · Headache</p>
                    </div>
                    <span className="bg-amber-100 text-amber-600 rounded-full px-2.5 py-0.5 text-xs font-semibold">
                      MEDIUM
                    </span>
                  </div>

                  {/* Row 2 */}
                  <div className="flex items-center gap-3 p-3 bg-[#FAFAFA] rounded-2xl hover:bg-[#EDE9F8] transition cursor-pointer">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#3ECFAA] to-teal-400 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                      R
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <h4 className="text-sm font-bold text-[#1E1B2E] truncate">Raj Kumar</h4>
                      <p className="text-xs text-[#6B7280] truncate mt-0.5">Chest pain</p>
                    </div>
                    <span className="bg-red-100 text-red-600 rounded-full px-2.5 py-0.5 text-xs font-semibold">
                      HIGH
                    </span>
                  </div>

                  {/* Row 3 */}
                  <div className="flex items-center gap-3 p-3 bg-[#FAFAFA] rounded-2xl hover:bg-[#EDE9F8] transition cursor-pointer">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-400 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                      S
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <h4 className="text-sm font-bold text-[#1E1B2E] truncate">Sneha Joshi</h4>
                      <p className="text-xs text-[#6B7280] truncate mt-0.5">Annual checkup</p>
                    </div>
                    <span className="bg-green-100 text-green-600 rounded-full px-2.5 py-0.5 text-xs font-semibold">
                      LOW
                    </span>
                  </div>

                </div>
              </div>

              {/* Floating doctor notification */}
              <div className="hidden lg:block absolute -right-6 -bottom-4 float-2 bg-[#7C5CBF] text-white rounded-2xl shadow-xl p-4 w-52 text-left z-20">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs font-bold tracking-wide">New Request</span>
                </div>
                <p className="text-xs opacity-80 leading-normal">Riya S. · Risk: MEDIUM</p>
                <div className="bg-white/20 hover:bg-white/30 text-white rounded-full px-3 py-1.5 text-xs mt-3 w-fit transition-all cursor-pointer font-semibold">
                  View Record →
                </div>
              </div>
            </div>

            {/* RIGHT TEXT */}
            <div className="flex flex-col items-start text-left scroll-reveal">
              <span className="uppercase tracking-widest text-xs text-[#7C5CBF] font-bold">FOR DOCTORS</span>
              <h2 className="text-4xl font-bold text-[#1E1B2E] mt-3 leading-tight tracking-tight">
                Your patients,<br />organized and ready
              </h2>
              <p className="text-[#6B7280] mt-4 leading-relaxed text-base">
                LifeLink gives verified doctors AI-summarized patient histories, consent-gated records, and real-time tools — so you can focus on care, not paperwork.
              </p>

              {/* Checkpoints */}
              <div className="space-y-4 mt-8">
                
                {/* Check 1 */}
                <div className="flex items-start gap-3 text-left">
                  <div className="w-6 h-6 rounded-full bg-[#E6FAF5] flex-shrink-0 flex items-center justify-center mt-0.5">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#3ECFAA" strokeWidth="3" className="w-3 h-3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <span className="text-sm text-[#6B7280] leading-normal font-medium">
                    AI pre-screening saves 2+ hours of consultation time daily
                  </span>
                </div>

                {/* Check 2 */}
                <div className="flex items-start gap-3 text-left">
                  <div className="w-6 h-6 rounded-full bg-[#E6FAF5] flex-shrink-0 flex items-center justify-center mt-0.5">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#3ECFAA" strokeWidth="3" className="w-3 h-3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <span className="text-sm text-[#6B7280] leading-normal font-medium">
                    Blockchain-verified patient consent on every record access
                  </span>
                </div>

                {/* Check 3 */}
                <div className="flex items-start gap-3 text-left">
                  <div className="w-6 h-6 rounded-full bg-[#E6FAF5] flex-shrink-0 flex items-center justify-center mt-0.5">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#3ECFAA" strokeWidth="3" className="w-3 h-3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <span className="text-sm text-[#6B7280] leading-normal font-medium">
                    Instant IPFS access to scans, reports, and prescriptions
                  </span>
                </div>

              </div>

              <div className="mt-10">
                <Link href="/register?role=doctor" className="bg-[#3ECFAA] text-white rounded-full px-8 py-4 font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300">
                  Join as a Doctor →
                </Link>
              </div>
            </div>

          </div>
        </section>

        {/* SECTION 6 — TESTIMONIALS */}
        <section className="bg-white py-24 px-6 relative">
          <div className="max-w-7xl mx-auto">
            
            {/* Header */}
            <div className="text-center mb-12 scroll-reveal">
              <span className="uppercase tracking-widest text-xs text-[#7C5CBF] font-bold">LOVED BY PATIENTS</span>
              <h2 className="text-4xl font-bold text-[#1E1B2E] mt-3 tracking-tight">Real people, real care</h2>
              <p className="text-[#6B7280] mt-3 text-lg font-medium">Don't take our word for it.</p>
            </div>

            {/* Testimonials Grid */}
            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Card 1 */}
              <div className="bg-[#FDF6EE] rounded-3xl p-8 border border-[#EDE9F8] hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between scroll-reveal">
                <div>
                  {/* 5 Stars */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 fill-[#7C5CBF] text-[#7C5CBF]" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-[#1E1B2E] text-sm leading-relaxed italic mb-6">
                    "LifeLink's AI caught that my symptoms needed urgent attention before I reached the clinic. It genuinely felt like someone was looking out for me."
                  </p>
                </div>
                
                <div className="flex items-center gap-3 mt-auto">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-sm font-bold shadow-sm flex-shrink-0">
                    P
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-sm text-[#1E1B2E]">Priya Mehta</h4>
                    <p className="text-xs text-[#6B7280]">Patient, Mumbai</p>
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-[#FDF6EE] rounded-3xl p-8 border border-[#EDE9F8] hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between scroll-reveal" style={{ transitionDelay: '100ms' }}>
                <div>
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 fill-[#7C5CBF] text-[#7C5CBF]" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-[#1E1B2E] text-sm leading-relaxed italic mb-6">
                    "The AI pre-screening saves me hours every day. Patients arrive with their history already organized. It has completely changed how I practice."
                  </p>
                </div>
                
                <div className="flex items-center gap-3 mt-auto">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center text-white text-sm font-bold shadow-sm flex-shrink-0">
                    A
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-sm text-[#1E1B2E]">Dr. Arjun Kumar</h4>
                    <p className="text-xs text-[#6B7280]">Cardiologist, Delhi</p>
                  </div>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-[#FDF6EE] rounded-3xl p-8 border border-[#EDE9F8] hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between scroll-reveal" style={{ transitionDelay: '200ms' }}>
                <div>
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 fill-[#7C5CBF] text-[#7C5CBF]" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-[#1E1B2E] text-sm leading-relaxed italic mb-6">
                    "I generated an emergency beacon before surgery. Knowing first responders would have my info gave me so much peace of mind."
                  </p>
                </div>
                
                <div className="flex items-center gap-3 mt-auto">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3ECFAA] to-teal-400 flex items-center justify-center text-white text-sm font-bold shadow-sm flex-shrink-0">
                    S
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-sm text-[#1E1B2E]">Sneha Rawat</h4>
                    <p className="text-xs text-[#6B7280]">Patient, Bangalore</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* SECTION 7 — EMERGENCY */}
        <section id="emergency" className="bg-gradient-to-br from-[#FFF8F0] to-[#FDF6EE] py-24 px-6 border-t-4 border-amber-400">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* EMERGENCY LEFT */}
            <div className="flex flex-col items-start text-left scroll-reveal">
              <span className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 rounded-full px-4 py-1.5 text-sm font-semibold">
                🚨 Emergency Ready
              </span>
              
              <h2 className="text-4xl font-bold text-[#1E1B2E] mt-4 leading-tight tracking-tight">
                When every second<br />counts
              </h2>
              
              <p className="text-[#6B7280] mt-4 leading-relaxed max-w-md text-base">
                One tap. Your blood type, allergies, medications, and emergency contacts — all in a QR code that anyone can scan. No app needed. No login required.
              </p>

              {/* Feature bullets */}
              <div className="space-y-3 mt-8">
                
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                  <span className="text-sm text-[#6B7280] font-semibold">Instant QR — no setup needed</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                  <span className="text-sm text-[#6B7280] font-semibold">Works offline — any camera can scan</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                  <span className="text-sm text-[#6B7280] font-semibold">Includes blood type, allergies, medications</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                  <span className="text-sm text-[#6B7280] font-semibold">Auto-shares emergency contact details</span>
                </div>

              </div>

              <div className="mt-10">
                <Link href="/register" className="bg-amber-500 text-white rounded-full px-8 py-4 font-semibold hover:bg-amber-600 hover:shadow-xl hover:scale-105 transition-all duration-300 inline-block">
                  Generate My Beacon →
                </Link>
              </div>
            </div>

            {/* EMERGENCY RIGHT — QR PROFILE */}
            <div className="scroll-reveal">
              <div className="bg-white rounded-3xl shadow-xl p-8 text-center max-w-sm mx-auto border border-gray-50 transition-transform duration-500 hover:scale-[1.01]">
                <h3 className="text-sm font-bold text-[#1E1B2E] mb-6">Your Emergency Profile</h3>

                {/* QR Mockup */}
                <div className="mx-auto w-44 h-44 bg-gray-50 rounded-2xl p-3 grid grid-cols-8 gap-0.5 mb-6">
                  {emergencyQrPattern.map((cell, idx) => (
                    <div
                      key={idx}
                      className={`rounded-sm ${cell ? 'bg-[#1E1B2E]' : 'bg-gray-200'}`}
                    />
                  ))}
                </div>

                {/* Info pills */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-[#E6FAF5] text-[#3ECFAA] rounded-full text-xs px-3 py-2.5 font-bold text-center">
                    🩸 O+ Blood
                  </div>
                  <div className="bg-[#E6FAF5] text-[#3ECFAA] rounded-full text-xs px-3 py-2.5 font-bold text-center">
                    ✓ No Allergies
                  </div>
                  <div className="bg-[#E6FAF5] text-[#3ECFAA] rounded-full text-xs px-3 py-2.5 font-bold text-center">
                    💊 2 Medications
                  </div>
                  <div className="bg-[#E6FAF5] text-[#3ECFAA] rounded-full text-xs px-3 py-2.5 font-bold text-center">
                    📞 Dr. Sharma
                  </div>
                </div>

                {/* Status indicator */}
                <div className="flex items-center justify-center gap-2 mt-5">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs text-[#6B7280] font-semibold">Beacon Active · Updates in real-time</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* SECTION 8 — FINAL CTA */}
        <section className="relative overflow-hidden bg-[#7C5CBF] py-28 px-6 text-center scroll-reveal">
          
          {/* Background orbs */}
          <div className="w-96 h-96 rounded-full bg-white/5 blur-3xl absolute -top-20 -left-20 pointer-events-none" />
          <div className="w-80 h-80 rounded-full bg-white/5 blur-3xl absolute -bottom-20 -right-20 pointer-events-none" />

          {/* Content */}
          <div className="relative z-10 max-w-3xl mx-auto">
            <span className="bg-white/10 text-white rounded-full px-4 py-1.5 text-sm font-semibold inline-block">
              ✦ Start your health journey today
            </span>

            <h2 className="text-5xl font-bold text-white mt-6 leading-tight tracking-tight">
              Your health deserves<br />the best care
            </h2>

            <p className="text-xl text-white/70 mt-5 max-w-lg mx-auto leading-relaxed">
              Join LifeLink today. Free forever for patients. Doctors verified within 24 hours.
            </p>

            <div className="flex gap-4 justify-center mt-10 flex-wrap">
              <Link href="/register" className="bg-white text-[#7C5CBF] rounded-full px-10 py-4 font-bold hover:shadow-2xl hover:scale-105 transition-all duration-300">
                Get started free →
              </Link>
              <Link href="#contact" className="border-2 border-white/40 text-white rounded-full px-10 py-4 font-bold hover:bg-white/10 transition-all duration-300">
                Talk to us
              </Link>
            </div>

            <p className="mt-8 text-white/40 text-xs font-medium tracking-wide">
              No credit card required · Free for patients · Doctors verified within 24 hours
            </p>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-[#1E1B2E] text-white relative">
        {/* Top Accent Gradient Bar */}
        <div className="h-1 w-full bg-gradient-to-r from-[#7C5CBF] to-[#3ECFAA]" />

        <div className="max-w-7xl mx-auto px-6 pt-16 pb-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 mb-12 text-left">
            
            {/* Col 1 */}
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-2 mb-3">
                <svg viewBox="0 0 24 24" fill="none" stroke="#3ECFAA" strokeWidth="2" strokeLinecap="round" className="w-6 h-6">
                  <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
                </svg>
                <span className="font-bold text-xl tracking-tight">LifeLink</span>
              </div>
              <p className="text-white/50 text-sm mt-3 leading-relaxed max-w-[180px]">
                Caring for India, intelligently.
              </p>
              <div className="mt-4">
                <p className="text-white/30 text-xs">Built at HackIndia 2026</p>
                <p className="text-[#7C5CBF] text-xs mt-1 font-semibold">by Syntax Coders 💜</p>
              </div>
            </div>

            {/* Col 2 */}
            <div>
              <h4 className="text-sm font-bold tracking-wider mb-4 text-[#EDE9F8]/90">PRODUCT</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="#features" className="text-white/50 hover:text-white text-sm transition font-medium">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#how-it-works" className="text-white/50 hover:text-white text-sm transition font-medium">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link href="#emergency" className="text-white/50 hover:text-white text-sm transition font-medium">
                    Emergency
                  </Link>
                </li>
                <li>
                  <Link href="#for-doctors" className="text-white/50 hover:text-white text-sm transition font-medium">
                    For Doctors
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3 */}
            <div>
              <h4 className="text-sm font-bold tracking-wider mb-4 text-[#EDE9F8]/90">COMPANY</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="#about" className="text-white/50 hover:text-white text-sm transition font-medium">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#privacy" className="text-white/50 hover:text-white text-sm transition font-medium">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#terms" className="text-white/50 hover:text-white text-sm transition font-medium">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="#github" className="text-white/50 hover:text-white text-sm transition font-medium">
                    GitHub
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 4 */}
            <div className="flex flex-col items-start">
              <h4 className="text-sm font-bold tracking-wider mb-4 text-[#EDE9F8]/90">CONNECT</h4>
              <Link href="mailto:team@lifelink.app" className="text-white/50 hover:text-white text-sm transition font-medium mb-3">
                team@lifelink.app
              </Link>
              
              <div className="flex gap-4">
                {/* GitHub link */}
                <Link href="#" className="text-white/50 hover:text-white transition-colors" aria-label="GitHub">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </Link>
                {/* Twitter link */}
                <Link href="#" className="text-white/50 hover:text-white transition-colors" aria-label="Twitter">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </Link>
              </div>
              
              <span className="text-white/30 text-xs mt-4 font-semibold block">India 🇮🇳</span>
            </div>

          </div>

          {/* Bottom Footer Bar */}
          <div className="border-t border-white/10 pt-8 flex flex-wrap justify-between items-center gap-4">
            <p className="text-white/30 text-sm font-medium">
              © 2026 LifeLink · Made with 💜 in India
            </p>
            <p className="text-white/20 text-xs font-semibold">
              HackIndia 2026 · Syntax Coders
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
