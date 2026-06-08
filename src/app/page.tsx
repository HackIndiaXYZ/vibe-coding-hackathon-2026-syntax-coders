'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Home() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  const [patients, setPatients] = useState(0)
  const [uptime, setUptime] = useState(0)
  const [response, setResponse] = useState(0)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
        }
      })
    }, { threshold: 0.1 })

    document.querySelectorAll('.scroll-reveal').forEach((el) => {
      observer.observe(el)
    })
    
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          let startTimestamp: number | null = null;
          const duration = 2000;
          const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            // Ease out quad
            const easeOut = progress * (2 - progress);
            setPatients(Math.floor(easeOut * 10000));
            setUptime(Number((easeOut * 99.9).toFixed(1)));
            setResponse(Number((easeOut * 2.3).toFixed(1)));
            if (progress < 1) {
              window.requestAnimationFrame(step);
            } else {
                setPatients(10000);
                setUptime(99.9);
                setResponse(2.3);
            }
          };
          window.requestAnimationFrame(step);
          statsObserver.disconnect();
        }
      })
    }, { threshold: 0.5 })
    
    const statsSection = document.getElementById('stats-strip')
    if(statsSection) statsObserver.observe(statsSection)

    return () => {
      observer.disconnect()
      statsObserver.disconnect()
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-[#6B7280]">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-8px) rotate(0.5deg); }
          66% { transform: translateY(-4px) rotate(-0.5deg); }
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
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .float-1 { animation: float 4s ease-in-out infinite; }
        .float-2 { animation: float 4s ease-in-out infinite; animation-delay: 1s; }
        .float-3 { animation: float 4s ease-in-out infinite; animation-delay: 2s; }
        .blob-1 { animation: blobFloat 10s ease-in-out infinite; }
        .blob-2 { animation: blobFloat 12s ease-in-out infinite reverse; }
        .fade-up { animation: fadeUp 0.6s ease-out forwards; }
        .fade-up-1 { animation: fadeUp 0.6s ease-out 0.1s forwards; opacity: 0; }
        .fade-up-2 { animation: fadeUp 0.6s ease-out 0.2s forwards; opacity: 0; }
        .fade-up-3 { animation: fadeUp 0.6s ease-out 0.3s forwards; opacity: 0; }
        .fade-up-4 { animation: fadeUp 0.6s ease-out 0.4s forwards; opacity: 0; }
        .typing-dot-1 { animation: typingBounce 1s ease-in-out infinite; }
        .typing-dot-2 { animation: typingBounce 1s ease-in-out infinite; animation-delay: 0.2s; }
        .typing-dot-3 { animation: typingBounce 1s ease-in-out infinite; animation-delay: 0.4s; }
        
        .scroll-reveal { opacity:0; transform:translateY(30px); transition: opacity 0.6s ease, transform 0.6s ease; }
        .scroll-reveal.visible { opacity:1; transform:translateY(0); }
      `}</style>

      {/* NAVBAR */}
      <nav className={`sticky top-0 z-50 bg-white border-b border-gray-100 transition-shadow duration-300 ${scrolled ? 'shadow-sm' : 'shadow-none'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <svg className="w-6 h-6 stroke-[#3ECFAA] animate-pulse" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="font-bold text-xl text-[#1E1B2E] ml-2 tracking-tight">LifeLink</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-[#6B7280] hover:text-[#7C5CBF] transition text-sm">Features</Link>
              <Link href="#how-it-works" className="text-[#6B7280] hover:text-[#7C5CBF] transition text-sm">How It Works</Link>
              <Link href="#for-doctors" className="text-[#6B7280] hover:text-[#7C5CBF] transition text-sm">For Doctors</Link>
              <Link href="#emergency" className="text-[#6B7280] hover:text-[#7C5CBF] transition text-sm">Emergency</Link>
            </div>
            
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/login" className="text-[#6B7280] hover:text-[#7C5CBF] transition text-sm">Log in</Link>
              <Link href="/register" className="bg-[#7C5CBF] text-white rounded-full px-5 py-2 text-sm hover:bg-[#6a4daa] hover:shadow-lg transition-all duration-300">
                Sign up free
              </Link>
            </div>

            <div className="md:hidden flex items-center">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-[#1E1B2E] hover:text-[#7C5CBF] focus:outline-none">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link href="#features" className="block px-3 py-2 text-base font-medium text-[#6B7280] hover:text-[#7C5CBF] hover:bg-gray-50 rounded-md">Features</Link>
              <Link href="#how-it-works" className="block px-3 py-2 text-base font-medium text-[#6B7280] hover:text-[#7C5CBF] hover:bg-gray-50 rounded-md">How It Works</Link>
              <Link href="#for-doctors" className="block px-3 py-2 text-base font-medium text-[#6B7280] hover:text-[#7C5CBF] hover:bg-gray-50 rounded-md">For Doctors</Link>
              <Link href="#emergency" className="block px-3 py-2 text-base font-medium text-[#6B7280] hover:text-[#7C5CBF] hover:bg-gray-50 rounded-md">Emergency</Link>
              <Link href="/login" className="block px-3 py-2 text-base font-medium text-[#6B7280] hover:text-[#7C5CBF] hover:bg-gray-50 rounded-md">Log in</Link>
              <Link href="/register" className="block px-3 py-2 text-base font-medium text-[#7C5CBF] hover:bg-gray-50 rounded-md">Sign up free</Link>
            </div>
          </div>
        )}
      </nav>

      {/* SECTION 1 — HERO */}
      <section className="min-h-screen flex items-center relative overflow-hidden py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center">
          
          {/* LEFT SIDE */}
          <div className="z-10">
            <div className="inline-flex items-center gap-2 bg-[#EDE9F8] text-[#7C5CBF] rounded-full px-4 py-1.5 text-sm font-medium fade-up-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              AI-Powered Healthcare Platform
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] text-[#1E1B2E] mt-6 tracking-tight fade-up-2">
              Healthcare that <br/>
              feels like it <br/>
              <span className="bg-gradient-to-r from-[#7C5CBF] to-[#3ECFAA] bg-clip-text text-transparent">cares about you</span>
            </h1>

            <p className="text-lg text-[#6B7280] max-w-lg mt-5 leading-relaxed fade-up-3">
              LifeLink brings AI triage, secure medical records, and emergency-ready tools together — so you always have the right care at the right time.
            </p>

            <div className="flex gap-4 mt-8 flex-wrap fade-up-4">
              <Link href="/register" className="bg-[#7C5CBF] text-white rounded-full px-8 py-3.5 font-semibold hover:shadow-xl hover:scale-105 hover:bg-[#6a4daa] transition-all duration-300">
                Get started free →
              </Link>
              <Link href="#how-it-works" className="border-2 border-[#EDE9F8] text-[#7C5CBF] rounded-full px-8 py-3.5 font-semibold hover:bg-[#EDE9F8] transition-all duration-300">
                See how it works
              </Link>
            </div>

            <div className="mt-8 flex items-center gap-3 fade-up-4">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full border-2 border-white bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs font-bold z-30">P</div>
                <div className="w-8 h-8 rounded-full border-2 border-white bg-gradient-to-br from-[#3ECFAA] to-teal-400 flex items-center justify-center text-white text-xs font-bold z-20">R</div>
                <div className="w-8 h-8 rounded-full border-2 border-white bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center text-white text-xs font-bold z-10">A</div>
              </div>
              <p className="text-sm text-[#6B7280]">Loved by 10,000+ patients across India <span className="text-yellow-400">⭐</span></p>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="relative w-full max-w-lg mx-auto lg:ml-auto">
            {/* Background Blobs */}
            <div className="absolute w-80 h-80 rounded-full bg-[#EDE9F8] blur-3xl opacity-60 -top-10 -right-10 blob-1 -z-10"></div>
            <div className="absolute w-64 h-64 rounded-full bg-[#E6FAF5] blur-3xl opacity-50 bottom-0 right-20 blob-2 -z-10"></div>

            {/* MAIN MOCKUP CARD */}
            <div className="relative z-10 bg-white rounded-3xl shadow-2xl overflow-hidden transform rotate-1 hover:rotate-0 transition-transform duration-500 fade-up-3">
              {/* Top Bar */}
              <div className="bg-[#F5F3FF] px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="bg-white rounded-full px-4 py-1 text-xs text-gray-400 flex-1 ml-2 text-center">
                  lifelink.app/chat
                </div>
              </div>

              {/* Chat Header */}
              <div className="bg-[#7C5CBF] px-5 py-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 stroke-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <div className="ml-2">
                    <div className="text-white font-semibold text-sm">LifeLink AI</div>
                    <div className="text-white/60 text-xs">Health Assistant</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                  <div className="text-white/80 text-xs">Online</div>
                </div>
              </div>

              {/* Chat Body */}
              <div className="bg-[#FAFAFA] p-4 space-y-4 h-72 overflow-hidden flex flex-col justify-end">
                {/* Message 1 */}
                <div className="flex flex-col items-end">
                  <div className="bg-[#7C5CBF] text-white rounded-2xl rounded-tr-sm px-4 py-3 text-sm max-w-[78%] shadow-sm">
                    I've had a headache and mild fever since yesterday 🤒
                  </div>
                  <div className="text-xs text-gray-400 text-right mt-1">2 min ago</div>
                </div>

                {/* Message 2 - AI typing */}
                <div className="flex items-center gap-1 bg-white rounded-2xl rounded-tl-sm px-4 py-3 w-fit shadow-sm border border-gray-100">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#7C5CBF]/40 typing-dot-1"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#7C5CBF]/40 typing-dot-2"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#7C5CBF]/40 typing-dot-3"></div>
                </div>

                {/* Message 3 - AI Response */}
                <div className="bg-white rounded-2xl rounded-tl-sm p-4 max-w-[88%] shadow-sm border border-gray-100">
                  <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-600 border border-amber-200 rounded-full px-3 py-1 text-xs font-semibold">
                    <svg className="w-3 h-3 fill-amber-600" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>
                    MODERATE RISK — Viral Infection Likely
                  </div>
                  <p className="text-sm text-[#6B7280] mt-2 leading-relaxed">
                    Your symptoms suggest a viral infection. Rest and stay hydrated. See a doctor if fever exceeds 101°F or persists 3+ days.
                  </p>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <div className="bg-[#EDE9F8] text-[#7C5CBF] rounded-full px-3 py-1 text-xs cursor-pointer hover:bg-[#7C5CBF] hover:text-white transition duration-300">
                      📋 Full Analysis
                    </div>
                    <div className="bg-[#E6FAF5] text-[#3ECFAA] rounded-full px-3 py-1 text-xs cursor-pointer hover:bg-[#3ECFAA] hover:text-white transition duration-300">
                      👨‍⚕️ Find Doctor
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat Input Bar */}
              <div className="bg-white border-t border-gray-100 px-4 py-3 flex items-center gap-3">
                <div className="bg-[#F5F3FF] rounded-full px-4 py-2.5 text-xs text-gray-400 flex-1">
                  Describe your symptoms...
                </div>
                <div className="bg-[#7C5CBF] rounded-full p-2.5 cursor-pointer hover:bg-[#6a4daa] transition-colors">
                  <svg className="w-4 h-4 stroke-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* FLOATING CARD 1 */}
            <div className="hidden md:block absolute -left-12 top-16 bg-white rounded-2xl shadow-xl p-4 w-44 z-20 border-l-4 border-[#3ECFAA] float-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-[#E6FAF5] rounded-lg p-1.5 flex items-center justify-center">
                  <svg className="w-4 h-4 stroke-[#3ECFAA]" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <span className="font-semibold text-sm text-[#1E1B2E]">Records Safe</span>
              </div>
              <div className="text-xs text-gray-400">IPFS · Encrypted</div>
            </div>

            {/* FLOATING CARD 2 */}
            <div className="hidden md:block absolute -right-10 bottom-16 bg-white rounded-2xl shadow-xl p-4 w-48 z-20 float-2">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm text-[#1E1B2E]">Emergency Beacon</span>
                <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></div>
              </div>
              <div className="text-xs text-gray-400 mb-3">QR ready · Tap to activate</div>
              <div className="grid grid-cols-6 gap-0.5 w-20">
                {/* Row 1 */}
                <div className="w-2.5 h-2.5 rounded-sm bg-[#1E1B2E]"></div>
                <div className="w-2.5 h-2.5 rounded-sm bg-[#1E1B2E]"></div>
                <div className="w-2.5 h-2.5 rounded-sm bg-[#1E1B2E]"></div>
                <div className="w-2.5 h-2.5 rounded-sm bg-gray-100"></div>
                <div className="w-2.5 h-2.5 rounded-sm bg-[#1E1B2E]"></div>
                <div className="w-2.5 h-2.5 rounded-sm bg-gray-100"></div>
                {/* Row 2 */}
                <div className="w-2.5 h-2.5 rounded-sm bg-[#1E1B2E]"></div>
                <div className="w-2.5 h-2.5 rounded-sm bg-gray-100"></div>
                <div className="w-2.5 h-2.5 rounded-sm bg-[#1E1B2E]"></div>
                <div className="w-2.5 h-2.5 rounded-sm bg-[#1E1B2E]"></div>
                <div className="w-2.5 h-2.5 rounded-sm bg-gray-100"></div>
                <div className="w-2.5 h-2.5 rounded-sm bg-[#1E1B2E]"></div>
                {/* Row 3 */}
                <div className="w-2.5 h-2.5 rounded-sm bg-gray-100"></div>
                <div className="w-2.5 h-2.5 rounded-sm bg-[#1E1B2E]"></div>
                <div className="w-2.5 h-2.5 rounded-sm bg-gray-100"></div>
                <div className="w-2.5 h-2.5 rounded-sm bg-[#1E1B2E]"></div>
                <div className="w-2.5 h-2.5 rounded-sm bg-[#1E1B2E]"></div>
                <div className="w-2.5 h-2.5 rounded-sm bg-gray-100"></div>
                {/* Row 4 */}
                <div className="w-2.5 h-2.5 rounded-sm bg-[#1E1B2E]"></div>
                <div className="w-2.5 h-2.5 rounded-sm bg-[#1E1B2E]"></div>
                <div className="w-2.5 h-2.5 rounded-sm bg-gray-100"></div>
                <div className="w-2.5 h-2.5 rounded-sm bg-gray-100"></div>
                <div className="w-2.5 h-2.5 rounded-sm bg-[#1E1B2E]"></div>
                <div className="w-2.5 h-2.5 rounded-sm bg-[#1E1B2E]"></div>
              </div>
            </div>

            {/* FLOATING CARD 3 */}
            <div className="hidden md:block absolute -right-6 top-8 bg-[#7C5CBF] rounded-2xl shadow-xl p-4 w-40 z-20 text-white float-3">
              <div className="text-xs opacity-70 mb-1">Patients helped</div>
              <div className="text-3xl font-bold">2,847</div>
              <div className="flex items-end gap-1 mt-3 h-8">
                <div className="bg-white/40 rounded-sm w-3 h-3"></div>
                <div className="bg-white/40 rounded-sm w-3 h-5"></div>
                <div className="bg-white/40 rounded-sm w-3 h-4"></div>
                <div className="bg-white/40 rounded-sm w-3 h-7"></div>
                <div className="bg-white rounded-sm w-3 h-6"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 — STATS STRIP */}
      <section id="stats-strip" className="bg-[#1E1B2E] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center lg:border-r border-white/10 scroll-reveal">
              <div className="text-3xl md:text-4xl font-bold text-white">{patients.toLocaleString()}+</div>
              <div className="text-xs md:text-sm text-white/50 mt-2 uppercase tracking-wide">Patients Assisted</div>
            </div>
            <div className="text-center lg:border-r border-white/10 scroll-reveal">
              <div className="text-3xl md:text-4xl font-bold text-white">{response}s</div>
              <div className="text-xs md:text-sm text-white/50 mt-2 uppercase tracking-wide">Avg AI Response</div>
            </div>
            <div className="text-center lg:border-r border-white/10 scroll-reveal">
              <div className="text-3xl md:text-4xl font-bold text-white">{uptime}%</div>
              <div className="text-xs md:text-sm text-white/50 mt-2 uppercase tracking-wide">Platform Uptime</div>
            </div>
            <div className="text-center scroll-reveal">
              <div className="text-3xl md:text-4xl font-bold text-white">100%</div>
              <div className="text-xs md:text-sm text-white/50 mt-2 uppercase tracking-wide">Blockchain Secured</div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 — FEATURES */}
      <section id="features" className="bg-[#FAFAFA] py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 scroll-reveal">
            <div className="uppercase tracking-widest text-xs text-[#7C5CBF] font-semibold">WHAT WE OFFER</div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1E1B2E] mt-3 tracking-tight">Everything your health journey needs</h2>
            <p className="text-[#6B7280] mt-4 max-w-xl mx-auto leading-relaxed">
              Powerful technology seamlessly integrated into an intuitive, caring interface.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Feature 1 */}
            <div className="bg-white rounded-3xl p-8 border border-[#EDE9F8] hover:shadow-xl hover:-translate-y-1.5 hover:border-[#7C5CBF]/30 transition-all duration-300 cursor-pointer scroll-reveal">
              <div className="bg-[#EDE9F8] rounded-2xl p-3 w-fit mb-5">
                <svg className="w-6 h-6 stroke-[#7C5CBF] fill-none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#1E1B2E] mb-3">AI Health Assistant</h3>
              <p className="text-[#6B7280] text-sm leading-relaxed">
                Chat with LLaMA 3.3 70B about your symptoms anytime. Get instant triage, risk assessment, and personalized guidance — in plain language you understand.
              </p>
              <div className="mt-5 bg-[#E6FAF5] text-[#3ECFAA] text-xs rounded-full px-3 py-1 w-fit font-medium">
                ✦ Powered by Groq
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-3xl p-8 border border-[#EDE9F8] hover:shadow-xl hover:-translate-y-1.5 hover:border-[#7C5CBF]/30 transition-all duration-300 cursor-pointer scroll-reveal">
              <div className="bg-[#EDE9F8] rounded-2xl p-3 w-fit mb-5">
                <svg className="w-6 h-6 stroke-[#7C5CBF] fill-none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  <path d="M12 9v2m0 4h.01" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#1E1B2E] mb-3">Decentralized Records</h3>
              <p className="text-[#6B7280] text-sm leading-relaxed">
                Upload your reports, scans, and prescriptions. They live on IPFS — tamper-proof, always accessible, and permanently yours. No central server can take them away.
              </p>
              <div className="mt-5 bg-[#E6FAF5] text-[#3ECFAA] text-xs rounded-full px-3 py-1 w-fit font-medium">
                ✦ IPFS + Pinata
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-3xl p-8 border border-[#EDE9F8] hover:shadow-xl hover:-translate-y-1.5 hover:border-[#7C5CBF]/30 transition-all duration-300 cursor-pointer scroll-reveal">
              <div className="bg-[#EDE9F8] rounded-2xl p-3 w-fit mb-5">
                <svg className="w-6 h-6 stroke-[#7C5CBF] fill-none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#1E1B2E] mb-3">Emergency Beacon</h3>
              <p className="text-[#6B7280] text-sm leading-relaxed">
                One tap generates a QR with your blood type, allergies, medications, and emergency contacts. First responders scan it — no app, no login, no delay.
              </p>
              <div className="mt-5 bg-[#E6FAF5] text-[#3ECFAA] text-xs rounded-full px-3 py-1 w-fit font-medium">
                ✦ Zero login needed
              </div>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-3xl p-8 border border-[#EDE9F8] hover:shadow-xl hover:-translate-y-1.5 hover:border-[#7C5CBF]/30 transition-all duration-300 cursor-pointer scroll-reveal">
              <div className="bg-[#EDE9F8] rounded-2xl p-3 w-fit mb-5">
                <svg className="w-6 h-6 stroke-[#7C5CBF] fill-none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#1E1B2E] mb-3">Consent on Chain</h3>
              <p className="text-[#6B7280] text-sm leading-relaxed">
                Control exactly who sees your medical data with blockchain-verified consent. Every approval and revocation is immutable, transparent, and auditable.
              </p>
              <div className="mt-5 bg-[#E6FAF5] text-[#3ECFAA] text-xs rounded-full px-3 py-1 w-fit font-medium">
                ✦ Ethereum Sepolia
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4 — HOW IT WORKS */}
      <section id="how-it-works" className="bg-[#FDF8FF] py-16 md:py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 scroll-reveal">
            <div className="uppercase tracking-widest text-xs text-[#7C5CBF] font-semibold">HOW IT WORKS</div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1E1B2E] mt-3 tracking-tight">Simple steps to better care</h2>
          </div>

          <div className="relative max-w-5xl mx-auto">
            {/* Dashed line connecting steps (hidden on mobile) */}
            <div className="hidden md:block absolute top-1/4 left-1/4 right-1/4 border-t-2 border-dashed border-[#EDE9F8] z-0"></div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
              {/* Step 1 */}
              <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-[#EDE9F8] hover:shadow-md transition-all duration-300 scroll-reveal">
                <div className="w-12 h-12 rounded-full bg-[#7C5CBF] text-white flex items-center justify-center text-lg font-bold mx-auto mb-6">
                  01
                </div>
                <div className="bg-[#F5F3FF] rounded-2xl h-28 flex items-center justify-center mx-auto w-28 mb-6">
                  <svg className="w-12 h-12 stroke-[#7C5CBF] fill-none" strokeWidth="1.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg text-[#1E1B2E] mb-3">Describe your symptoms</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed">
                  Open LifeLink and chat naturally with our AI. No forms, no medical jargon — just a conversation.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-[#EDE9F8] hover:shadow-md transition-all duration-300 scroll-reveal" style={{ transitionDelay: '100ms' }}>
                <div className="w-12 h-12 rounded-full bg-[#7C5CBF] text-white flex items-center justify-center text-lg font-bold mx-auto mb-6">
                  02
                </div>
                <div className="bg-[#F5F3FF] rounded-2xl h-28 flex items-center justify-center mx-auto w-28 mb-6">
                  <svg className="w-12 h-12 stroke-[#7C5CBF] fill-none" strokeWidth="1.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg text-[#1E1B2E] mb-3">Get triaged instantly</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed">
                  AI assesses your risk level in seconds and gives you clear, actionable next steps.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-[#EDE9F8] hover:shadow-md transition-all duration-300 scroll-reveal" style={{ transitionDelay: '200ms' }}>
                <div className="w-12 h-12 rounded-full bg-[#7C5CBF] text-white flex items-center justify-center text-lg font-bold mx-auto mb-6">
                  03
                </div>
                <div className="bg-[#F5F3FF] rounded-2xl h-28 flex items-center justify-center mx-auto w-28 mb-6">
                  <svg className="w-12 h-12 stroke-[#7C5CBF] fill-none" strokeWidth="1.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg text-[#1E1B2E] mb-3">Connect with your doctor</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed">
                  Verified doctors review your AI summary and records — and respond with full context already loaded.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5 — FOR DOCTORS */}
      <section id="for-doctors" className="bg-[#FAFAFA] py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* LEFT — Dashboard Mockup */}
            <div className="relative scroll-reveal">
              <div className="absolute w-72 h-72 bg-[#EDE9F8] rounded-full blur-3xl opacity-50 -z-10 blob-1"></div>
              
              <div className="bg-white rounded-3xl shadow-xl p-6 relative z-10 hover:-translate-y-1 transition-transform duration-500">
                <div className="flex items-center justify-between mb-6">
                  <span className="font-semibold text-[#1E1B2E]">Patient Dashboard</span>
                  <span className="bg-[#EDE9F8] text-[#7C5CBF] rounded-full px-3 py-1 text-xs font-medium">3 new</span>
                </div>

                <div className="space-y-3">
                  {/* Row 1 */}
                  <div className="flex items-center justify-between p-3 bg-[#FAFAFA] rounded-2xl hover:bg-[#EDE9F8] transition duration-300 cursor-pointer">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs font-bold">P</div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-[#1E1B2E]">Priya Mehta</div>
                        <div className="text-xs text-gray-400">Fever · Headache</div>
                      </div>
                    </div>
                    <div className="bg-amber-100 text-amber-600 rounded-full px-2 py-0.5 text-xs font-semibold">MEDIUM</div>
                  </div>

                  {/* Row 2 */}
                  <div className="flex items-center justify-between p-3 bg-[#FAFAFA] rounded-2xl hover:bg-[#EDE9F8] transition duration-300 cursor-pointer">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#3ECFAA] to-teal-400 flex items-center justify-center text-white text-xs font-bold">R</div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-[#1E1B2E]">Raj Kumar</div>
                        <div className="text-xs text-gray-400">Chest pain</div>
                      </div>
                    </div>
                    <div className="bg-red-100 text-red-600 rounded-full px-2 py-0.5 text-xs font-semibold">HIGH</div>
                  </div>

                  {/* Row 3 */}
                  <div className="flex items-center justify-between p-3 bg-[#FAFAFA] rounded-2xl hover:bg-[#EDE9F8] transition duration-300 cursor-pointer">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center text-white text-xs font-bold">S</div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-[#1E1B2E]">Sneha Joshi</div>
                        <div className="text-xs text-gray-400">Annual checkup</div>
                      </div>
                    </div>
                    <div className="bg-green-100 text-green-600 rounded-full px-2 py-0.5 text-xs font-semibold">LOW</div>
                  </div>
                </div>
              </div>

              {/* Floating notification */}
              <div className="hidden md:block absolute -right-8 -bottom-6 bg-[#7C5CBF] text-white rounded-2xl shadow-xl p-4 w-52 float-2 z-20">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                  <span className="text-xs font-semibold">New consultation request</span>
                </div>
                <div className="text-xs opacity-70 mt-1">Riya S. · Risk: MEDIUM</div>
                <div className="bg-white/20 rounded-full px-3 py-1 text-xs mt-3 w-fit hover:bg-white/30 transition cursor-pointer">
                  View Record →
                </div>
              </div>
            </div>

            {/* RIGHT TEXT */}
            <div className="scroll-reveal">
              <div className="uppercase tracking-widest text-xs text-[#7C5CBF] font-semibold">FOR DOCTORS</div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1E1B2E] mt-3 leading-tight tracking-tight">
                Your patients, organized and ready
              </h2>
              <p className="text-[#6B7280] mt-4 leading-relaxed">
                LifeLink gives verified doctors AI-summarized patient histories, consent-gated records, and real-time tools — so you can focus on care, not paperwork.
              </p>

              <div className="space-y-4 mt-8">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#E6FAF5] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 stroke-[#3ECFAA] fill-none" strokeWidth="3" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm text-[#6B7280] leading-relaxed">AI pre-screening saves 2+ hours of consultation time daily</span>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#E6FAF5] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 stroke-[#3ECFAA] fill-none" strokeWidth="3" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm text-[#6B7280] leading-relaxed">Blockchain-verified patient consent on every record access</span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#E6FAF5] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 stroke-[#3ECFAA] fill-none" strokeWidth="3" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm text-[#6B7280] leading-relaxed">Instant IPFS access to scans, reports, and prescriptions</span>
                </div>
              </div>

              <div className="mt-10">
                <Link href="/register?role=doctor" className="inline-block bg-[#3ECFAA] text-white rounded-full px-8 py-3.5 font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300">
                  Join as a Doctor →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6 — TESTIMONIALS */}
      <section className="bg-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 scroll-reveal">
            <div className="uppercase tracking-widest text-xs text-[#7C5CBF] font-semibold">LOVED BY PATIENTS</div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1E1B2E] mt-3 tracking-tight">Real people, real care</h2>
            <p className="text-[#6B7280] mt-4">Don't take our word for it.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Review 1 */}
            <div className="bg-[#FDF8FF] rounded-3xl p-8 border border-[#EDE9F8] hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col h-full scroll-reveal">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 fill-[#7C5CBF] text-[#7C5CBF]" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                ))}
              </div>
              <p className="text-[#1E1B2E] text-sm leading-relaxed italic mb-6 flex-grow">
                "LifeLink's AI caught that my symptoms needed urgent attention before I even reached the clinic. It genuinely felt like someone was looking out for me."
              </p>
              <div className="flex items-center gap-3 mt-auto pt-4 border-t border-[#EDE9F8]/50">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">P</div>
                <div>
                  <div className="font-semibold text-sm text-[#1E1B2E]">Priya Mehta</div>
                  <div className="text-xs text-gray-400">Patient, Mumbai</div>
                </div>
              </div>
            </div>

            {/* Review 2 */}
            <div className="bg-[#FDF8FF] rounded-3xl p-8 border border-[#EDE9F8] hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col h-full scroll-reveal" style={{ transitionDelay: '100ms' }}>
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 fill-[#7C5CBF] text-[#7C5CBF]" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                ))}
              </div>
              <p className="text-[#1E1B2E] text-sm leading-relaxed italic mb-6 flex-grow">
                "The AI pre-screening saves me hours every day. Patients arrive with their history already organized. It's completely changed how I practice."
              </p>
              <div className="flex items-center gap-3 mt-auto pt-4 border-t border-[#EDE9F8]/50">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center text-white font-bold">A</div>
                <div>
                  <div className="font-semibold text-sm text-[#1E1B2E]">Dr. Arjun Kumar</div>
                  <div className="text-xs text-gray-400">Cardiologist, Delhi</div>
                </div>
              </div>
            </div>

            {/* Review 3 */}
            <div className="bg-[#FDF8FF] rounded-3xl p-8 border border-[#EDE9F8] hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col h-full scroll-reveal" style={{ transitionDelay: '200ms' }}>
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 fill-[#7C5CBF] text-[#7C5CBF]" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                ))}
              </div>
              <p className="text-[#1E1B2E] text-sm leading-relaxed italic mb-6 flex-grow">
                "I generated an emergency beacon before my surgery. Knowing first responders would have my info gave me so much peace of mind. Brilliant feature."
              </p>
              <div className="flex items-center gap-3 mt-auto pt-4 border-t border-[#EDE9F8]/50">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3ECFAA] to-teal-400 flex items-center justify-center text-white font-bold">S</div>
                <div>
                  <div className="font-semibold text-sm text-[#1E1B2E]">Sneha Rawat</div>
                  <div className="text-xs text-gray-400">Patient, Bangalore</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7 — EMERGENCY */}
      <section id="emergency" className="bg-gradient-to-br from-[#FFF8F0] to-[#FDF8FF] py-16 md:py-24 border-t-4 border-amber-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* LEFT TEXT */}
            <div className="scroll-reveal">
              <div className="inline-block bg-amber-100 text-amber-700 rounded-full px-4 py-1.5 text-sm font-medium">
                🚨 Emergency Ready
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-[#1E1B2E] mt-4 leading-tight tracking-tight">
                When every second<br/>counts
              </h2>
              <p className="text-[#6B7280] mt-4 leading-relaxed max-w-md">
                One tap. Your blood type, allergies, medications, and emergency contacts — all in a QR code that anyone can scan. No app needed. No login required. Just instant, life-saving information.
              </p>

              <div className="space-y-3 mt-8">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                  <span className="text-sm text-[#6B7280]">Instant QR generation — no setup needed</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                  <span className="text-sm text-[#6B7280]">Works offline — scannable by any camera</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                  <span className="text-sm text-[#6B7280]">Includes blood type, allergies, medications</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                  <span className="text-sm text-[#6B7280]">Auto-shares emergency contact details</span>
                </div>
              </div>

              <div className="mt-10">
                <Link href="/register" className="inline-block bg-amber-500 text-white rounded-full px-8 py-3.5 font-semibold hover:bg-amber-600 hover:shadow-xl hover:scale-105 transition-all duration-300">
                  Generate My Beacon →
                </Link>
              </div>
            </div>

            {/* RIGHT — Emergency Visual */}
            <div className="relative scroll-reveal">
              <div className="bg-white rounded-3xl shadow-xl p-8 text-center max-w-md mx-auto hover:-translate-y-1 transition-transform duration-500">
                <h3 className="text-sm font-semibold text-[#1E1B2E] mb-6">Your Emergency Profile</h3>
                
                {/* QR Code Mockup */}
                <div className="mx-auto w-40 h-40 mb-6 bg-white p-2 border border-gray-100 rounded-xl shadow-sm">
                  <div className="grid grid-cols-8 gap-0.5 w-full h-full">
                    {/* Realistic-ish QR pattern layout (8x8) */}
                    {[
                      1,1,1,1, 1,0,1,1,
                      1,0,0,1, 0,1,0,1,
                      1,0,0,1, 1,1,0,0,
                      1,1,1,1, 0,1,1,0,
                      
                      1,0,1,0, 1,1,1,1,
                      0,1,0,1, 1,0,0,1,
                      1,1,0,0, 1,0,0,1,
                      1,0,1,1, 1,1,1,1
                    ].map((cell, i) => (
                      <div key={i} className={`w-full h-full rounded-sm ${cell ? 'bg-[#1E1B2E]' : 'bg-gray-100'}`}></div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-[#E6FAF5] text-[#3ECFAA] rounded-full text-xs px-3 py-2 font-medium text-center truncate">🩸 O+ Blood Type</div>
                  <div className="bg-[#E6FAF5] text-[#3ECFAA] rounded-full text-xs px-3 py-2 font-medium text-center truncate">✓ No Allergies</div>
                  <div className="bg-[#E6FAF5] text-[#3ECFAA] rounded-full text-xs px-3 py-2 font-medium text-center truncate">💊 2 Medications</div>
                  <div className="bg-[#E6FAF5] text-[#3ECFAA] rounded-full text-xs px-3 py-2 font-medium text-center truncate">📞 Dr. Sharma</div>
                </div>

                <div className="flex items-center justify-center gap-2 mt-6">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                  <span className="text-xs text-gray-400">Beacon Active · Updates in real-time</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8 — FINAL CTA BANNER */}
      <section className="relative overflow-hidden bg-[#7C5CBF] py-28 text-center scroll-reveal">
        <div className="absolute w-96 h-96 rounded-full bg-white/5 blur-3xl -top-20 -left-20 pointer-events-none"></div>
        <div className="absolute w-96 h-96 rounded-full bg-white/5 blur-3xl -bottom-20 -right-20 pointer-events-none"></div>
        
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-block bg-white/10 text-white rounded-full px-4 py-1.5 text-sm">
            ✦ Start your health journey
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mt-6 leading-tight tracking-tight">
            Your health deserves<br/>the best care
          </h2>
          
          <p className="text-lg md:text-xl text-white/70 mt-5 max-w-lg mx-auto leading-relaxed">
            Join LifeLink today. Free forever for patients. Doctors verified within 24 hours.
          </p>

          <div className="flex gap-4 justify-center mt-10 flex-wrap">
            <Link href="/register" className="bg-white text-[#7C5CBF] rounded-full px-10 py-4 font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300">
              Get started free →
            </Link>
            <Link href="#contact" className="border-2 border-white/40 text-white rounded-full px-10 py-4 font-semibold hover:bg-white/10 transition-all duration-300">
              Talk to us
            </Link>
          </div>

          <p className="mt-8 text-white/40 text-sm">
            No credit card required · Free for patients · Doctors verified within 24 hours
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#1E1B2E] text-white pt-16 pb-8 relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#7C5CBF] to-[#3ECFAA]"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            
            {/* Col 1 */}
            <div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 stroke-[#3ECFAA]" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="font-bold text-xl tracking-tight">LifeLink</span>
              </div>
              <p className="text-white/50 text-sm mt-3 leading-relaxed">
                Caring for India, intelligently.
              </p>
              <div className="mt-4">
                <p className="text-white/30 text-xs">Built at HackIndia 2026</p>
                <p className="text-[#7C5CBF] text-xs mt-1">by Syntax Coders 💜</p>
              </div>
            </div>

            {/* Col 2 */}
            <div>
              <h4 className="text-sm font-semibold tracking-wider mb-4">PRODUCT</h4>
              <ul className="space-y-3">
                <li><Link href="#features" className="text-white/50 hover:text-white text-sm transition">Features</Link></li>
                <li><Link href="#how-it-works" className="text-white/50 hover:text-white text-sm transition">How It Works</Link></li>
                <li><Link href="#emergency" className="text-white/50 hover:text-white text-sm transition">Emergency</Link></li>
                <li><Link href="#for-doctors" className="text-white/50 hover:text-white text-sm transition">For Doctors</Link></li>
              </ul>
            </div>

            {/* Col 3 */}
            <div>
              <h4 className="text-sm font-semibold tracking-wider mb-4">COMPANY</h4>
              <ul className="space-y-3">
                <li><Link href="#" className="text-white/50 hover:text-white text-sm transition">About</Link></li>
                <li><Link href="#" className="text-white/50 hover:text-white text-sm transition">Privacy Policy</Link></li>
                <li><Link href="#" className="text-white/50 hover:text-white text-sm transition">Terms of Service</Link></li>
                <li><Link href="#" className="text-white/50 hover:text-white text-sm transition">GitHub</Link></li>
              </ul>
            </div>

            {/* Col 4 */}
            <div>
              <h4 className="text-sm font-semibold tracking-wider mb-4">CONNECT</h4>
              <p className="text-white/50 text-sm mb-3 hover:text-white transition cursor-pointer">team@lifelink.app</p>
              <div className="flex gap-4 mb-4">
                <Link href="#" className="text-white/50 hover:text-white transition">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
                </Link>
                <Link href="#" className="text-white/50 hover:text-white transition">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
                </Link>
              </div>
              <p className="text-white/30 text-xs mt-4">India 🇮🇳</p>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex justify-between items-center flex-wrap gap-4">
            <p className="text-white/30 text-sm">© 2026 LifeLink · Made with 💜 in India</p>
            <p className="text-white/20 text-xs">All rights reserved · HackIndia 2026</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
