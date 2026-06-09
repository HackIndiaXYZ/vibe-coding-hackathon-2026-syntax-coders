'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Role = 'patient' | 'doctor'
type Step = 1 | 2 | 3

export default function Register() {
    const [role, setRole] = useState<Role>('patient')
    const [step, setStep] = useState<Step>(1)
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()

    useEffect(() => {
        const THEMES = {
            'midnight-forest': { bg: '#0D1117', sidebar: '#161B22', primary: '#2D6A4F', accent: '#40916C', highlight: '#74C69D', soft: '#b7e4c7', tint: '#e8f5e9', cardBg: '#161B22', cardBorder: '#233044', textPrimary: '#F0E5D8', textMuted: '#8D97A7', heroGradient: 'linear-gradient(135deg, #2D6A4F 0%, #161B22 100%)', heroBorder: '#40916C', accentRgb: '64, 145, 108', isDark: true },
            'dusk-lavender': { bg: '#1A1625', sidebar: '#221D30', primary: '#6E48AA', accent: '#9D65C9', highlight: '#E040FB', soft: '#f3e5f5', tint: '#fce4ec', cardBg: '#221D30', cardBorder: '#3E3754', textPrimary: '#F0E5D8', textMuted: '#9B8FAD', heroGradient: 'linear-gradient(135deg, #6E48AA 0%, #221D30 100%)', heroBorder: '#9D65C9', accentRgb: '157, 101, 201', isDark: true },
            'arctic-slate': { bg: '#0F172A', sidebar: '#1E293B', primary: '#4A74B9', accent: '#799CD2', highlight: '#A4C2EC', soft: '#D9E5F6', tint: '#F2F6FC', cardBg: '#1E293B', cardBorder: '#334155', textPrimary: '#F8FAFC', textMuted: '#94A3B8', heroGradient: 'linear-gradient(135deg, #4A74B9 0%, #1E293B 100%)', heroBorder: '#799CD2', accentRgb: '121, 156, 210', isDark: true },
            'ember-rose': { bg: '#1A0F0F', sidebar: '#261515', primary: '#C0392B', accent: '#E74C3C', highlight: '#FF8A80', soft: '#ffebee', tint: '#fff5f5', cardBg: '#261515', cardBorder: '#4A2B2B', textPrimary: '#F5E6E6', textMuted: '#A88585', heroGradient: 'linear-gradient(135deg, #C0392B 0%, #261515 100%)', heroBorder: '#E74C3C', accentRgb: '231, 76, 60', isDark: true },
            'ocean-abyss': { bg: '#020813', sidebar: '#071428', primary: '#006D77', accent: '#4FA4C8', highlight: '#88C3D8', soft: '#D0ECEF', tint: '#EEF8F9', cardBg: '#071428', cardBorder: '#162D4A', textPrimary: '#E0F2FE', textMuted: '#7EA2C6', heroGradient: 'linear-gradient(135deg, #006D77 0%, #071428 100%)', heroBorder: '#4FA4C8', accentRgb: '79, 164, 200', isDark: true },
            'golden-hour': { bg: '#FAF7F0', sidebar: '#FFF8EC', primary: '#D97706', accent: '#F59E0B', highlight: '#FDE68A', soft: '#fef3c7', tint: '#fffbeb', cardBg: '#FFFFFF', cardBorder: '#EADEC9', textPrimary: '#1E1B2E', textMuted: '#6B7280', heroGradient: 'linear-gradient(135deg, #D97706 0%, #FFF8EC 100%)', heroBorder: '#F59E0B', accentRgb: '245, 158, 11', isDark: false }
        }
        const savedTheme = localStorage.getItem('lifelink-theme') || 'ocean-abyss'
        const activeTheme = THEMES[savedTheme as keyof typeof THEMES] || THEMES['ocean-abyss']
        const root = document.documentElement
        root.style.setProperty('--ll-bg', activeTheme.bg)
        root.style.setProperty('--ll-sidebar', activeTheme.sidebar)
        root.style.setProperty('--ll-primary', activeTheme.primary)
        root.style.setProperty('--ll-accent', activeTheme.accent)
        root.style.setProperty('--ll-highlight', activeTheme.highlight)
        root.style.setProperty('--ll-soft', activeTheme.soft)
        root.style.setProperty('--ll-tint', activeTheme.tint)
        root.style.setProperty('--ll-card-bg', activeTheme.cardBg)
        root.style.setProperty('--ll-card-border', activeTheme.cardBorder)
        root.style.setProperty('--ll-text', activeTheme.textPrimary)
        root.style.setProperty('--ll-text-muted', activeTheme.textMuted)
        root.style.setProperty('--ll-hero-gradient', activeTheme.heroGradient)
        root.style.setProperty('--ll-hero-border', activeTheme.heroBorder)
        root.style.setProperty('--ll-accent-rgb', activeTheme.accentRgb)
        root.style.setProperty('--ll-input-bg', activeTheme.isDark ? activeTheme.cardBg : '#fff')
    }, [])

    // Form fields
    const [form, setForm] = useState({
        fullName: '',
        email: '',
        password: '',
        phone: '',
        dob: '',
        bloodGroup: '',
        allergies: '',
        // doctor-specific
        licenceId: '',
        specialization: '',
        hospital: '',
    })

    const update = (field: string, value: string) =>
        setForm(prev => ({ ...prev, [field]: value }))

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault()
        if (step < 3) setStep((step + 1) as Step)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const endpoint = role === 'doctor'
                ? 'http://localhost:4000/auth/register/doctor'
                : 'http://localhost:4000/auth/register/patient'

            const body: Record<string, unknown> = {
                name: form.fullName,
                email: form.email,
                password: form.password,
            }

            if (form.phone) body.phone = form.phone

            if (role === 'doctor') {
                body.specialization = form.specialization
                body.licenseNumber = form.licenceId
            } else {
                if (form.dob) body.dateOfBirth = new Date(form.dob).toISOString()
                if (form.bloodGroup) body.bloodGroup = form.bloodGroup
                if (form.allergies) body.allergies = form.allergies
            }

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.message || 'Registration failed. Please try again.')
                return
            }

            // Store tokens and redirect
            localStorage.setItem('accessToken', data.tokens.accessToken)
            localStorage.setItem('refreshToken', data.tokens.refreshToken)
            localStorage.setItem('user', JSON.stringify(data.user))
            router.push('/dashboard')
        } catch {
            setError('Unable to connect to server. Make sure the backend is running.')
        } finally {
            setLoading(false)
        }
    }

    const bloodGroups = ['A+', 'A−', 'B+', 'B−', 'AB+', 'AB−', 'O+', 'O−']

    const specializations = [
        'General Practitioner', 'Cardiologist', 'Neurologist',
        'Orthopedic', 'Pediatrician', 'Dermatologist',
        'Oncologist', 'Radiologist', 'Emergency Medicine',
    ]

    return (
        <div className="min-h-screen flex" style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}>
            <style>{`
        @import url("https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap");

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-7px); }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.8); }
        }
        @keyframes stepIn {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes checkPop {
          0%   { transform: scale(0); opacity: 0; }
          60%  { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }

        .fade-up-1 { animation: fadeUp 0.55s cubic-bezier(0.22,1,0.36,1) 0.05s both; }
        .fade-up-2 { animation: fadeUp 0.55s cubic-bezier(0.22,1,0.36,1) 0.12s both; }
        .fade-up-3 { animation: fadeUp 0.55s cubic-bezier(0.22,1,0.36,1) 0.2s both; }
        .fade-up-4 { animation: fadeUp 0.55s cubic-bezier(0.22,1,0.36,1) 0.28s both; }
        .fade-up-5 { animation: fadeUp 0.55s cubic-bezier(0.22,1,0.36,1) 0.36s both; }
        .fade-in   { animation: fadeIn 1s ease both; }
        .step-in   { animation: stepIn 0.4s cubic-bezier(0.22,1,0.36,1) both; }
        .check-pop { animation: checkPop 0.4s cubic-bezier(0.22,1,0.36,1) both; }
        .float-card { animation: float 5s ease-in-out infinite; }

        .glass-panel {
          background: rgba(255,255,255,0.07);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--ll-card-border);
        }

        .input-field {
          width: 100%;
          background: var(--ll-card-bg);
          border: 1px solid var(--ll-card-border);
          border-radius: 12px;
          padding: 13px 16px;
          color: var(--ll-text);
          font-size: 14px;
          font-family: inherit;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
          box-sizing: border-box;
        }
        .input-field::placeholder { color: var(--ll-text-muted); opacity: 0.5; }
        .input-field:focus {
          border-color: var(--ll-primary);
          background: var(--ll-card-bg);
          box-shadow: 0 0 0 3px rgba(var(--ll-accent-rgb), 0.15);
        }
        .input-field option {
          background: var(--ll-card-bg);
          color: var(--ll-text);
        }

        .role-tab {
          flex: 1;
          padding: 10px 0;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.25s ease;
          border: none;
          font-family: inherit;
        }
        .role-tab.active   { background: var(--ll-primary); color: #fff; box-shadow: 0 2px 12px rgba(0,0,0,0.2); }
        .role-tab.inactive { background: transparent; color: var(--ll-text-muted); }
        .role-tab.inactive:hover { color: var(--ll-text); }

        .submit-btn {
          width: 100%;
          padding: 14px;
          border-radius: 100px;
          border: none;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          font-family: inherit;
          background: var(--ll-primary);
          color: white;
          transition: opacity 0.2s, transform 0.2s, box-shadow 0.2s;
        }
        .submit-btn:hover:not(:disabled) {
          background: var(--ll-accent);
          transform: translateY(-1px);
          box-shadow: 0 8px 30px rgba(var(--ll-accent-rgb), 0.3);
        }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .back-btn {
          width: 100%;
          padding: 13px;
          border-radius: 100px;
          border: 1px solid var(--ll-card-border);
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          font-family: inherit;
          background: transparent;
          color: var(--ll-text-muted);
          transition: all 0.2s;
        }
        .back-btn:hover { border-color: var(--ll-primary); color: var(--ll-text); }

        .step-dot {
          width: 32px; height: 32px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700;
          transition: all 0.3s ease;
          flex-shrink: 0;
        }
        .step-dot.done    { background: var(--ll-primary); color: #fff; }
        .step-dot.active  { background: var(--ll-highlight); color: #000; box-shadow: 0 0 0 4px rgba(var(--ll-accent-rgb),0.12); }
        .step-dot.pending { background: rgba(var(--ll-accent-rgb), 0.08); color: var(--ll-text-muted); border: 1px solid var(--ll-card-border); }

        .step-line {
          flex: 1; height: 1px;
          transition: background 0.4s ease;
        }
        .step-line.done    { background: var(--ll-primary); }
        .step-line.pending { background: var(--ll-card-border); }

        .field-label {
          display: block;
          color: var(--ll-text-muted);
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 8px;
        }

        .divider-line { flex: 1; height: 1px; background: var(--ll-card-border); }

        /* custom select arrow */
        select.input-field {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.3)' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
          padding-right: 38px;
          cursor: pointer;
        }
      `}</style>

            {/* ─── LEFT PANEL — Photo ─── */}
            <div className="hidden lg:flex lg:w-[48%] relative overflow-hidden flex-col">
                <div className="absolute inset-0 fade-in">
                    <img
                        src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1400&q=80&auto=format&fit=crop"
                        alt=""
                        className="w-full h-full object-cover"
                        aria-hidden="true"
                    />
                    <div
                        className="absolute inset-0"
                        style={{ background: 'linear-gradient(150deg, rgba(15,12,30,0.8) 0%, rgba(15,12,30,0.55) 45%, rgba(10,46,39,0.75) 100%)' }}
                    />
                </div>

                <div className="relative z-10 flex flex-col h-full p-12">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 w-fit">
                        <div className="w-8 h-8 rounded-lg bg-[var(--ll-primary)] flex items-center justify-center">
                            <svg className="w-4 h-4 stroke-white" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                        <span className="font-bold text-xl tracking-tight" style={{ color: 'var(--ll-text)' }}>LifeLink</span>
                    </Link>

                    <div className="flex-1 flex flex-col justify-center max-w-sm">
                        <div
                            className="inline-flex items-center gap-2 mb-8"
                            style={{ background: 'rgba(var(--ll-accent-rgb),0.15)', border: '1px solid rgba(var(--ll-accent-rgb),0.25)', borderRadius: '100px', padding: '6px 14px', width: 'fit-content' }}
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--ll-accent)]" style={{ animation: 'pulse-dot 2s ease-in-out infinite' }} />
                            <span className="text-[var(--ll-accent)] text-[11px] font-semibold tracking-widest uppercase">Join LifeLink</span>
                        </div>

                        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '50px', fontWeight: 500, lineHeight: 1.06, color: 'var(--ll-text)', letterSpacing: '-0.01em', transition: 'color 0.3s ease' }}>
                            Own your<br />
                            <em style={{ color: 'var(--ll-primary)', fontStyle: 'italic' }}>health data</em><br />
                            forever.
                        </h1>

                        <p className="mt-5 leading-relaxed" style={{ color: 'var(--ll-text-muted)', fontSize: '15px', transition: 'color 0.3s ease' }}>
                            Your records live on decentralized storage — not our servers. You decide who sees what, always.
                        </p>

                        {/* Feature bullets */}
                        <div className="mt-10 space-y-4">
                            {[
                                { icon: '🔒', text: 'End-to-end encrypted records on IPFS' },
                                { icon: '⛓️', text: 'On-chain consent logs via Sepolia' },
                                { icon: '🚨', text: 'Emergency beacon ready in minutes' },
                                { icon: '🤖', text: 'AI triage powered by Groq' },
                            ].map((f, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div
                                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm"
                                        style={{ background: 'var(--ll-card-bg)', border: '1px solid var(--ll-card-border)' }}
                                    >
                                        {f.icon}
                                    </div>
                                    <span style={{ color: 'var(--ll-text-muted)', fontSize: '13px' }}>{f.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bottom card */}
                    <div className="float-card">
                        <div className="glass-panel rounded-2xl p-4 flex items-center gap-4" style={{ maxWidth: '320px' }}>
                            <div className="w-10 h-10 rounded-xl bg-[rgba(var(--ll-accent-rgb),0.15)] flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 stroke-[var(--ll-primary)]" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-white text-xs font-semibold">10,000+ patients onboarded</p>
                                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', marginTop: '2px' }}>Trusted by doctors across India</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── RIGHT PANEL — Register form ─── */}
            <div className="flex-1 bg-[var(--ll-bg)] flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden" style={{ transition: 'background 0.3s ease' }}>
                {/* BG texture */}
                <div
                    className="absolute inset-0 pointer-events-none opacity-[0.025]"
                    style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(255,255,255,1) 39px, rgba(255,255,255,1) 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(255,255,255,1) 39px, rgba(255,255,255,1) 40px)' }}
                />
                <div
                    className="absolute bottom-0 left-0 w-96 h-96 rounded-full pointer-events-none opacity-[0.05]"
                    style={{ background: 'radial-gradient(circle, var(--ll-accent) 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }}
                />

                <div className="w-full max-w-[420px] relative z-10">

                    {/* Mobile logo */}
                    <div className="flex lg:hidden items-center gap-2 mb-8 fade-up-1">
                        <div className="w-7 h-7 rounded-lg bg-[var(--ll-primary)] flex items-center justify-center">
                            <svg className="w-4 h-4 stroke-white" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                        <span className="font-bold text-xl" style={{ color: 'var(--ll-text)' }}>LifeLink</span>
                    </div>

                    {/* Heading */}
                    <div className="mb-7 fade-up-1">
                        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '36px', fontWeight: 500, color: 'var(--ll-text)', lineHeight: 1.1, letterSpacing: '-0.01em', transition: 'color 0.3s ease' }}>
                            Create account
                        </h2>
                        <p style={{ color: 'var(--ll-text-muted)', fontSize: '14px', marginTop: '6px', transition: 'color 0.3s ease' }}>
                            Step {step} of 3 — {['Your identity', 'Health profile', 'Confirm & launch'][step - 1]}
                        </p>
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="fade-up-1 mb-4" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '12px 16px' }}>
                            <p style={{ color: '#f87171', fontSize: '13px', margin: 0 }}>{error}</p>
                        </div>
                    )}

                    {/* Step progress */}
                    <div className="fade-up-2 flex items-center gap-2 mb-8">
                        {[1, 2, 3].map((s, i) => (
                            <div key={s} className="contents">
                                <div
                                    className={`step-dot ${step > s ? 'done' : step === s ? 'active' : 'pending'}`}
                                >
                                    {step > s ? (
                                        <svg className="w-3.5 h-3.5 stroke-current check-pop" fill="none" viewBox="0 0 24 24" strokeWidth="3">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : s}
                                </div>
                                {i < 2 && (
                                    <div className={`step-line ${step > s ? 'done' : 'pending'}`} />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Role toggle — only step 1 */}
                    {step === 1 && (
                        <div className="fade-up-2 mb-6">
                            <div
                                style={{ background: 'var(--ll-card-bg)', border: '1px solid var(--ll-card-border)', borderRadius: '14px', padding: '4px', display: 'flex', gap: '4px', transition: 'background 0.3s ease, border-color 0.3s ease' }}
                            >
                                <button className={`role-tab ${role === 'patient' ? 'active' : 'inactive'}`} onClick={() => setRole('patient')}>Patient</button>
                                <button className={`role-tab ${role === 'doctor' ? 'active' : 'inactive'}`} onClick={() => setRole('doctor')}>Doctor</button>
                            </div>
                        </div>
                    )}

                    {/* ── STEP 1 — Identity ── */}
                    {step === 1 && (
                        <form onSubmit={handleNext} className="step-in space-y-4">
                            <div>
                                <label className="field-label">Full name</label>
                                <input className="input-field" type="text" placeholder="Priya Mehta" value={form.fullName} onChange={e => update('fullName', e.target.value)} required />
                            </div>
                            <div>
                                <label className="field-label">Email address</label>
                                <input className="input-field" type="email" placeholder={role === 'doctor' ? 'doctor@hospital.com' : 'you@example.com'} value={form.email} onChange={e => update('email', e.target.value)} required />
                            </div>
                            <div>
                                <label className="field-label">Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        className="input-field"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Min. 8 characters"
                                        value={form.password}
                                        onChange={e => update('password', e.target.value)}
                                        style={{ paddingRight: '44px' }}
                                        required
                                        minLength={8}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: 0 }}
                                    >
                                        {showPassword ? (
                                            <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                        ) : (
                                            <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="field-label">Phone number</label>
                                <input className="input-field" type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={e => update('phone', e.target.value)} required />
                            </div>
                            {role === 'doctor' && (
                                <div>
                                    <label className="field-label">Medical Licence ID</label>
                                    <input className="input-field" type="text" placeholder="MCI-XXXX-XXXX" value={form.licenceId} onChange={e => update('licenceId', e.target.value)} required />
                                </div>
                            )}
                            <div className="pt-2">
                                <button type="submit" className="submit-btn">Continue →</button>
                            </div>
                        </form>
                    )}

                    {/* ── STEP 2 — Health profile ── */}
                    {step === 2 && (
                        <form onSubmit={handleNext} className="step-in space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="field-label">Date of birth</label>
                                    <input className="input-field" type="date" value={form.dob} onChange={e => update('dob', e.target.value)} required />
                                </div>
                                <div>
                                    <label className="field-label">Blood group</label>
                                    <select className="input-field" value={form.bloodGroup} onChange={e => update('bloodGroup', e.target.value)} required>
                                        <option value="" disabled>Select</option>
                                        {bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="field-label">Known allergies</label>
                                <input className="input-field" type="text" placeholder="e.g. Penicillin, Peanuts (or None)" value={form.allergies} onChange={e => update('allergies', e.target.value)} />
                            </div>

                            {role === 'doctor' ? (
                                <>
                                    <div>
                                        <label className="field-label">Specialization</label>
                                        <select className="input-field" value={form.specialization} onChange={e => update('specialization', e.target.value)} required>
                                            <option value="" disabled>Select specialization</option>
                                            {specializations.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="field-label">Hospital / Clinic</label>
                                        <input className="input-field" type="text" placeholder="AIIMS Mumbai" value={form.hospital} onChange={e => update('hospital', e.target.value)} required />
                                    </div>
                                </>
                            ) : (
                                <div
                                    className="rounded-xl p-4"
                                    style={{ background: 'rgba(62,207,170,0.07)', border: '1px solid rgba(62,207,170,0.15)' }}
                                >
                                    <p className="text-[#3ECFAA] text-xs font-semibold mb-1">Why we ask</p>
                                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', lineHeight: '1.6' }}>
                                        Blood group and allergies power your Emergency Beacon — a scannable QR responders can read without any login.
                                    </p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <button type="button" className="back-btn" onClick={() => setStep(1)}>← Back</button>
                                <button type="submit" className="submit-btn">Continue →</button>
                            </div>
                        </form>
                    )}

                    {/* ── STEP 3 — Review & confirm ── */}
                    {step === 3 && (
                        <form onSubmit={handleSubmit} className="step-in space-y-4">
                            {/* Summary card */}
                            <div
                                className="rounded-2xl p-5 space-y-3"
                                style={{ background: 'var(--ll-card-bg)', border: '1px solid var(--ll-card-border)' }}
                            >
                                <div className="flex items-center gap-3 pb-3" style={{ borderBottom: '1px solid var(--ll-card-border)' }}>
                                    <div
                                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                                        style={{ background: 'linear-gradient(135deg, var(--ll-primary), var(--ll-accent))' }}
                                    >
                                        {form.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'LL'}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold" style={{ color: 'var(--ll-text)' }}>{form.fullName || '—'}</p>
                                        <p style={{ color: 'var(--ll-text-muted)', opacity: 0.8, fontSize: '11px', marginTop: '2px' }}>
                                            {role === 'doctor' ? '👨‍⚕️ Doctor' : '🧑 Patient'} · {form.email || '—'}
                                        </p>
                                    </div>
                                </div>

                                {[
                                    { label: 'Phone', value: form.phone || '—' },
                                    { label: 'Blood group', value: form.bloodGroup || '—' },
                                    { label: 'Allergies', value: form.allergies || 'None' },
                                    ...(role === 'doctor' ? [
                                        { label: 'Licence ID', value: form.licenceId || '—' },
                                        { label: 'Specialization', value: form.specialization || '—' },
                                        { label: 'Hospital', value: form.hospital || '—' },
                                    ] : []),
                                ].map((row, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <span style={{ color: 'var(--ll-text-muted)', fontSize: '12px' }}>{row.label}</span>
                                        <span style={{ color: 'var(--ll-text)', fontSize: '12px', fontWeight: 500 }}>{row.value}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Consent checkbox */}
                            <label
                                className="flex items-start gap-3 cursor-pointer"
                                style={{ padding: '14px', borderRadius: '12px', background: 'var(--ll-card-bg)', border: '1px solid var(--ll-card-border)' }}
                            >
                                <input type="checkbox" required style={{ marginTop: '2px', accentColor: 'var(--ll-primary)', width: '15px', height: '15px', flexShrink: 0, cursor: 'pointer' }} />
                                <span style={{ color: 'var(--ll-text-muted)', fontSize: '12px', lineHeight: '1.6' }}>
                                    I agree to LifeLink&apos;s{' '}
                                    <Link href="/terms" style={{ color: 'var(--ll-primary)', textDecoration: 'none' }}>Terms of Protocol</Link>
                                    {' '}and{' '}
                                    <Link href="/privacy" style={{ color: 'var(--ll-primary)', textDecoration: 'none' }}>Data Sovereignty Charter</Link>.
                                    My health data is stored on IPFS and I retain full ownership.
                                </span>
                            </label>

                            <div className="grid grid-cols-2 gap-3 pt-1">
                                <button type="button" className="back-btn" onClick={() => setStep(2)}>← Back</button>
                                <button type="submit" className="submit-btn" disabled={loading}>
                                    {loading ? (
                                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                            <svg className="w-4 h-4 stroke-white animate-spin" fill="none" viewBox="0 0 24 24" strokeWidth="2.5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            Launching...
                                        </span>
                                    ) : 'Launch account 🚀'}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Divider + login link */}
                    <div className="flex items-center gap-3 mt-7">
                        <div className="divider-line" />
                        <span style={{ color: 'var(--ll-text-muted)', opacity: 0.6, fontSize: '11px', whiteSpace: 'nowrap' }}>already a member?</span>
                        <div className="divider-line" />
                    </div>

                    <p className="text-center mt-4" style={{ color: 'var(--ll-text-muted)', opacity: 0.8, fontSize: '13px' }}>
                        <Link href="/login" style={{ color: 'var(--ll-primary)', fontWeight: 600, textDecoration: 'none' }}>
                            Sign in to your account →
                        </Link>
                    </p>

                    {/* Security note */}
                    <div className="flex items-center justify-center gap-2 mt-6">
                        <svg className="w-3 h-3 stroke-white/20" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span style={{ color: 'rgba(255,255,255,0.18)', fontSize: '11px' }}>256-bit encrypted · HIPAA compliant · IPFS sovereign</span>
                    </div>
                </div>
            </div>
        </div>
    )
}