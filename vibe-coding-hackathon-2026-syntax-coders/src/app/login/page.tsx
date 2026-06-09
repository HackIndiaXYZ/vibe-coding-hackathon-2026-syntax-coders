'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Login() {
  const [role, setRole] = useState<'patient' | 'doctor'>('patient')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('http://localhost:4000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Invalid email or password')
        return
      }

      // Store tokens and user info
      localStorage.setItem('accessToken', data.tokens.accessToken)
      localStorage.setItem('refreshToken', data.tokens.refreshToken)
      localStorage.setItem('user', JSON.stringify(data.user))

      // Redirect to dashboard
      router.push('/dashboard')
    } catch {
      setError('Unable to connect to server. Make sure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}>
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap");

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.8); }
        }
        @keyframes scan {
          0%   { top: 0%; opacity: 0.5; }
          50%  { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-6px); }
        }

        .fade-up-1 { animation: fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) 0.05s both; }
        .fade-up-2 { animation: fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) 0.15s both; }
        .fade-up-3 { animation: fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) 0.25s both; }
        .fade-up-4 { animation: fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) 0.35s both; }
        .fade-up-5 { animation: fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) 0.45s both; }
        .fade-in   { animation: fadeIn 1s ease both; }

        .glass-panel {
          background: rgba(255,255,255,0.07);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--ll-card-border);
        }

        .scan-line {
          position: absolute;
          left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, var(--ll-primary), transparent);
          animation: scan 4s ease-in-out infinite;
          pointer-events: none;
        }

        .float-card { animation: float 5s ease-in-out infinite; }

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
        }
        .input-field::placeholder { color: var(--ll-text-muted); opacity: 0.5; }
        .input-field:focus {
          border-color: var(--ll-primary);
          background: var(--ll-card-bg);
          box-shadow: 0 0 0 3px rgba(var(--ll-accent-rgb), 0.15);
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
        .role-tab.active {
          background: var(--ll-primary);
          color: #fff;
          box-shadow: 0 2px 12px rgba(0,0,0,0.2);
        }
        .role-tab.inactive {
          background: transparent;
          color: var(--ll-text-muted);
        }
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
          position: relative;
          overflow: hidden;
        }
        .submit-btn:hover:not(:disabled) {
          background: var(--ll-accent);
          transform: translateY(-1px);
          box-shadow: 0 8px 30px rgba(var(--ll-accent-rgb), 0.3);
        }
        .submit-btn:active:not(:disabled) { transform: translateY(0); }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .divider-line {
          flex: 1; height: 1px;
          background: var(--ll-card-border);
        }
      `}</style>

      {/* LEFT PANEL — Photo + info */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden flex-col">
        <div className="absolute inset-0 fade-in">
          <img
            src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1400&q=80&auto=format&fit=crop"
            alt=""
            className="w-full h-full object-cover"
            aria-hidden="true"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, rgba(15,12,30,0.75) 0%, rgba(15,12,30,0.5) 50%, rgba(10,46,39,0.7) 100%)' }} />
        </div>

        <div className="relative z-10 flex flex-col h-full p-12">
          <Link href="/" className="flex items-center gap-2 w-fit">
            <div className="w-8 h-8 rounded-lg bg-[#3ECFAA] flex items-center justify-center">
              <svg className="w-4 h-4 stroke-white" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">LifeLink</span>
          </Link>

          <div className="flex-1 flex flex-col justify-center max-w-md">
            <div className="inline-flex items-center gap-2 mb-8" style={{ background: 'rgba(62,207,170,0.15)', border: '1px solid rgba(62,207,170,0.25)', borderRadius: '100px', padding: '6px 14px', width: 'fit-content' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#3ECFAA]" style={{ animation: 'pulse-dot 2s ease-in-out infinite' }} />
              <span className="text-[#3ECFAA] text-[11px] font-semibold tracking-widest uppercase">Secure Portal</span>
            </div>

            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '52px', fontWeight: 500, lineHeight: 1.05, color: 'white', letterSpacing: '-0.01em' }}>
              Your health,<br />
              <em style={{ color: '#3ECFAA', fontStyle: 'italic' }}>protected</em><br />
              always.
            </h1>

            <p className="mt-5 leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)', fontSize: '15px', maxWidth: '360px' }}>
              Access your decentralized records, AI diagnostics, and emergency beacons — all in one secure, private space.
            </p>

            <div className="mt-10 grid grid-cols-3 gap-4">
              {[
                { value: '10k+', label: 'Patients' },
                { value: '99.9%', label: 'Uptime' },
                { value: '2.3s', label: 'Triage' },
              ].map((s, i) => (
                <div key={i} className="glass-panel rounded-xl p-4 text-center">
                  <p className="text-white font-bold" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '24px' }}>{s.value}</p>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '2px' }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="float-card">
            <div className="glass-panel rounded-2xl p-4 flex items-center gap-4" style={{ maxWidth: '340px' }}>
              <div className="relative w-10 h-10 rounded-xl bg-[rgba(var(--ll-accent-rgb),0.15)] flex items-center justify-center flex-shrink-0 overflow-hidden">
                <div className="scan-line" />
                <svg className="w-5 h-5 stroke-[var(--ll-primary)]" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <p className="text-white text-xs font-semibold">End-to-end encrypted</p>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginTop: '2px' }}>Your data never leaves your control</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL — Login form */}
      <div className="flex-1 bg-[var(--ll-bg)] flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden" style={{ transition: 'background 0.3s ease' }}>
        <div className="absolute inset-0 pointer-events-none opacity-[0.025]" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(255,255,255,1) 39px, rgba(255,255,255,1) 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(255,255,255,1) 39px, rgba(255,255,255,1) 40px)' }} />
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none opacity-[0.06]" style={{ background: 'radial-gradient(circle, var(--ll-primary) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />

        <div className="w-full max-w-[400px] relative z-10">
          <div className="flex lg:hidden items-center gap-2 mb-10 fade-up-1">
            <div className="w-7 h-7 rounded-lg bg-[var(--ll-primary)] flex items-center justify-center">
              <svg className="w-4 h-4 stroke-white" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="font-bold text-xl" style={{ color: 'var(--ll-text)' }}>LifeLink</span>
          </div>

          <div className="mb-8 fade-up-1">
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '38px', fontWeight: 500, color: 'var(--ll-text)', lineHeight: 1.1, letterSpacing: '-0.01em', transition: 'color 0.3s ease' }}>
              Welcome back
            </h2>
            <p style={{ color: 'var(--ll-text-muted)', fontSize: '14px', marginTop: '8px', transition: 'color 0.3s ease' }}>
              Sign in to your LifeLink account
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="fade-up-1 mb-4" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '12px 16px' }}>
              <p style={{ color: '#f87171', fontSize: '13px', margin: 0 }}>{error}</p>
            </div>
          )}

          <div className="fade-up-2 mb-6">
            <div style={{ background: 'var(--ll-card-bg)', border: '1px solid var(--ll-card-border)', borderRadius: '14px', padding: '4px', display: 'flex', gap: '4px', transition: 'background 0.3s ease, border-color 0.3s ease' }}>
              <button className={`role-tab ${role === 'patient' ? 'active' : 'inactive'}`} onClick={() => setRole('patient')}>
                Patient
              </button>
              <button className={`role-tab ${role === 'doctor' ? 'active' : 'inactive'}`} onClick={() => setRole('doctor')}>
                Doctor
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="fade-up-3">
              <label style={{ display: 'block', color: 'var(--ll-text-muted)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                Email address
              </label>
              <input
                type="email"
                className="input-field"
                placeholder={role === 'doctor' ? 'doctor@hospital.com' : 'you@example.com'}
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="fade-up-3">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ color: 'var(--ll-text-muted)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Password
                </label>
                <Link href="/forgot-password" style={{ color: 'var(--ll-primary)', fontSize: '12px', fontWeight: 500, textDecoration: 'none' }}>
                  Forgot password?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-field"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ paddingRight: '44px' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ll-text-muted)', padding: 0, display: 'flex', alignItems: 'center' }}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {role === 'doctor' && (
              <div className="fade-up-3">
                <label style={{ display: 'block', color: 'var(--ll-text-muted)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                  Medical Licence ID
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="MCI-XXXX-XXXX"
                />
              </div>
            )}

            <div className="fade-up-4 pt-2">
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <svg className="w-4 h-4 stroke-white animate-spin" fill="none" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  `Sign in as ${role === 'doctor' ? 'Doctor' : 'Patient'} →`
                )}
              </button>
            </div>
          </form>

          <div className="fade-up-4 flex items-center gap-3 my-6">
            <div className="divider-line" />
            <span style={{ color: 'var(--ll-text-muted)', opacity: 0.6, fontSize: '11px', fontWeight: 500, whiteSpace: 'nowrap' }}>or continue with</span>
            <div className="divider-line" />
          </div>

          <div className="fade-up-4 grid grid-cols-2 gap-3">
            {[
              {
                label: 'Google',
                icon: (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                ),
              },
              {
                label: 'MetaMask',
                icon: (
                  <svg className="w-4 h-4" viewBox="0 0 35 33" fill="none">
                    <path d="M32.958.5L19.47 10.37l2.44-5.8L32.958.5z" fill="#E17726" stroke="#E17726" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2.042.5l13.37 9.96-2.323-5.89L2.042.5z" fill="#E27625" stroke="#E27625" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M28.17 23.533l-3.59 5.498 7.683 2.115 2.205-7.49-6.298-.123zM1.55 23.656l2.19 7.49 7.668-2.115-3.575-5.498-6.283.123z" fill="#E27625" stroke="#E27625" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ),
              },
            ].map((opt, i) => (
              <button
                key={i}
                type="button"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '12px', background: 'var(--ll-card-bg)', border: '1px solid var(--ll-card-border)', color: 'var(--ll-text-muted)', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(var(--ll-accent-rgb), 0.15)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--ll-text)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--ll-card-bg)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--ll-text-muted)'; }}
              >
                {opt.icon}
                {opt.label}
              </button>
            ))}
          </div>

          <p className="fade-up-5 text-center mt-8" style={{ color: 'var(--ll-text-muted)', opacity: 0.7, fontSize: '13px' }}>
            Don&apos;t have an account?{' '}
            <Link href="/register" style={{ color: 'var(--ll-primary)', fontWeight: 600, textDecoration: 'none' }}>
              Create one free
            </Link>
          </p>

          <div className="fade-up-5 flex items-center justify-center gap-2 mt-6">
            <svg className="w-3 h-3 stroke-white/20" fill="none" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '11px' }}>256-bit encrypted · HIPAA compliant</span>
          </div>
        </div>
      </div>
    </div>
  )
}
