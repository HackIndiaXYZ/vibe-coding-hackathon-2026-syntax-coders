'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [patients, setPatients] = useState(0)
  const [uptime, setUptime] = useState(0)
  const [responseTime, setResponseTime] = useState(0)
  const statsRef = useRef<HTMLDivElement>(null)
  const statsAnimated = useRef(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('visible')
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    )
    document.querySelectorAll('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right').forEach((el) => observer.observe(el))

    const statsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !statsAnimated.current) {
            statsAnimated.current = true
            const duration = 2200
            let start: number | null = null
            const step = (ts: number) => {
              if (!start) start = ts
              const p = Math.min((ts - start) / duration, 1)
              const ease = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p
              setPatients(Math.floor(ease * 10000))
              setUptime(parseFloat((ease * 99.9).toFixed(1)))
              setResponseTime(parseFloat((ease * 2.3).toFixed(1)))
              if (p < 1) requestAnimationFrame(step)
              else { setPatients(10000); setUptime(99.9); setResponseTime(2.3) }
            }
            requestAnimationFrame(step)
          }
        })
      },
      { threshold: 0.4 }
    )
    if (statsRef.current) statsObserver.observe(statsRef.current)

    return () => { observer.disconnect(); statsObserver.disconnect() }
  }, [])

  return (
    <div className="min-h-screen bg-[#FAF6F1] font-sans overflow-x-hidden">

      {/* ── NAVBAR ── */}
      <nav className={`sticky top-0 z-50 transition-all duration-500 ${scrolled ? 'bg-[#FAF6F1]/95 backdrop-blur-xl shadow-[0_2px_24px_rgba(124,92,191,0.10)] border-b border-[#EDE9F8]' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
          <div className="flex justify-between items-center h-17 py-3">

            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="relative w-9 h-9">
                <div className="absolute inset-0 bg-[#EDE9F8] rounded-xl rotate-6 pulse-soft" />
                <div className="relative w-9 h-9 bg-gradient-to-br from-[#7C5CBF] to-[#3ECFAA] rounded-xl flex items-center justify-center shadow-md shadow-[#7C5CBF]/30">
                  <svg className="w-4 h-4 stroke-white fill-none" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
              </div>
              <span className="font-extrabold text-xl text-[#1E1B2E] tracking-tight">LifeLink</span>
            </div>

            {/* Nav links */}
            <div className="hidden md:flex items-center gap-7">
              {['Features', 'How It Works', 'For Doctors', 'Emergency'].map((item) => (
                <Link
                  key={item}
                  href={`#${item.toLowerCase().replace(/ /g, '-')}`}
                  className="text-[#6B7280] hover:text-[#7C5CBF] text-sm font-medium transition-colors duration-200 relative group"
                >
                  {item}
                  <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-gradient-to-r from-[#7C5CBF] to-[#3ECFAA] rounded-full transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="hidden md:flex items-center gap-2.5">
              {/* Login - pill with border */}
              <Link
                href="/login"
                className="group relative flex items-center gap-2 border border-[#EDE9F8] bg-white text-[#7C5CBF] rounded-full px-5 py-2 text-sm font-semibold hover:border-[#7C5CBF]/40 hover:bg-[#EDE9F8] transition-all duration-300 shadow-sm"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#7C5CBF] group-hover:scale-150 transition-transform duration-300" />
                Log in
              </Link>

              {/* Sign up - gradient pill */}
              <Link
                href="/register"
                className="group relative overflow-hidden flex items-center gap-2 bg-gradient-to-r from-[#7C5CBF] to-[#6340b0] text-white rounded-full px-6 py-2 text-sm font-bold shadow-lg shadow-[#7C5CBF]/30 hover:shadow-xl hover:shadow-[#7C5CBF]/40 hover:scale-105 transition-all duration-300"
              >
                {/* Shimmer sweep on hover */}
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
                <svg className="w-3.5 h-3.5 stroke-white fill-none" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 4v16m8-8H4" />
                </svg>
                Sign up free
              </Link>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-9 h-9 flex flex-col justify-center items-center gap-1.5 rounded-xl hover:bg-[#EDE9F8] transition"
            >
              <span className={`w-5 h-0.5 bg-[#1E1B2E] rounded transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`w-5 h-0.5 bg-[#1E1B2E] rounded transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`} />
              <span className={`w-5 h-0.5 bg-[#1E1B2E] rounded transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-[#FAF6F1] border-t border-[#EDE9F8] px-5 py-4 space-y-2">
            {['Features', 'How It Works', 'For Doctors', 'Emergency'].map((item) => (
              <Link key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`}
                className="block py-2.5 text-[#6B7280] hover:text-[#7C5CBF] font-medium text-sm transition-colors">
                {item}
              </Link>
            ))}
            <div className="pt-3 flex flex-col gap-2">
              <Link href="/login" className="text-center py-2.5 border border-[#EDE9F8] rounded-full text-sm text-[#7C5CBF] font-medium">Log in</Link>
              <Link href="/register" className="text-center py-2.5 bg-[#7C5CBF] rounded-full text-sm text-white font-semibold">Get started free</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-[96vh] flex items-center pt-6 pb-20 overflow-hidden">

        {/* Watercolor background image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-bg.png"
            alt=""
            fill
            className="object-cover opacity-40"
            priority
          />
          {/* Overlay gradient so text stays readable */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#FAF6F1]/80 via-[#FAF6F1]/60 to-[#FDF8FF]/70" />
        </div>

        {/* Morphing blobs on top of bg */}
        <div className="absolute top-[-60px] right-[-80px] w-[420px] h-[420px] bg-[#EDE9F8] blob-1 opacity-50 pointer-events-none z-0" />
        <div className="absolute bottom-[-40px] left-[-80px] w-[340px] h-[340px] bg-[#E6FAF5] blob-2 opacity-40 pointer-events-none z-0" />

        {/* Subtle dot grid */}
        <div className="absolute inset-0 pointer-events-none z-0" style={{
          backgroundImage: 'radial-gradient(circle, #C4B5E8 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          opacity: 0.18
        }} />

        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 w-full grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-4 items-center relative z-10">

          {/* ── LEFT ── */}
          <div className="max-w-xl">
            <div className="fade-up-1 inline-flex items-center gap-2 bg-white/80 backdrop-blur border border-[#EDE9F8] rounded-full px-4 py-2 text-xs font-bold text-[#7C5CBF] shadow-sm mb-6">
              <span className="w-2 h-2 rounded-full bg-[#3ECFAA] animate-pulse" />
              AI-Powered · Built at HackIndia 2026
            </div>

            <h1 className="fade-up-2 font-extrabold tracking-tight text-[#1E1B2E] leading-[1.07]" style={{ fontSize: 'clamp(2.6rem, 5.5vw, 4.2rem)' }}>
              Healthcare that<br />
              <em className="not-italic font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>truly cares</em>{' '}
              <span className="shimmer-text">about you</span>
            </h1>

            <p className="fade-up-3 text-[#6B7280] text-lg leading-relaxed mt-5 max-w-lg">
              AI triage, blockchain-secured records, and emergency tools — seamlessly woven together so the right care finds you at the right time.
            </p>

            <div className="fade-up-4 flex gap-3 mt-8 flex-wrap">
              <Link href="/register"
                className="group relative overflow-hidden bg-gradient-to-r from-[#7C5CBF] to-[#6340b0] text-white rounded-full px-8 py-3.5 font-bold text-sm shadow-lg shadow-[#7C5CBF]/30 hover:shadow-xl hover:shadow-[#7C5CBF]/40 hover:scale-105 transition-all duration-300 flex items-center gap-2">
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
                Get started free
                <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
              </Link>
              <Link href="#how-it-works"
                className="bg-white/80 backdrop-blur border-2 border-[#EDE9F8] text-[#7C5CBF] rounded-full px-8 py-3.5 font-bold text-sm hover:bg-[#EDE9F8] hover:border-[#7C5CBF]/30 transition-all duration-300">
                See how it works
              </Link>
            </div>

            {/* Social proof */}
            <div className="fade-up-5 flex items-center gap-4 mt-9">
              <div className="flex">
                {[['P','linear-gradient(135deg,#a78bfa,#ec4899)'],['R','linear-gradient(135deg,#3ECFAA,#0d9488)'],['A','linear-gradient(135deg,#fb923c,#f59e0b)'],['K','linear-gradient(135deg,#60a5fa,#6366f1)']].map(([init, grad], i) => (
                  <div key={i}
                    className="w-9 h-9 rounded-full border-2 border-[#FAF6F1] flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: grad as string, marginLeft: i > 0 ? '-10px' : '0', zIndex: 4 - i }}>
                    {init}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex gap-0.5 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-3.5 h-3.5 fill-amber-400" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  ))}
                </div>
                <p className="text-xs text-[#6B7280]">Trusted by <span className="font-bold text-[#1E1B2E]">10,000+</span> patients across India</p>
              </div>
            </div>
          </div>

          {/* ── RIGHT — Phone mockup + floating cards ── */}
          <div className="relative flex items-center justify-center lg:justify-end mt-12 lg:mt-0">

            {/* Glow circle behind phone */}
            <div className="absolute w-80 h-80 rounded-full bg-gradient-to-br from-[#EDE9F8] to-[#E6FAF5] blur-3xl opacity-70 pointer-events-none" />

            {/* Phone illustration — main centrepiece */}
            <div className="relative z-10 w-[280px] sm:w-[320px] fade-scale float-slow drop-shadow-2xl">
              <Image
                src="/hero-phone.png"
                alt="LifeLink app on phone"
                width={320}
                height={640}
                className="w-full h-auto object-contain"
                priority
              />

              {/* Overlay chat bubble on top of phone screen */}
              <div className="absolute top-[12%] left-[-18%] right-[-18%] bg-white rounded-2xl shadow-xl p-3 z-20 border border-[#EDE9F8] float-1" style={{ transform: 'rotate(-1.5deg)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-[#7C5CBF] to-[#3ECFAA] rounded-full flex items-center justify-center shrink-0">
                    <svg className="w-3 h-3 stroke-white fill-none" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                  </div>
                  <span className="text-[11px] font-bold text-[#1E1B2E]">LifeLink AI</span>
                  <span className="ml-auto flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-[9px] text-gray-400">Online</span>
                  </span>
                </div>
                <div className="bg-[#F5F3FF] rounded-xl px-3 py-2 text-[10px] text-[#7C5CBF] font-medium">
                  I've had a headache &amp; mild fever 🤒
                </div>
                <div className="mt-2 bg-white border border-[#EDE9F8] rounded-xl px-3 py-2">
                  <span className="inline-block bg-amber-50 text-amber-600 text-[9px] font-bold rounded-full px-2 py-0.5 mb-1">⚡ MODERATE RISK</span>
                  <p className="text-[10px] text-[#6B7280] leading-relaxed">Looks like a viral infection. Rest &amp; hydrate. See doctor if fever exceeds 101°F.</p>
                </div>
                <div className="flex gap-1.5 mt-2">
                  <span className="bg-[#EDE9F8] text-[#7C5CBF] text-[9px] font-semibold rounded-full px-2 py-1 cursor-pointer">📋 Analysis</span>
                  <span className="bg-[#E6FAF5] text-[#3ECFAA] text-[9px] font-semibold rounded-full px-2 py-1 cursor-pointer">👨‍⚕️ Doctor</span>
                </div>
              </div>
            </div>

            {/* Floating card — Records Safe */}
            <div className="absolute left-0 top-1/4 bg-white rounded-2xl shadow-xl px-4 py-3 w-44 z-20 border-l-4 border-[#3ECFAA] float-2 hidden md:flex items-center gap-2.5">
              <div className="bg-[#E6FAF5] rounded-xl p-2 shrink-0">
                <svg className="w-4 h-4 stroke-[#3ECFAA] fill-none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <div className="text-xs font-bold text-[#1E1B2E]">Records Safe</div>
                <div className="text-[10px] text-gray-400">IPFS · Encrypted</div>
              </div>
            </div>

            {/* Floating card — Stats */}
            <div className="absolute right-0 top-8 bg-[#7C5CBF] rounded-2xl shadow-xl px-4 py-3 w-36 z-20 text-white float-3 hidden md:block">
              <div className="text-[10px] opacity-60 mb-0.5">Patients helped</div>
              <div className="text-2xl font-extrabold tracking-tight">2,847</div>
              <div className="flex items-end gap-0.5 mt-2">
                {[3,5,4,7,6].map((h, i) => (
                  <div key={i} className={`rounded-sm w-3 transition-all duration-500 ${i === 4 ? 'bg-white' : 'bg-white/35'}`} style={{ height: `${h * 3.5}px` }} />
                ))}
              </div>
            </div>

            {/* Floating card — Emergency */}
            <div className="absolute right-0 bottom-10 bg-white rounded-2xl shadow-xl px-4 py-3 w-44 z-20 float-1 hidden md:block" style={{ animationDelay: '2s' }}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-[#1E1B2E]">Emergency Beacon</span>
                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              </div>
              <div className="text-[10px] text-gray-400 mb-2">QR ready · Tap to activate</div>
              <div className="grid grid-cols-5 gap-0.5 w-14">
                {[1,1,1,1,0,1,0,1,0,1,0,1,0,1,1,1,0,1,0,0,1,1,0,1,1].map((v, i) => (
                  <div key={i} className={`w-2.5 h-2.5 rounded-sm ${v ? 'bg-[#1E1B2E]' : 'bg-gray-100'}`} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60L60 48C120 36 240 12 360 6C480 0 600 12 720 24C840 36 960 48 1080 48C1200 48 1320 36 1380 30L1440 24V60H0Z" fill="#F5EFE8" />
          </svg>
        </div>
      </section>

      {/* ── MARQUEE TRUST STRIP ── */}
      <section className="bg-[#F5EFE8] py-5 overflow-hidden border-y border-[#EDE9F8]/60">
        <div className="flex overflow-hidden">
          <div className="marquee-track whitespace-nowrap flex gap-12 items-center">
            {[
              '✦ Groq LLaMA 3.3 70B', '✦ IPFS + Pinata', '✦ Ethereum Sepolia', '✦ Zero-login Emergency QR',
              '✦ Blockchain Consent', '✦ AI Triage in 2.3s', '✦ 10,000+ Patients', '✦ Built at HackIndia 2026',
              '✦ Groq LLaMA 3.3 70B', '✦ IPFS + Pinata', '✦ Ethereum Sepolia', '✦ Zero-login Emergency QR',
              '✦ Blockchain Consent', '✦ AI Triage in 2.3s', '✦ 10,000+ Patients', '✦ Built at HackIndia 2026',
            ].map((text, i) => (
              <span key={i} className="text-xs font-semibold text-[#7C5CBF] tracking-widest uppercase shrink-0">{text}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <section className="bg-[#1E1B2E] py-16 relative overflow-hidden" ref={statsRef}>
        {/* Decorative bg element */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(124,92,191,0.15) 0%, transparent 60%), radial-gradient(circle at 80% 50%, rgba(62,207,170,0.1) 0%, transparent 60%)'
        }} />
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: `${patients.toLocaleString()}+`, label: 'Patients Assisted', color: '#7C5CBF' },
              { value: `${responseTime}s`, label: 'Avg AI Response', color: '#3ECFAA' },
              { value: `${uptime}%`, label: 'Platform Uptime', color: '#7C5CBF' },
              { value: '100%', label: 'Blockchain Secured', color: '#3ECFAA' },
            ].map((stat, i) => (
              <div key={i} className={`text-center scroll-reveal ${i < 3 ? 'lg:border-r border-white/10' : ''}`} style={{ transitionDelay: `${i * 80}ms` }}>
                <div className="text-3xl md:text-4xl font-extrabold" style={{ color: stat.color }}>{stat.value}</div>
                <div className="text-xs text-white/40 mt-2 uppercase tracking-widest font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="bg-[#FAF6F1] py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#EDE9F8] blob-1 opacity-30 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 relative z-10">

          <div className="text-center mb-16 scroll-reveal">
            <span className="text-xs font-bold uppercase tracking-widest text-[#7C5CBF]">What We Offer</span>
            <h2 className="text-4xl font-extrabold text-[#1E1B2E] mt-3 tracking-tight">
              Everything your health <br className="hidden sm:block" />
              <span className="italic font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>journey needs</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              {
                icon: (
                  <svg className="w-6 h-6 stroke-[#7C5CBF] fill-none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                ),
                img: '/feature-ai.png',
                title: 'AI Health Assistant',
                desc: 'Chat with LLaMA 3.3 70B about your symptoms anytime. Get instant triage, risk assessment, and personalized guidance in plain language.',
                tag: '✦ Powered by Groq',
                bg: '#EDE9F8',
              },
              {
                icon: (
                  <svg className="w-6 h-6 stroke-[#7C5CBF] fill-none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                ),
                title: 'Decentralized Records',
                desc: 'Upload reports, scans, prescriptions. They live on IPFS — tamper-proof, always accessible, permanently yours.',
                tag: '✦ IPFS + Pinata',
                bg: '#E6FAF5',
              },
              {
                icon: (
                  <svg className="w-6 h-6 stroke-[#7C5CBF] fill-none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                ),
                title: 'Emergency Beacon',
                desc: 'One tap generates a QR with your blood type, allergies, and contacts. First responders scan it — no app, no login.',
                tag: '✦ Zero login needed',
                bg: '#FFF8EC',
              },
              {
                icon: (
                  <svg className="w-6 h-6 stroke-[#7C5CBF] fill-none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                ),
                title: 'Consent on Chain',
                desc: 'Control exactly who sees your medical data with blockchain-verified consent. Every approval is immutable and auditable.',
                tag: '✦ Ethereum Sepolia',
                bg: '#EDE9F8',
              },
            ].map((feat, i) => (
              <div
                key={i}
                className="scroll-reveal card-hover bg-white rounded-3xl p-8 border border-[#F0EBE3] cursor-pointer group"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="flex items-start justify-between mb-5">
                  <div className="rounded-2xl p-3 w-fit" style={{ background: feat.bg }}>
                    {feat.icon}
                  </div>
                  {feat.img && (
                    <div className="w-16 h-16 relative opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500">
                      <Image src={feat.img} alt={feat.title} fill className="object-contain" />
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-bold text-[#1E1B2E] mb-3">{feat.title}</h3>
                <p className="text-[#6B7280] text-sm leading-relaxed">{feat.desc}</p>
                <div className="mt-5 inline-block bg-[#E6FAF5] text-[#3ECFAA] text-xs rounded-full px-3 py-1 font-semibold">{feat.tag}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="bg-[#F5EFE8] py-24 relative overflow-hidden">
        {/* Organic blob */}
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#EDE9F8] blob-2 opacity-40 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 relative z-10">
          <div className="text-center mb-16 scroll-reveal">
            <span className="text-xs font-bold uppercase tracking-widest text-[#7C5CBF]">How It Works</span>
            <h2 className="text-4xl font-extrabold text-[#1E1B2E] mt-3 tracking-tight">
              Three steps to <span className="italic" style={{ fontFamily: "'Playfair Display', serif" }}>better care</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto relative">
            {/* Connecting dashed line */}
            <div className="hidden md:block absolute top-16 left-[22%] right-[22%] border-t-2 border-dashed border-[#C4B5E8]/60 z-0" />

            {[
              {
                num: '01',
                icon: <svg className="w-10 h-10 stroke-[#7C5CBF] fill-none" strokeWidth="1.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
                title: 'Describe your symptoms',
                desc: 'Chat naturally with LifeLink AI. No forms, no medical jargon — just an honest conversation.',
                color: '#EDE9F8',
              },
              {
                num: '02',
                icon: <svg className="w-10 h-10 stroke-[#7C5CBF] fill-none" strokeWidth="1.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
                title: 'Get triaged instantly',
                desc: 'AI assesses your risk level in under 3 seconds and gives clear, actionable next steps.',
                color: '#E6FAF5',
              },
              {
                num: '03',
                icon: <svg className="w-10 h-10 stroke-[#7C5CBF] fill-none" strokeWidth="1.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
                title: 'Connect with your doctor',
                desc: 'Verified doctors receive your AI summary and records — full context, zero friction.',
                color: '#FFF8EC',
              },
            ].map((step, i) => (
              <div key={i} className="scroll-reveal relative z-10 bg-white rounded-3xl p-8 text-center shadow-sm border border-[#EDE9F8] hover:shadow-xl hover:-translate-y-2 transition-all duration-500 cursor-default"
                style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="w-12 h-12 rounded-full bg-[#7C5CBF] text-white flex items-center justify-center text-sm font-black mx-auto mb-6 shadow-lg shadow-[#7C5CBF]/30">
                  {step.num}
                </div>
                <div className="rounded-2xl h-24 flex items-center justify-center mx-auto w-24 mb-5" style={{ background: step.color }}>
                  {step.icon}
                </div>
                <h3 className="font-bold text-lg text-[#1E1B2E] mb-2">{step.title}</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOR DOCTORS ── */}
      <section id="for-doctors" className="bg-[#FAF6F1] py-24 relative overflow-hidden">
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-[#E6FAF5] blob-1 opacity-40 pointer-events-none -translate-y-1/2" />
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* LEFT — Doctor illustration + dashboard */}
            <div className="relative scroll-reveal-left">
              <div className="relative">
                {/* Illustration */}
                <div className="absolute -top-8 -right-8 w-56 h-56 opacity-80 float-slow pointer-events-none">
                  <Image src="/doctor-illustration.png" alt="Doctor illustration" fill className="object-contain" />
                </div>

                {/* Dashboard card */}
                <div className="bg-white rounded-3xl shadow-xl p-6 relative z-10 hover:-translate-y-1 transition-transform duration-500">
                  <div className="flex items-center justify-between mb-5">
                    <span className="font-bold text-[#1E1B2E]">Patient Dashboard</span>
                    <span className="bg-[#EDE9F8] text-[#7C5CBF] rounded-full px-3 py-1 text-xs font-bold">3 new</span>
                  </div>

                  <div className="space-y-2.5">
                    {[
                      { init: 'P', name: 'Priya Mehta', sub: 'Fever · Headache', badge: 'MEDIUM', badgeColor: 'bg-amber-100 text-amber-600', grad: 'from-purple-400 to-pink-400' },
                      { init: 'R', name: 'Raj Kumar', sub: 'Chest pain', badge: 'HIGH', badgeColor: 'bg-red-100 text-red-600', grad: 'from-[#3ECFAA] to-teal-500' },
                      { init: 'S', name: 'Sneha Joshi', sub: 'Annual checkup', badge: 'LOW', badgeColor: 'bg-green-100 text-green-600', grad: 'from-blue-400 to-indigo-400' },
                    ].map((row, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-2xl hover:bg-[#F5EFE8] transition duration-200 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${row.grad} flex items-center justify-center text-white text-xs font-bold shrink-0`}>{row.init}</div>
                          <div>
                            <div className="text-sm font-semibold text-[#1E1B2E]">{row.name}</div>
                            <div className="text-[11px] text-gray-400">{row.sub}</div>
                          </div>
                        </div>
                        <span className={`${row.badgeColor} rounded-full px-2.5 py-0.5 text-[10px] font-bold`}>{row.badge}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Floating notification */}
                <div className="absolute -right-6 -bottom-5 bg-[#7C5CBF] text-white rounded-2xl shadow-xl p-4 w-52 float-2 z-20 hidden md:block">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-xs font-bold">New consultation</span>
                  </div>
                  <div className="text-[11px] opacity-70">Riya S. · Risk: MEDIUM</div>
                  <div className="mt-2.5 bg-white/15 hover:bg-white/25 rounded-full px-3 py-1 text-xs w-fit cursor-pointer transition">View Record →</div>
                </div>
              </div>
            </div>

            {/* RIGHT text */}
            <div className="scroll-reveal-right">
              <span className="text-xs font-bold uppercase tracking-widest text-[#7C5CBF]">For Doctors</span>
              <h2 className="text-4xl font-extrabold text-[#1E1B2E] mt-3 leading-tight tracking-tight">
                Your patients,<br />
                <span className="italic" style={{ fontFamily: "'Playfair Display', serif" }}>organized & ready</span>
              </h2>
              <p className="text-[#6B7280] mt-4 leading-relaxed">
                LifeLink gives verified doctors AI-summarized histories, consent-gated records, and real-time tools — so you focus on care, not paperwork.
              </p>

              <div className="space-y-4 mt-8">
                {[
                  'AI pre-screening saves 2+ hours of consultation time daily',
                  'Blockchain-verified patient consent on every record access',
                  'Instant IPFS access to scans, reports, and prescriptions',
                ].map((point, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#E6FAF5] flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-3 h-3 stroke-[#3ECFAA] fill-none" strokeWidth="3" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm text-[#6B7280] leading-relaxed">{point}</span>
                  </div>
                ))}
              </div>

              <Link href="/register?role=doctor" className="inline-flex items-center gap-2 mt-10 bg-[#3ECFAA] text-white rounded-full px-8 py-4 font-bold hover:bg-[#2bb898] hover:shadow-2xl hover:shadow-[#3ECFAA]/30 hover:scale-105 transition-all duration-300">
                Join as a Doctor →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="bg-[#F5EFE8] py-24 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-80 h-80 bg-[#EDE9F8] blob-2 opacity-30 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 relative z-10">
          <div className="text-center mb-14 scroll-reveal">
            <span className="text-xs font-bold uppercase tracking-widest text-[#7C5CBF]">Loved By Patients</span>
            <h2 className="text-4xl font-extrabold text-[#1E1B2E] mt-3 tracking-tight">
              Real people, <span className="italic" style={{ fontFamily: "'Playfair Display', serif" }}>real care</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote: '"LifeLink\'s AI caught that my symptoms needed urgent attention before I even reached the clinic. It genuinely felt like someone was looking out for me."',
                name: 'Priya Mehta', role: 'Patient, Mumbai', init: 'P', grad: 'from-purple-400 to-pink-400',
              },
              {
                quote: '"The AI pre-screening saves me hours every day. Patients arrive with their history already organized. It\'s completely changed how I practice medicine."',
                name: 'Dr. Arjun Kumar', role: 'Cardiologist, Delhi', init: 'A', grad: 'from-blue-400 to-indigo-500',
              },
              {
                quote: '"I generated an emergency beacon before my surgery. Knowing first responders would have my info gave me so much peace of mind. Absolutely brilliant."',
                name: 'Sneha Rawat', role: 'Patient, Bangalore', init: 'S', grad: 'from-[#3ECFAA] to-teal-500',
              },
            ].map((t, i) => (
              <div key={i} className="scroll-reveal card-hover bg-white rounded-3xl p-8 border border-[#EDE9F8] flex flex-col"
                style={{ transitionDelay: `${i * 100}ms` }}>
                {/* Stars */}
                <div className="flex gap-1 mb-5">
                  {[...Array(5)].map((_, j) => (
                    <svg key={j} className="w-4 h-4 fill-[#7C5CBF]" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Large decorative quote mark */}
                <div className="text-6xl text-[#EDE9F8] font-serif leading-none mb-2 -mt-2 select-none">"</div>
                <p className="text-[#1E1B2E] text-sm leading-relaxed flex-grow">{t.quote.replace(/^"|"$/g, '')}</p>

                <div className="flex items-center gap-3 mt-6 pt-5 border-t border-[#F0EBE3]">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.grad} flex items-center justify-center text-white font-bold text-sm`}>{t.init}</div>
                  <div>
                    <div className="font-bold text-sm text-[#1E1B2E]">{t.name}</div>
                    <div className="text-xs text-gray-400">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EMERGENCY ── */}
      <section id="emergency" className="bg-[#FAF6F1] py-24 relative overflow-hidden border-t-4 border-amber-400">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFF8F0] via-[#FAF6F1] to-[#FDF8FF] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* LEFT */}
            <div className="scroll-reveal-left">
              <span className="inline-block bg-amber-100 text-amber-700 rounded-full px-4 py-1.5 text-sm font-bold">🚨 Emergency Ready</span>
              <h2 className="text-4xl md:text-5xl font-extrabold text-[#1E1B2E] mt-5 leading-tight tracking-tight">
                When every<br />
                <span className="italic" style={{ fontFamily: "'Playfair Display', serif" }}>second counts</span>
              </h2>
              <p className="text-[#6B7280] mt-4 leading-relaxed max-w-md">
                One tap. Your blood type, allergies, medications, and emergency contacts — in a QR code anyone can scan. No app. No login. Just life-saving information, instantly.
              </p>

              <div className="space-y-3 mt-8">
                {[
                  'Instant QR generation — no setup needed',
                  'Works offline — scannable by any camera',
                  'Includes blood type, allergies, medications',
                  'Auto-shares emergency contact details',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                    <span className="text-sm text-[#6B7280]">{item}</span>
                  </div>
                ))}
              </div>

              <Link href="/register" className="inline-flex items-center gap-2 mt-10 bg-amber-500 text-white rounded-full px-8 py-4 font-bold hover:bg-amber-600 hover:shadow-2xl hover:shadow-amber-500/25 hover:scale-105 transition-all duration-300">
                Generate My Beacon →
              </Link>
            </div>

            {/* RIGHT — Emergency visual */}
            <div className="scroll-reveal-right flex justify-center">
              <div className="relative">
                {/* Illustration behind */}
                <div className="absolute -top-10 -right-10 w-52 h-52 opacity-75 float-slow pointer-events-none">
                  <Image src="/emergency-illustration.png" alt="Emergency" fill className="object-contain" />
                </div>

                <div className="bg-white rounded-3xl shadow-2xl p-8 text-center w-80 hover:-translate-y-2 transition-transform duration-500 relative z-10">
                  <div className="text-sm font-bold text-[#1E1B2E] mb-5">Your Emergency Profile</div>

                  {/* QR code */}
                  <div className="mx-auto w-36 h-36 bg-white border border-gray-100 rounded-2xl p-2 shadow-inner mb-5">
                    <div className="grid grid-cols-8 gap-px w-full h-full">
                      {[
                        1,1,1,1,1,1,1,0,
                        1,0,0,0,0,0,1,0,
                        1,0,1,1,1,0,1,1,
                        1,0,1,0,1,0,1,0,
                        1,0,1,1,1,0,1,1,
                        1,0,0,0,0,0,1,0,
                        1,1,1,1,1,1,1,0,
                        0,1,0,1,0,1,0,1,
                      ].map((v, idx) => (
                        <div key={idx} className={`rounded-sm ${v ? 'bg-[#1E1B2E]' : 'bg-gray-100'}`} />
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {['🩸 O+ Blood Type', '✓ No Allergies', '💊 2 Medications', '📞 Dr. Sharma'].map((item, i) => (
                      <div key={i} className="bg-[#E6FAF5] text-[#3ECFAA] rounded-full text-xs px-3 py-2 font-semibold text-center">{item}</div>
                    ))}
                  </div>

                  <div className="flex items-center justify-center gap-2 mt-5">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-xs text-gray-400">Beacon Active · Updates in real-time</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="relative overflow-hidden py-28 text-center bg-[#1E1B2E]">
        {/* Decorative blob rings */}
        <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] rounded-full bg-[#7C5CBF]/10 blob-1 pointer-events-none" />
        <div className="absolute bottom-[-80px] right-[-80px] w-[400px] h-[400px] rounded-full bg-[#3ECFAA]/8 blob-2 pointer-events-none" />

        {/* Dot pattern */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle, rgba(124,92,191,0.15) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />

        <div className="relative z-10 max-w-3xl mx-auto px-5 sm:px-8 scroll-reveal">
          <div className="inline-block bg-white/8 border border-white/15 text-white/80 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            ✦ Start your health journey today
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight tracking-tight">
            Your health deserves <br />
            <span className="shimmer-text">the best care</span>
          </h2>
          <p className="text-white/60 text-lg mt-5 max-w-lg mx-auto leading-relaxed">
            Join LifeLink today. Free forever for patients. Doctors verified within 24 hours.
          </p>
          <div className="flex gap-4 justify-center mt-10 flex-wrap">
            <Link href="/register" className="bg-white text-[#7C5CBF] rounded-full px-10 py-4 font-bold hover:shadow-2xl hover:scale-105 transition-all duration-300 hover:bg-[#F5EFE8]">
              Get started free →
            </Link>
            <Link href="#contact" className="border-2 border-white/25 text-white rounded-full px-10 py-4 font-bold hover:bg-white/10 hover:border-white/40 transition-all duration-300">
              Talk to us
            </Link>
          </div>
          <p className="mt-8 text-white/30 text-sm">No credit card required · Free for patients · Doctors verified in 24h</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#1E1B2E] text-white pt-16 pb-8 relative border-t border-white/8">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#7C5CBF] via-[#3ECFAA] to-[#7C5CBF]" />
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div className="col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-[#7C5CBF] to-[#3ECFAA] rounded-xl flex items-center justify-center">
                  <svg className="w-4 h-4 stroke-white fill-none" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <span className="font-extrabold text-xl tracking-tight">LifeLink</span>
              </div>
              <p className="text-white/40 text-sm leading-relaxed">Caring for India, intelligently.</p>
              <p className="text-white/25 text-xs mt-3">Built at HackIndia 2026</p>
              <p className="text-[#7C5CBF] text-xs mt-0.5">by Syntax Coders 💜</p>
            </div>

            {[
              { heading: 'Product', links: ['Features', 'How It Works', 'Emergency', 'For Doctors'] },
              { heading: 'Company', links: ['About', 'Privacy Policy', 'Terms of Service', 'GitHub'] },
              { heading: 'Connect', links: ['team@lifelink.app', 'GitHub', 'Twitter', 'India 🇮🇳'] },
            ].map((col, i) => (
              <div key={i}>
                <h4 className="text-xs font-bold uppercase tracking-widest text-white/50 mb-5">{col.heading}</h4>
                <ul className="space-y-3">
                  {col.links.map((link, j) => (
                    <li key={j}>
                      <Link href="#" className="text-white/40 hover:text-white text-sm transition-colors duration-200">{link}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-white/8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-white/25 text-sm">© 2026 LifeLink · Made with 💜 in India</p>
            <p className="text-white/15 text-xs">All rights reserved · HackIndia 2026</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
