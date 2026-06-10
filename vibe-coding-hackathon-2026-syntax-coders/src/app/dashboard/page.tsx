'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import QRCode from 'qrcode'
import DoctorWorkspace from '@/components/DoctorWorkspace'

type Tab = 'overview' | 'records' | 'diagnostics' | 'emergency' | 'consent' | 'chat'

const THEMES = {
    'midnight-forest': {
        id: 'midnight-forest',
        name: 'Midnight Forest',
        tag: 'Nature',
        bg: '#0D1117',
        sidebar: '#161B22',
        primary: '#2D6A4F',
        accent: '#40916C',
        highlight: '#74C69D',
        soft: '#b7e4c7',
        tint: '#e8f5e9',
        cardBg: '#161B22',
        cardBorder: '#233044',
        textPrimary: '#F0E5D8',
        textMuted: '#8D97A7',
        heroGradient: 'linear-gradient(135deg, #2D6A4F 0%, #161B22 100%)',
        heroBorder: '#40916C',
        accentRgb: '64, 145, 108',
        isDark: true
    },
    'dusk-lavender': {
        id: 'dusk-lavender',
        name: 'Dusk Lavender',
        tag: 'Dreamy',
        bg: '#1A1625',
        sidebar: '#221D30',
        primary: '#6E48AA',
        accent: '#9D65C9',
        highlight: '#E040FB',
        soft: '#f3e5f5',
        tint: '#fce4ec',
        cardBg: '#221D30',
        cardBorder: '#3E3754',
        textPrimary: '#F0E5D8',
        textMuted: '#9B8FAD',
        heroGradient: 'linear-gradient(135deg, #6E48AA 0%, #221D30 100%)',
        heroBorder: '#9D65C9',
        accentRgb: '157, 101, 201',
        isDark: true
    },
    'arctic-slate': {
        id: 'arctic-slate',
        name: 'Arctic Slate',
        tag: 'Clinical',
        bg: '#0F172A',
        sidebar: '#1E293B',
        primary: '#4A74B9',
        accent: '#799CD2',
        highlight: '#A4C2EC',
        soft: '#D9E5F6',
        tint: '#F2F6FC',
        cardBg: '#1E293B',
        cardBorder: '#334155',
        textPrimary: '#F8FAFC',
        textMuted: '#94A3B8',
        heroGradient: 'linear-gradient(135deg, #4A74B9 0%, #1E293B 100%)',
        heroBorder: '#799CD2',
        accentRgb: '121, 156, 210',
        isDark: true
    },
    'ember-rose': {
        id: 'ember-rose',
        name: 'Ember Rose',
        tag: 'Bold',
        bg: '#1A0F0F',
        sidebar: '#261515',
        primary: '#C0392B',
        accent: '#E74C3C',
        highlight: '#FF8A80',
        soft: '#ffebee',
        tint: '#fff5f5',
        cardBg: '#261515',
        cardBorder: '#4A2B2B',
        textPrimary: '#F5E6E6',
        textMuted: '#A88585',
        heroGradient: 'linear-gradient(135deg, #C0392B 0%, #261515 100%)',
        heroBorder: '#E74C3C',
        accentRgb: '231, 76, 60',
        isDark: true
    },
    'ocean-abyss': {
        id: 'ocean-abyss',
        name: 'Ocean Abyss',
        tag: 'Calm',
        bg: '#020813',
        sidebar: '#071428',
        primary: '#006D77',
        accent: '#4FA4C8',
        highlight: '#88C3D8',
        soft: '#D0ECEF',
        tint: '#EEF8F9',
        cardBg: '#071428',
        cardBorder: '#162D4A',
        textPrimary: '#E0F2FE',
        textMuted: '#7EA2C6',
        heroGradient: 'linear-gradient(135deg, #006D77 0%, #071428 100%)',
        heroBorder: '#4FA4C8',
        accentRgb: '79, 164, 200',
        isDark: true
    },
    'golden-hour': {
        id: 'golden-hour',
        name: 'Golden Hour',
        tag: 'Warm',
        bg: '#FAF7F0',
        sidebar: '#FFF8EC',
        primary: '#D97706',
        accent: '#F59E0B',
        highlight: '#FDE68A',
        soft: '#fef3c7',
        tint: '#fffbeb',
        cardBg: '#FFFFFF',
        cardBorder: '#EADEC9',
        textPrimary: '#1E1B2E',
        textMuted: '#6B7280',
        heroGradient: 'linear-gradient(135deg, #D97706 0%, #FFF8EC 100%)',
        heroBorder: '#F59E0B',
        accentRgb: '245, 158, 11',
        isDark: false
    }
}

const EMERGENCY_CLINICS = [
    { name: "AIIMS Emergency Dept", address: "Ansari Nagar, New Delhi", phone: "+91-11-26588500", lat: 28.5672, lon: 77.2100 },
    { name: "KEM Hospital Emergency", address: "Parel, Mumbai", phone: "+91-22-24107000", lat: 19.0028, lon: 72.8421 },
    { name: "NIMHANS Casualty", address: "Hosur Road, Bengaluru", phone: "+91-80-26995000", lat: 12.9362, lon: 77.5976 },
    { name: "Fortis Emergency Care", address: "Sector 62, Noida", phone: "+91-120-4300222", lat: 28.6189, lon: 77.3733 },
    { name: "Apollo Greams Road ER", address: "Thousand Lights, Chennai", phone: "+91-44-28290200", lat: 13.0601, lon: 80.2512 },
    { name: "PGIMER Emergency Care", address: "Sector 12, Chandigarh", phone: "+91-172-2747585", lat: 30.7678, lon: 76.7790 },
    { name: "SCB Medical Emergency", address: "Manglabag, Cuttack", phone: "+91-671-2505415", lat: 20.4735, lon: 85.8814 }
]

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371 // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
}

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState<Tab>('overview')
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [user, setUser] = useState<any>(null)
    const router = useRouter()

    const [themeKey, setThemeKey] = useState<string>('ocean-abyss')
    const [showThemeDropdown, setShowThemeDropdown] = useState(false)

    const [consentLogs, setConsentLogs] = useState<any[]>([])
    const [activeConsents, setActiveConsents] = useState<any[]>([])
    const [doctorEmail, setDoctorEmail] = useState('')
    const [doctorName, setDoctorName] = useState('')
    const [expiresAt, setExpiresAt] = useState('')
    const [successMessage, setSuccessMessage] = useState('')
    const [consentLoading, setConsentLoading] = useState(false)
    const [consentError, setConsentError] = useState('')

    const [showEditModal, setShowEditModal] = useState(false)
    const [editForm, setEditForm] = useState({ bloodGroup: '', allergies: '', emergencyContact: '', gender: '', dob: '' })

    const qrCanvasRef = useRef<HTMLCanvasElement>(null)
    const [userLocation, setUserLocation] = useState<{ lat: number, lon: number } | null>(null)
    const [locationError, setLocationError] = useState('')
    const [nearestDoctors, setNearestDoctors] = useState<any[]>([])

    // Format date helper: "DD MMM YYYY"
    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Permanent'
        const date = new Date(dateString)
        const day = String(date.getDate()).padStart(2, '0')
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const month = months[date.getMonth()]
        const year = date.getFullYear()
        return `Expires: ${day} ${month} ${year}`
    }

    // Format time helper: "Today 2:30 PM" or "12 Jun, 11:00 AM"
    const formatTime = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()

        const isToday =
            date.getDate() === now.getDate() &&
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear()

        const hours24 = date.getHours()
        const minutes = String(date.getMinutes()).padStart(2, '0')
        const ampm = hours24 >= 12 ? 'PM' : 'AM'
        const hours = hours24 % 12 || 12
        const timeStr = `${hours}:${minutes} ${ampm}`

        if (isToday) {
            return `Today ${timeStr}`
        } else {
            const day = date.getDate()
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            const month = months[date.getMonth()]
            return `${day} ${month}, ${timeStr}`
        }
    }

    // Action text mapping
    const getActionText = (action: string) => {
        switch (action) {
            case 'access_granted':
                return 'was granted access'
            case 'access_revoked':
                return 'access was revoked'
            case 'record_viewed':
                return 'viewed your record'
            default:
                return action
        }
    }

    // Action icon mapping
    const getActionIcon = (action: string) => {
        switch (action) {
            case 'access_granted':
                return '🔓'
            case 'access_revoked':
                return '🔒'
            case 'record_viewed':
                return '👁'
            default:
                return '📝'
        }
    }


    const detectLocationAndNearestDoctors = () => {
        if (!navigator.geolocation) {
            setLocationError("Geolocation is not supported by your browser.")
            const fallbackClinics = EMERGENCY_CLINICS.map(clinic => ({ ...clinic, distance: null }))
            setNearestDoctors(fallbackClinics)
            return
        }

        setLocationError("")
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords
                setUserLocation({ lat: latitude, lon: longitude })
                
                const clinicsWithDistance = EMERGENCY_CLINICS.map(clinic => {
                    const distance = calculateDistance(latitude, longitude, clinic.lat, clinic.lon)
                    return { ...clinic, distance }
                })
                
                clinicsWithDistance.sort((a, b) => a.distance - b.distance)
                setNearestDoctors(clinicsWithDistance)
            },
            (error) => {
                console.error("Location detection failed:", error)
                setLocationError("Unable to retrieve GPS location. Displaying default ER registry.")
                const fallbackClinics = EMERGENCY_CLINICS.map(clinic => ({ ...clinic, distance: null }))
                setNearestDoctors(fallbackClinics)
            },
            { enableHighAccuracy: true, timeout: 8000 }
        )
    }

    const downloadQR = () => {
        if (qrCanvasRef.current) {
            const url = qrCanvasRef.current.toDataURL('image/png')
            const link = document.createElement('a')
            link.href = url
            link.download = 'lifelink-emergency-qr-offline.png'
            link.click()
        }
    }

    const shareQROffline = async () => {
        if (!qrCanvasRef.current) return
        try {
            qrCanvasRef.current.toBlob(async (blob) => {
                if (!blob) return
                const file = new File([blob], 'lifelink-emergency-qr.png', { type: 'image/png' })
                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        files: [file],
                        title: 'Emergency Medical QR Code',
                        text: `LifeLink Emergency medical profile QR code for ${user?.name || 'Patient'}`
                    })
                } else {
                    downloadQR()
                }
            }, 'image/png')
        } catch (err) {
            console.error("Web Share failed, falling back to download:", err)
            downloadQR()
        }
    }

    useEffect(() => {
        const savedTheme = localStorage.getItem('lifelink-theme')
        if (savedTheme && savedTheme in THEMES) {
            setThemeKey(savedTheme)
        }
    }, [])

    useEffect(() => {
        if (activeTab === 'emergency') {
            detectLocationAndNearestDoctors()
        }
    }, [activeTab])

    useEffect(() => {
        if (activeTab === 'emergency' && qrCanvasRef.current && user) {
            const ed = {
                name: user?.name || 'Loading...',
                bloodGroup: user?.patient?.bloodGroup || 'Not set',
                allergies: user?.patient?.allergies || 'None listed',
                emergencyContact: user?.patient?.emergencyContact || 'Not set',
            }
            const triageUrl = `http://localhost:3000/emergency/scan?id=${user?.patient?.id || ''}&name=${encodeURIComponent(ed.name)}&blood=${encodeURIComponent(ed.bloodGroup)}&allergies=${encodeURIComponent(ed.allergies)}&contact=${encodeURIComponent(ed.emergencyContact)}`
            
            QRCode.toCanvas(qrCanvasRef.current, triageUrl, {
                width: 180,
                margin: 1,
                color: {
                    dark: '#1A1A2E',
                    light: '#ffffff'
                }
            }, (err) => {
                if (err) console.error("Failed to generate offline QR code:", err)
            })
        }
    }, [activeTab, user])

    useEffect(() => {
        const activeTheme = THEMES[themeKey as keyof typeof THEMES] || THEMES['ocean-abyss']
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
    }, [themeKey])

    const handleThemeChange = (key: string) => {
        setThemeKey(key)
        localStorage.setItem('lifelink-theme', key)
    }

    const fetchDashboardData = async () => {
        const token = localStorage.getItem('accessToken')
        if (!token) return
        const headers = { Authorization: `Bearer ${token}` }

        fetch('http://localhost:4000/auth/me', { headers })
            .then(res => res.json())
            .then(data => {
                if (data.user) {
                    setUser(data.user)
                    localStorage.setItem('user', JSON.stringify(data.user))
                    setEditForm({
                        bloodGroup: data.user.patient?.bloodGroup || '',
                        allergies: data.user.patient?.allergies || '',
                        emergencyContact: data.user.patient?.emergencyContact || '',
                        gender: data.user.patient?.gender || '',
                        dob: data.user.patient?.dateOfBirth ? new Date(data.user.patient.dateOfBirth).toISOString().split('T')[0] : ''
                    })
                }
            }).catch(() => { })

        fetch('http://localhost:4000/api/reports/my', { headers })
            .then(res => res.json())
            .then(data => { if (data.reports) setMyReports(data.reports) }).catch(() => { })

        fetch('http://localhost:4000/ai/analyses', { headers })
            .then(res => res.json())
            .then(data => { if (data.analyses) setPastAnalyses(data.analyses) }).catch(() => { })

        fetch('/api/consent/logs', { headers })
            .then(res => res.json())
            .then(data => { if (data.success && data.logs) setConsentLogs(data.logs) }).catch(() => { })

        fetch('/api/consent/list', { headers })
            .then(res => res.json())
            .then(data => { if (data.success && data.consents) setActiveConsents(data.consents) }).catch(() => { })

        if (activeTab === 'chat') {
            fetch('http://localhost:4000/api/ai-chat/history', { headers })
                .then(res => res.json())
                .then(data => {
                    if (data.history) {
                        const sortedHistory = [...data.history].reverse()
                        const messages: { role: 'user' | 'assistant'; content: string }[] = []
                        const historyForApi: { role: 'user' | 'assistant' | 'system'; content: string }[] = []
                        
                        sortedHistory.forEach((item: any) => {
                            if (item.symptomsInput) {
                                messages.push({ role: 'user', content: item.symptomsInput })
                                historyForApi.push({ role: 'user', content: item.symptomsInput })
                            }
                            if (item.aiSummary) {
                                messages.push({ role: 'assistant', content: item.aiSummary })
                                historyForApi.push({ role: 'assistant', content: item.aiSummary })
                            }
                        })
                        
                        setChatMessages(messages)
                        setChatHistory(historyForApi)
                        setTimeout(() => {
                            document.getElementById('chat-messages')?.scrollTo({ top: 99999, behavior: 'smooth' })
                        }, 100)
                    }
                }).catch(() => { })
        }
    }

    useEffect(() => {
        const token = localStorage.getItem('accessToken')
        const userData = localStorage.getItem('user')
        if (!token || !userData) { router.push('/login'); return }
        try { setUser(JSON.parse(userData)) } catch { router.push('/login') }
        fetchDashboardData()
    }, [router, activeTab])

    const handleSignOut = () => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        router.push('/login')
    }

    const userInitials = user?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'LL'
    const userName = user?.name || 'Loading...'
    const userRole = user?.role || 'patient'

    const [symptomsInput, setSymptomsInput] = useState('')
    const [diagLoading, setDiagLoading] = useState(false)
    const [diagResult, setDiagResult] = useState<{ aiSummary: string; riskLevel: string; recommendedAction: string; confidenceScore: number } | null>(null)
    const [diagError, setDiagError] = useState('')
    const [pastAnalyses, setPastAnalyses] = useState<{ id: string; symptomsInput: string; aiSummary: string; riskLevel: string; recommendedAction: string; createdAt: string }[]>([])

    const runDiagnostic = async () => {
        if (!symptomsInput.trim() || symptomsInput.length < 5) { setDiagError('Please describe your symptoms (at least 5 characters)'); return }
        setDiagLoading(true); setDiagError(''); setDiagResult(null)
        try {
            const token = localStorage.getItem('accessToken')
            const res = await fetch('http://localhost:4000/ai/analyze-symptoms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ symptomsInput: symptomsInput.trim() }),
            })
            const data = await res.json()
            if (!res.ok) { setDiagError(data.message || 'Analysis failed'); return }
            setDiagResult(data.analysis)
            setSymptomsInput('')
            fetchDashboardData()
        } catch { setDiagError('Unable to connect to server') } finally { setDiagLoading(false) }
    }

    const handleGrantConsent = async (e: React.FormEvent) => {
        e.preventDefault()
        const token = localStorage.getItem('accessToken')
        if (!token) return

        setConsentError('')
        setSuccessMessage('')
        setConsentLoading(true)

        try {
            const res = await fetch('/api/consent/grant', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    doctorEmail: doctorEmail.trim(),
                    doctorName: doctorName.trim() || undefined,
                    expiresAt: expiresAt || undefined,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                setConsentError(data.message || 'Failed to grant access')
            } else {
                setSuccessMessage('Access granted successfully!')
                setDoctorEmail('')
                setDoctorName('')
                setExpiresAt('')
                fetchDashboardData() // Refresh list & logs
            }
        } catch (err) {
            setConsentError('Could not connect to server. Please try again.')
        } finally {
            setConsentLoading(false)
        }
    }

    const handleRevokeConsent = async (consentId: string) => {
        const token = localStorage.getItem('accessToken')
        if (!token) return

        if (!window.confirm('Are you sure you want to revoke access for this doctor?')) {
            return
        }

        setConsentLoading(true)
        try {
            const res = await fetch('/api/consent/revoke', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ consentId }),
            })

            if (res.ok) {
                fetchDashboardData() // Refresh list & logs
            } else {
                const data = await res.json()
                alert(data.message || 'Failed to revoke access')
            }
        } catch (err) {
            alert('Could not connect to server to revoke access.')
        } finally {
            setConsentLoading(false)
        }
    }

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault(); setConsentLoading(true); setConsentError('')
        try {
            const token = localStorage.getItem('accessToken')
            const res = await fetch('http://localhost:4000/auth/patient/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ bloodGroup: editForm.bloodGroup, allergies: editForm.allergies, emergencyContact: editForm.emergencyContact, gender: editForm.gender, dateOfBirth: editForm.dob ? new Date(editForm.dob).toISOString() : undefined })
            })
            const data = await res.json()
            if (!res.ok) { setConsentError(data.message || 'Failed to update profile'); return }
            setShowEditModal(false); fetchDashboardData()
        } catch { setConsentError('Unable to connect to server') } finally { setConsentLoading(false) }
    }

    const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([])
    const [chatInput, setChatInput] = useState('')
    const [chatLoading, setChatLoading] = useState(false)
    const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'assistant' | 'system'; content: string }[]>([])

    const fileInputRef = useRef<HTMLInputElement>(null)
    const [uploadingFile, setUploadingFile] = useState(false)
    const [uploadError, setUploadError] = useState('')
    const [myReports, setMyReports] = useState<{ id: string; fileName: string; fileSize: number; reportType: string; ipfsCid: string; fileUrl: string; uploadedAt: string }[]>([])

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; if (!file) return
        setUploadingFile(true); setUploadError('')
        try {
            const token = localStorage.getItem('accessToken')
            const formData = new FormData()
            formData.append('file', file)
            formData.append('reportType', file.name.includes('prescription') ? 'Prescription' : file.name.includes('scan') || file.name.includes('xray') || file.name.includes('mri') ? 'Scan' : 'Lab Report')
            const res = await fetch('http://localhost:4000/api/reports/upload', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData })
            const data = await res.json()
            if (!res.ok) { setUploadError(data.message || 'Upload failed'); return }
            const listRes = await fetch('http://localhost:4000/api/reports/my', { headers: { Authorization: `Bearer ${token}` } })
            const listData = await listRes.json()
            if (listData.reports) setMyReports(listData.reports)
        } catch { setUploadError('Unable to connect to server') } finally {
            setUploadingFile(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    const sendChatMessage = () => {
        if (!chatInput.trim() || chatLoading) return
        const userMsg = chatInput.trim()
        setChatInput('')
        setChatMessages(prev => [...prev, { role: 'user', content: userMsg }])
        setChatLoading(true)
        setTimeout(() => { document.getElementById('chat-messages')?.scrollTo({ top: 99999, behavior: 'smooth' }) }, 50)
        const token = localStorage.getItem('accessToken')
        fetch('http://localhost:4000/api/ai-chat/message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ message: userMsg, conversationHistory: chatHistory }),
        })
            .then(res => res.json())
            .then(data => {
                setChatMessages(prev => [...prev, { role: 'assistant', content: data.reply || 'Sorry, I could not process that.' }])
                if (data.updatedHistory) setChatHistory(data.updatedHistory)
                setTimeout(() => { document.getElementById('chat-messages')?.scrollTo({ top: 99999, behavior: 'smooth' }) }, 50)
            })
            .catch(() => { setChatMessages(prev => [...prev, { role: 'assistant', content: 'Unable to connect to the server. Please try again.' }]) })
            .finally(() => setChatLoading(false))
    }

    const isDoctor = userRole === 'DOCTOR'

    const navItems: { id: Tab; label: string; emoji: string }[] = isDoctor
        ? [
            { id: 'overview', label: 'Workspace', emoji: '🩺' },
        ]
        : [
            { id: 'overview', label: 'Overview', emoji: '🏠' },
            { id: 'records', label: 'Health Records', emoji: '📋' },
            { id: 'diagnostics', label: 'AI Diagnostics', emoji: '🔬' },
            { id: 'emergency', label: 'Emergency Beacon', emoji: '🚨' },
            { id: 'consent', label: 'Consent Logs', emoji: '🔗' },
            { id: 'chat', label: 'AI Health Chat', emoji: '💬' },
        ]

    /* ── pastel card accent map ── */
    const tabAccent: Record<Tab, string> = {
        overview: '#C8DFCC',
        records: '#D4C5E8',
        diagnostics: '#F5E6C8',
        emergency: '#F2C4C4',
        consent: '#C4D8F2',
        chat: '#E8C4D8',
    }

    return (
        <div className="ll-root" style={{ 
            fontFamily: "'DM Sans', sans-serif", 
            background: 'var(--ll-bg)', 
            minHeight: '100vh', 
            display: 'flex',
            position: 'relative',
            overflow: 'hidden',
            transition: 'background 0.3s ease, color 0.3s ease'
        }}>
            {/* Boho Background Shapes & Line Art */}
            <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '45vw', height: '45vw', borderRadius: '50%', background: 'rgba(var(--ll-accent-rgb), 0.12)', filter: 'blur(110px)', pointerEvents: 'none', zIndex: 0, transition: 'background 0.3s ease' }} />
            <div style={{ position: 'absolute', bottom: '-5%', left: '10%', width: '40vw', height: '40vw', borderRadius: '50%', background: 'rgba(var(--ll-accent-rgb), 0.08)', filter: 'blur(120px)', pointerEvents: 'none', zIndex: 0, transition: 'background 0.3s ease' }} />
            
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.15, zIndex: 0 }} xmlns="http://www.w3.org/2000/svg">
                <path d="M-100,250 C300,120 200,650 600,450 C1000,250 800,850 1200,650 C1600,450 1400,950 1800,750" fill="none" stroke="var(--ll-accent)" strokeWidth="2.5" style={{ transition: 'stroke 0.3s ease' }} />
                <path d="M-50,300 C350,170 250,700 650,500 C1050,300 850,900 1250,700" fill="none" stroke="var(--ll-highlight)" strokeWidth="1.5" style={{ transition: 'stroke 0.3s ease' }} />
                <g transform="translate(1380, 520) scale(0.95)" stroke="var(--ll-accent)" strokeWidth="2.5" fill="none" strokeLinecap="round" style={{ transition: 'stroke 0.3s ease' }}>
                    <path d="M100,300 Q150,150 200,0" />
                    <path d="M200,0 Q170,40 150,50 Q170,60 200,0" fill="rgba(var(--ll-accent-rgb), 0.08)" style={{ transition: 'fill 0.3s ease' }} />
                    <path d="M180,60 Q130,90 110,95 Q130,110 180,60" fill="rgba(var(--ll-accent-rgb), 0.08)" style={{ transition: 'fill 0.3s ease' }} />
                    <path d="M160,130 Q90,150 70,150 Q90,170 160,130" fill="rgba(var(--ll-accent-rgb), 0.08)" style={{ transition: 'fill 0.3s ease' }} />
                    <path d="M140,200 Q70,230 50,230 Q70,250 140,200" fill="rgba(var(--ll-accent-rgb), 0.08)" style={{ transition: 'fill 0.3s ease' }} />
                </g>
            </svg>

            <style>{`
        @import url("https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@500;600;700&display=swap");

        * { box-sizing: border-box; }

        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.96); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes pulseGreen {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:.5; transform:scale(.85); }
        }
        @keyframes ecgDraw {
          to { stroke-dashoffset: 0; }
        }
        @keyframes floatQR {
          0%,100% { transform:translateY(0); }
          50%      { transform:translateY(-6px); }
        }
        @keyframes dotPulse {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:.4; transform:scale(.7); }
        }

        .ll-sidebar { animation: slideIn .35s cubic-bezier(.22,1,.36,1) both; transition: background 0.3s ease, border-color 0.3s ease; }
        .ll-fadein  { animation: fadeUp .4s cubic-bezier(.22,1,.36,1) both; }
        .ll-fadein-1{ animation: fadeUp .4s cubic-bezier(.22,1,.36,1) .05s both; }
        .ll-fadein-2{ animation: fadeUp .4s cubic-bezier(.22,1,.36,1) .10s both; }
        .ll-fadein-3{ animation: fadeUp .4s cubic-bezier(.22,1,.36,1) .15s both; }
        .ll-fadein-4{ animation: fadeUp .4s cubic-bezier(.22,1,.36,1) .20s both; }
        .ll-popin   { animation: popIn  .3s cubic-bezier(.22,1,.36,1) both; }

        .ll-card {
          background: var(--ll-card-bg);
          border-radius: 20px;
          border: 1.5px solid var(--ll-card-border);
          box-shadow: 0 4px 24px rgba(0,0,0,.15);
          transition: box-shadow .2s, transform .2s, background 0.3s ease, border-color 0.3s ease;
        }
        .ll-card:hover { box-shadow: 0 8px 32px rgba(0,0,0,.25); transform: translateY(-2px); }

        .ll-nav-btn {
          display: flex; align-items: center; gap: 10px;
          width: 100%; padding: 12px 14px;
          border-radius: 12px; border: none;
          background: transparent; cursor: pointer;
          font-family: inherit; font-size: 15px; font-weight: 600;
          color: var(--ll-text-muted); text-align: left;
          transition: background .15s, color .15s;
        }
        .ll-nav-btn:hover  { background: rgba(var(--ll-accent-rgb), 0.12); color: var(--ll-text); }
        .ll-nav-btn.active { background: var(--ll-primary); color: #fff; font-weight: 700; }
        .ll-nav-btn.active .ll-nav-emoji { filter: none; }

        .ll-pill {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 16px; border-radius: 100px;
          font-size: 13px; font-weight: 600;
          border: 1.5px solid transparent;
          transition: background .15s;
        }

        .ll-badge {
          display: inline-block;
          padding: 4px 12px; border-radius: 100px;
          font-size: 11px; font-weight: 700;
          text-transform: uppercase; letter-spacing: .05em;
        }

        .ll-input {
          width: 100%; padding: 12px 16px;
          border-radius: 12px;
          border: 1.5px solid var(--ll-card-border);
          background: var(--ll-input-bg);
          font-family: inherit; font-size: 14px; color: var(--ll-text);
          outline: none; transition: border-color .15s, box-shadow .15s, background 0.3s ease;
        }
        .ll-input:focus {
          border-color: var(--ll-primary);
          box-shadow: 0 0 0 3px rgba(var(--ll-accent-rgb),.15);
        }
        .ll-input::placeholder { color: var(--ll-text-muted); opacity: 0.6; }

        .ll-btn-primary {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          padding: 13px 24px; border-radius: 100px;
          background: var(--ll-primary); color: #fff;
          font-family: inherit; font-size: 14px; font-weight: 700;
          border: none; cursor: pointer;
          transition: background .15s, transform .15s, box-shadow .15s;
        }
        .ll-btn-primary:hover:not(:disabled) { background: var(--ll-accent); transform: translateY(-1px); box-shadow: 0 6px 20px rgba(var(--ll-accent-rgb),.25); }
        .ll-btn-primary:disabled { opacity: .55; cursor: not-allowed; }

        .ll-btn-ghost {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          padding: 12px 24px; border-radius: 100px;
          background: transparent; color: var(--ll-text);
          font-family: inherit; font-size: 14px; font-weight: 600;
          border: 1.5px solid var(--ll-card-border); cursor: pointer;
          transition: background .15s, border-color .15s;
        }
        .ll-btn-ghost:hover { background: rgba(var(--ll-accent-rgb), 0.12); border-color: var(--ll-primary); }

        .ll-stat-card {
          border-radius: 20px; padding: 22px;
          border: 1.5px solid transparent;
          transition: transform .2s, box-shadow .2s;
        }
        .ll-stat-card:hover { transform: translateY(-3px); box-shadow: 0 10px 32px rgba(0,0,0,.07); }

        .ll-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 13px 16px; border-radius: 14px;
          transition: background .12s;
          cursor: pointer;
        }
        .ll-row:hover { background: rgba(var(--ll-accent-rgb), 0.08); }

        .ll-toggle {
          width: 38px; height: 22px; border-radius: 100px;
          border: none; cursor: pointer; position: relative;
          flex-shrink: 0; transition: background .2s;
        }
        .ll-toggle::after {
          content: ''; position: absolute;
          width: 16px; height: 16px; border-radius: 50%; background: #fff;
          top: 3px; transition: left .2s;
          box-shadow: 0 1px 4px rgba(0,0,0,.15);
        }
        .ll-toggle.on  { background: #4CAF79; }
        .ll-toggle.on::after  { left: 19px; }
        .ll-toggle.off { background: #D5D2CB; }
        .ll-toggle.off::after { left: 3px; }

        .ll-ecg-path {
          stroke-dasharray: 600; stroke-dashoffset: 600;
          animation: ecgDraw 3s ease-out .5s forwards;
        }
        .ll-qr-float { animation: floatQR 4s ease-in-out infinite; }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--ll-card-border); border-radius: 4px; }

        /* Global typography & element dynamic mappings */
        .ll-root h2:not(.ll-badge), 
        .ll-root h3, 
        .ll-root p:not(.ll-badge):not(.ll-stat-card p),
        .ll-root span:not(.ll-badge):not(.ll-stat-card span):not(.ll-pill):not(.ll-nav-emoji) {
          color: var(--ll-text) !important;
          transition: color 0.3s ease;
        }
        .ll-root p {
          color: var(--ll-text-muted) !important;
          transition: color 0.3s ease;
        }
        .ll-root h1, .ll-root h2, .ll-root h3, .ll-root strong, .ll-root .ll-row p {
          color: var(--ll-text) !important;
          transition: color 0.3s ease;
        }
        /* Overrides for hardcoded #fff card layouts in other tabs */
        .ll-root div[style*="background: '#fff'"],
        .ll-root div[style*="background: rgb(255, 255, 255)"],
        .ll-root div[style*="background:#fff"],
        .ll-root div[style*="background: '#ffffff'"],
        .ll-root div[style*="background:#ffffff"] {
          background: var(--ll-card-bg) !important;
          border-color: var(--ll-card-border) !important;
          transition: background 0.3s ease, border-color 0.3s ease;
        }
        /* Muted highlights in logs / diagnostics textareas */
        .ll-root textarea {
          background: var(--ll-card-bg) !important;
          border-color: var(--ll-card-border) !important;
          color: var(--ll-text) !important;
          transition: background 0.3s ease, border-color 0.3s ease, color 0.3s ease;
        }
      `}</style>

            {/* ─── SIDEBAR ─── */}
            <aside
                className="ll-sidebar"
                style={{
                    width: 230, minWidth: 230,
                    margin: '16px 0 16px 16px',
                    height: 'calc(100vh - 32px)',
                    position: 'sticky', top: 16,
                    background: 'var(--ll-sidebar)',
                    border: '1.5px solid var(--ll-card-border)',
                    borderRadius: 24,
                    boxShadow: '0 4px 24px rgba(0,0,0,.2)',
                    display: 'flex', flexDirection: 'column',
                    flexShrink: 0,
                    zIndex: 40,
                }}
            >
                {/* Logo */}
                <div style={{ padding: '20px 18px 16px', borderBottom: '1.5px solid var(--ll-card-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 34, height: 34, borderRadius: 10,
                            background: 'var(--ll-primary)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                        <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 21, color: 'var(--ll-text)', letterSpacing: '-.02em' }}>LifeLink</span>
                    </div>
                </div>

                {/* User profile */}
                <div style={{ padding: '14px 18px', borderBottom: '1.5px solid var(--ll-card-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--ll-primary), var(--ll-accent))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0
                        }}>
                            {userInitials}
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ll-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userName}</div>
                            <div style={{ fontSize: 12, color: 'var(--ll-text-muted)', marginTop: 2, fontWeight: 500 }}>{userRole === 'DOCTOR' ? 'Doctor' : 'Patient'}</div>
                        </div>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4CAF79', flexShrink: 0, animation: 'pulseGreen 2.5s ease-in-out infinite' }} />
                    </div>
                </div>

                {/* Nav */}
                <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            className={`ll-nav-btn ${activeTab === item.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(item.id)}
                        >
                            <span className="ll-nav-emoji" style={{ fontSize: 15, lineHeight: 1 }}>{item.emoji}</span>
                            {item.label}
                        </button>
                    ))}
                </nav>

                {/* Bottom */}
                <div style={{ padding: '10px 10px 16px', borderTop: '1.5px solid var(--ll-card-border)', display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <button className="ll-nav-btn">
                        <span style={{ fontSize: 15 }}>⚙️</span> Settings
                    </button>
                    <button className="ll-nav-btn" style={{ color: '#E05454' }} onClick={handleSignOut}>
                        <span style={{ fontSize: 18 }}>👋</span> Sign out
                    </button>
                </div>
            </aside>

            {/* ─── MAIN ─── */}
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', overflow: 'hidden', zIndex: 1 }}>

                {/* Topbar */}
                <header style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '18px 28px',
                    background: 'var(--ll-sidebar)', backdropFilter: 'blur(12px)',
                    borderBottom: '1.5px solid var(--ll-card-border)',
                    position: 'sticky', top: 0, zIndex: 30,
                    transition: 'background 0.3s ease, border-color 0.3s ease'
                }}>
                    <div>
                        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 700, color: 'var(--ll-text)', margin: 0, lineHeight: 1 }}>
                            {navItems.find(n => n.id === activeTab)?.label}
                        </h1>
                        <p style={{ fontSize: 12, color: 'var(--ll-text-muted)', marginTop: 4, marginBottom: 0 }}>LifeLink · just now</p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '9px 14px', borderRadius: 12,
                            background: 'var(--ll-card-bg)', border: '1.5px solid var(--ll-card-border)',
                            width: 190,
                            transition: 'background 0.3s ease, border-color 0.3s ease'
                        }}>
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="var(--ll-text-muted)" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            <input placeholder="Search records…" style={{ background: 'none', border: 'none', outline: 'none', fontSize: 12, color: 'var(--ll-text)', width: '100%', fontFamily: 'inherit' }} />
                        </div>

                        {/* Theme Switcher Dropdown */}
                        <div style={{ position: 'relative', zIndex: 100 }}>
                            <button
                                onClick={() => setShowThemeDropdown(!showThemeDropdown)}
                                style={{
                                    height: 38, borderRadius: 12,
                                    background: 'var(--ll-card-bg)', border: '1.5px solid var(--ll-card-border)',
                                    display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px',
                                    cursor: 'pointer', color: 'var(--ll-text)', fontWeight: 600, fontSize: 13,
                                    transition: 'border-color 0.2s, background 0.2s'
                                }}
                            >
                                <span style={{ fontSize: 15 }}>🎨</span>
                                <span style={{ display: 'inline' }}>
                                    {THEMES[themeKey as keyof typeof THEMES]?.name || 'Theme'}
                                </span>
                            </button>
                            {showThemeDropdown && (
                                <div style={{
                                    position: 'absolute', right: 0, top: 46, width: 220,
                                    background: 'var(--ll-card-bg)', border: '1.5px solid var(--ll-card-border)',
                                    borderRadius: 16, boxShadow: '0 12px 32px rgba(0,0,0,0.25)',
                                    padding: 8, display: 'flex', flexDirection: 'column', gap: 4
                                }}>
                                    <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--ll-text-muted)', textTransform: 'uppercase', letterSpacing: '.05em', padding: '6px 8px 4px', margin: 0 }}>Select Theme</p>
                                    {Object.values(THEMES).map((t) => (
                                        <button
                                            key={t.id}
                                            onClick={() => {
                                                handleThemeChange(t.id);
                                                setShowThemeDropdown(false);
                                            }}
                                            style={{
                                                width: '100%', padding: '8px 10px', borderRadius: 10,
                                                background: themeKey === t.id ? 'var(--ll-primary)' : 'transparent',
                                                border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
                                                justifyContent: 'space-between', transition: 'background 0.15s'
                                            }}
                                        >
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                                <span style={{ fontSize: 13, fontWeight: 600, color: themeKey === t.id ? '#fff' : 'var(--ll-text)' }}>{t.name}</span>
                                                <span style={{ fontSize: 9, color: themeKey === t.id ? 'rgba(255,255,255,0.7)' : 'var(--ll-text-muted)', marginTop: 2 }}>{t.tag}</span>
                                            </div>
                                            <div style={{ display: 'flex', gap: 2 }}>
                                                <div style={{ width: 10, height: 10, borderRadius: '50%', background: t.bg, border: '1px solid rgba(255,255,255,0.2)' }} />
                                                <div style={{ width: 10, height: 10, borderRadius: '50%', background: t.primary }} />
                                                <div style={{ width: 10, height: 10, borderRadius: '50%', background: t.accent }} />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button style={{
                            width: 38, height: 38, borderRadius: 12,
                            background: 'var(--ll-card-bg)', border: '1.5px solid var(--ll-card-border)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', position: 'relative',
                            transition: 'background 0.3s ease, border-color 0.3s ease'
                        }}>
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="var(--ll-text-muted)" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                            <span style={{ position: 'absolute', top: 8, right: 8, width: 7, height: 7, borderRadius: '50%', background: '#E05454', border: '1.5px solid var(--ll-bg)' }} />
                        </button>
                    </div>
                </header>

                {/* Content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '28px 28px 40px', zIndex: 1 }}>

                    {/* ─── DOCTOR WORKSPACE ─── */}
                    {isDoctor && (
                        <DoctorWorkspace user={user} />
                    )}

                    {!isDoctor && activeTab === 'overview' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                            {/* Hero greeting */}
                            <div className="ll-fadein" style={{
                                background: 'var(--ll-hero-gradient)', 
                                borderRadius: 24, padding: '36px 40px',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                overflow: 'hidden', position: 'relative',
                                border: '1.5px solid var(--ll-hero-border)',
                                boxShadow: '0 8px 32px rgba(var(--ll-accent-rgb), 0.2)',
                                transition: 'background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease'
                            }}>
                                {/* Boho SVG Sun & Mountains / Lines Background Image inside greeting card */}
                                <svg style={{ position: 'absolute', right: '3%', bottom: '-20%', width: '320px', height: '220px', opacity: 0.28, pointerEvents: 'none', zIndex: 0 }} viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    {/* Sun & concentric rays */}
                                    <circle cx="100" cy="90" r="45" fill="var(--ll-highlight)" style={{ transition: 'fill 0.3s ease' }} />
                                    <circle cx="100" cy="90" r="58" stroke="var(--ll-soft)" strokeWidth="0.75" strokeDasharray="3 3" style={{ transition: 'stroke 0.3s ease' }} />
                                    <circle cx="100" cy="90" r="70" stroke="var(--ll-highlight)" strokeWidth="0.5" style={{ transition: 'stroke 0.3s ease' }} />
                                    <circle cx="100" cy="90" r="82" stroke="var(--ll-soft)" strokeWidth="0.5" strokeDasharray="4 4" style={{ transition: 'stroke 0.3s ease' }} />
                                    
                                    {/* Boho landscape lines */}
                                    <path d="M-20,90 Q40,55 100,90 T220,90" stroke="#FFF" strokeWidth="1.5" />
                                    <path d="M-20,95 Q40,65 100,95 T220,95" stroke="var(--ll-soft)" strokeWidth="1" style={{ transition: 'stroke 0.3s ease' }} />
                                    
                                    {/* Rising rays */}
                                    <line x1="100" y1="40" x2="100" y2="15" stroke="var(--ll-highlight)" strokeWidth="1.5" style={{ transition: 'stroke 0.3s ease' }} />
                                    <line x1="65" y1="55" x2="45" y2="35" stroke="var(--ll-highlight)" strokeWidth="1.5" style={{ transition: 'stroke 0.3s ease' }} />
                                    <line x1="135" y1="55" x2="155" y2="35" stroke="var(--ll-highlight)" strokeWidth="1.5" style={{ transition: 'stroke 0.3s ease' }} />
                                    <line x1="80" y1="45" x2="70" y2="22" stroke="var(--ll-highlight)" strokeWidth="1.2" style={{ transition: 'stroke 0.3s ease' }} />
                                    <line x1="120" y1="45" x2="130" y2="22" stroke="var(--ll-highlight)" strokeWidth="1.2" style={{ transition: 'stroke 0.3s ease' }} />

                                    {/* Delicate stars/sparkles */}
                                    <path d="M40,20 Q40,25 45,25 Q40,25 40,30 Q40,25 35,25 Q40,25 40,20 Z" fill="var(--ll-highlight)" opacity="0.7" style={{ transition: 'fill 0.3s ease' }} />
                                    <path d="M165,15 Q165,20 170,20 Q165,20 165,25 Q165,20 160,20 Q165,20 165,15 Z" fill="var(--ll-highlight)" opacity="0.7" style={{ transition: 'fill 0.3s ease' }} />
                                </svg>
                                <div style={{ zIndex: 1 }}>
                                    <p style={{ fontSize: 13, color: '#FFF', opacity: 0.85, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 6, fontWeight: 700 }}>Good morning</p>
                                    <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 42, fontWeight: 700, color: '#FFFDF9', margin: '0 0 6px', lineHeight: 1.1 }}>
                                        {userName.split(' ')[0]},<br />you're looking well.
                                    </h2>
                                    <p style={{ fontSize: 15, color: '#FFF', opacity: 0.75, marginBottom: 20, fontWeight: 500 }}>Your health matrix is active and fully synced.</p>
                                    <div style={{ display: 'flex', gap: 10 }}>
                                        <button className="ll-btn-primary" style={{ background: 'var(--ll-sidebar)', color: '#FFFDF9', fontSize: 13, transition: 'background 0.3s ease' }} onClick={() => setActiveTab('diagnostics')}>
                                            Run AI Diagnostic →
                                        </button>
                                        <button className="ll-btn-ghost" style={{ borderColor: 'rgba(255,255,255,0.4)', color: '#FFFDF9', fontSize: 13 }} onClick={() => setActiveTab('emergency')}>
                                            Emergency Beacon
                                        </button>
                                    </div>
                                </div>
                                <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', gap: 10, flexShrink: 0 }}>
                                    {[
                                        { label: 'Active Consents', value: activeConsents.length, bg: 'rgba(255,255,255,.1)', color: 'var(--ll-soft)' },
                                        { label: 'Records', value: myReports.length, bg: 'rgba(255,255,255,.1)', color: 'var(--ll-soft)' },
                                        { label: 'Diagnostics', value: pastAnalyses.length, bg: 'rgba(255,255,255,.1)', color: 'var(--ll-soft)' },
                                    ].map((s, i) => (
                                        <div key={i} style={{ background: s.bg, borderRadius: 16, padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 10, border: '1px solid rgba(255,255,255,.15)' }}>
                                            <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 700, color: '#FFFDF9', lineHeight: 1 }}>{s.value}</span>
                                            <span style={{ fontSize: 11, color: '#FFF', opacity: 0.75 }}>{s.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Vitals */}
                            <div className="ll-fadein-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
                                {[
                                    { label: 'Heart Rate', value: '72', unit: 'BPM', bg: '#3D2222', text: '#FFA3A3', labelColor: '#D9A7A7', statusBg: 'rgba(255, 163, 163, 0.1)', statusColor: '#FFA3A3', status: 'Normal', emoji: '❤️' },
                                    { label: 'SpO₂', value: '98', unit: '%', bg: '#1C3024', text: '#8CF2A5', labelColor: '#A7D4B2', statusBg: 'rgba(140, 242, 165, 0.1)', statusColor: '#8CF2A5', status: 'Optimal', emoji: '💧' },
                                    { label: 'Temperature', value: '37.1', unit: '°C', bg: '#3A2E1A', text: '#F2D88C', labelColor: '#DCD0A7', statusBg: 'rgba(242, 216, 140, 0.1)', statusColor: '#F2D88C', status: 'Stable', emoji: '🌡️' },
                                    { label: 'Blood Press', value: '118', unit: 'mmHg', bg: '#2A1F3D', text: '#D0B8F2', labelColor: '#CFA7D4', statusBg: 'rgba(208, 184, 242, 0.1)', statusColor: '#D0B8F2', status: 'Normal', emoji: '🩺' },
                                ].map((v, i) => (
                                    <div key={i} className="ll-stat-card" style={{ background: v.bg, border: 'none' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                                            <span style={{ fontSize: 22 }}>{v.emoji}</span>
                                            <span className="ll-badge" style={{ background: v.statusBg, color: v.statusColor }}>{v.status}</span>
                                        </div>
                                        <p style={{ fontSize: 12, color: v.labelColor, textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 4, fontWeight: 700 }}>{v.label}</p>
                                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                                            <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 40, fontWeight: 700, color: v.text, lineHeight: 1 }}>{v.value}</span>
                                            <span style={{ fontSize: 13, color: v.labelColor, fontWeight: 600 }}>{v.unit}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Quick Actions Grid */}
                            <div className="ll-fadein-2">
                                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--ll-text)', marginBottom: 14 }}>Quick Actions</p>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                                    {([
                                        { icon: '💬', title: 'AI Health Chat', subtitle: 'Chat with LLaMA assistant', onClick: () => setActiveTab('chat') },
                                        { icon: '🚨', title: 'Emergency Beacon', subtitle: 'Offline QR & info', onClick: () => setActiveTab('emergency') },
                                        { icon: '📋', title: 'Health Records', subtitle: 'View secure IPFS files', onClick: () => setActiveTab('records') },
                                        { icon: '🛡️', title: 'Consent Manager', subtitle: 'Control record access', onClick: () => setActiveTab('consent') }
                                    ] as { icon: string; title: string; subtitle: string; onClick?: () => void; href?: string }[]).map((action, i) => {
                                        const cardContent = (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start', textAlign: 'left' }}>
                                                <span style={{ fontSize: 24, marginBottom: 4 }}>{action.icon}</span>
                                                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ll-text)' }}>{action.title}</span>
                                                <span style={{ fontSize: 11, color: 'var(--ll-text-muted)' }}>{action.subtitle}</span>
                                            </div>
                                        );

                                        if (action.href) {
                                            return (
                                                <Link 
                                                    key={i} 
                                                    href={action.href}
                                                    className="ll-card"
                                                    style={{ padding: 20, textDecoration: 'none', cursor: 'pointer', display: 'block' }}
                                                >
                                                    {cardContent}
                                                </Link>
                                            );
                                        }

                                        return (
                                            <div 
                                                key={i} 
                                                className="ll-card" 
                                                onClick={action.onClick}
                                                style={{ padding: 20, cursor: 'pointer' }}
                                            >
                                                {cardContent}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* ECG + Activity */}
                            <div className="ll-fadein-2" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
                                <div className="ll-card" style={{ padding: 24, background: 'var(--ll-card-bg)', border: '1.5px solid var(--ll-card-border)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                                        <div>
                                            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--ll-text)' }}>AI Health Score & Vitals Matrix</p>
                                            <p style={{ fontSize: 11, color: 'var(--ll-text-muted)', marginTop: 2 }}>Calculated by LifeLink AI · Real-time</p>
                                        </div>
                                        <span className="ll-badge" style={{ background: 'rgba(var(--ll-accent-rgb), 0.12)', color: 'var(--ll-accent)' }}>94% Optimal</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
                                        {/* Score circle */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                            <div style={{
                                                width: 64, height: 64, borderRadius: '50%',
                                                background: 'conic-gradient(var(--ll-primary) 94%, var(--ll-card-border) 0%)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                position: 'relative'
                                            }}>
                                                <div style={{
                                                    width: 52, height: 52, borderRadius: '50%',
                                                    background: 'var(--ll-card-bg)', display: 'flex', alignItems: 'center',
                                                    justifyContent: 'center', flexDirection: 'column'
                                                }}>
                                                    <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--ll-text)', lineHeight: 1 }}>94</span>
                                                    <span style={{ fontSize: 8, color: 'var(--ll-text-muted)', fontWeight: 600 }}>SCORE</span>
                                                </div>
                                            </div>
                                            <div>
                                                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ll-text)' }}>Excellent Health</p>
                                                <p style={{ fontSize: 11, color: 'var(--ll-text-muted)', marginTop: 2 }}>+2% improvement since last check</p>
                                            </div>
                                        </div>

                                        {/* Mini trend line */}
                                        <div style={{ flex: 1, minWidth: 150 }}>
                                            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--ll-text-muted)', marginBottom: 6 }}>7-Day Vitals Consistency</p>
                                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 40, paddingTop: 4 }}>
                                                {[65, 78, 72, 85, 90, 88, 94].map((h, i) => (
                                                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                                                        <div style={{
                                                            width: '100%',
                                                            height: `${(h / 100) * 30}px`,
                                                            background: i === 6 ? 'var(--ll-primary)' : 'var(--ll-card-border)',
                                                            borderRadius: 4,
                                                            opacity: i === 6 ? 1 : 0.7,
                                                            transition: 'height 0.5s ease'
                                                        }} title={`Day ${i+1}: ${h}%`} />
                                                        <span style={{ fontSize: 8, color: 'var(--ll-text-muted)', fontWeight: 500 }}>
                                                            {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="ll-card" style={{ padding: 24, background: 'var(--ll-card-bg)', border: '1.5px solid var(--ll-card-border)' }}>
                                    <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--ll-text)', marginBottom: 16 }}>This Month</p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                        {[
                                            { label: 'Active Consents', value: activeConsents.length, bar: Math.min(100, activeConsents.length * 20) || 5, color: 'var(--ll-primary)' },
                                            { label: 'Records uploaded', value: myReports.length, bar: Math.min(100, myReports.length * 10) || 5, color: 'var(--ll-accent)' },
                                            { label: 'Diagnostics run', value: pastAnalyses.length, bar: Math.min(100, pastAnalyses.length * 5) || 5, color: 'var(--ll-highlight)' },
                                        ].map((s, i) => (
                                            <div key={i}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                                    <span style={{ fontSize: 11, color: 'var(--ll-text-muted)', fontWeight: 500 }}>{s.label}</span>
                                                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ll-text)' }}>{s.value}</span>
                                                </div>
                                                <div style={{ height: 8, borderRadius: 100, background: 'rgba(var(--ll-accent-rgb), 0.1)' }}>
                                                    <div style={{ height: '100%', borderRadius: 100, background: s.color, width: `${s.bar}%`, transition: 'width .8s cubic-bezier(.22,1,.36,1)' }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Recent activity */}
                            <div className="ll-card ll-fadein-3" style={{ padding: 24, background: 'var(--ll-card-bg)', border: '1.5px solid var(--ll-card-border)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                                    <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: 'var(--ll-text)' }}>Recent Activity</p>
                                    <button onClick={() => setActiveTab('records')} style={{ fontSize: 13, color: 'var(--ll-primary)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>View all →</button>
                                </div>
                                {(() => {
                                    const acts: { emoji: string; title: string; sub: string; time: string; ts: number; bg: string }[] = []
                                    myReports.forEach(r => acts.push({ emoji: '📄', title: `${r.fileName || 'Report'} uploaded`, sub: r.ipfsCid ? `IPFS · ${r.ipfsCid.slice(0, 8)}…` : 'Local', time: new Date(r.uploadedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), ts: new Date(r.uploadedAt).getTime(), bg: '#D4C5E8' }))
                                    pastAnalyses.forEach(a => acts.push({ emoji: '🤖', title: 'AI diagnostic completed', sub: `Risk: ${a.riskLevel}`, time: new Date(a.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), ts: new Date(a.createdAt).getTime(), bg: '#C8DFCC' }))
                                    consentLogs.forEach(c => {
                                        const doctorDisplay = c.doctorName || c.doctorEmail || 'Unknown Doctor';
                                        let title = 'Consent event';
                                        let bg = 'var(--ll-accent)';
                                        let emoji = '⛓️';
                                        
                                        if (c.action === 'access_granted') {
                                            title = 'Access granted';
                                            bg = '#F5E6C8';
                                            emoji = '🔓';
                                        } else if (c.action === 'access_revoked') {
                                            title = 'Access revoked';
                                            bg = '#F2C4C4';
                                            emoji = '🔒';
                                        } else if (c.action === 'record_viewed') {
                                            title = 'Record viewed';
                                            bg = '#C4D8F2';
                                            emoji = '👁️';
                                        }
                                        
                                        acts.push({
                                            emoji,
                                            title,
                                            sub: `Doctor: ${doctorDisplay}`,
                                            time: new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
                                            ts: new Date(c.createdAt).getTime(),
                                            bg
                                        });
                                    })
                                    acts.sort((a, b) => b.ts - a.ts)
                                    const recent = acts.slice(0, 4)
                                    if (!recent.length) return <p style={{ fontSize: 13, color: '#ABA9B8', fontFamily: "'DM Sans', sans-serif" }}>No recent activity.</p>
                                    return recent.map((a, i) => (
                                        <div key={i} className="ll-row">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <div style={{ width: 36, height: 36, borderRadius: 10, background: a.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{a.emoji}</div>
                                                <div>
                                                    <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 700, color: '#F0E5D8' }}>{a.title}</p>
                                                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#A39D95', marginTop: 3 }}>{a.sub}</p>
                                                </div>
                                            </div>
                                            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#A39D95', fontWeight: 600, flexShrink: 0 }}>{a.time}</span>
                                        </div>
                                    ))
                                })()}
                            </div>
                        </div>
                    )}

                    {/* ══ HEALTH RECORDS ══ */}
                    {!isDoctor && activeTab === 'records' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                            <div className="ll-fadein" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                                <div>
                                    <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 700, color: '#1A1A2E', margin: 0 }}>Health Records</h2>
                                    <p style={{ fontSize: 12, color: '#ABA9B8', marginTop: 4 }}>{myReports.length} files · Stored on IPFS</p>
                                </div>
                                <div>
                                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf,.jpg,.jpeg,.png,.dcm" style={{ display: 'none' }} />
                                    <button className="ll-btn-primary" onClick={() => fileInputRef.current?.click()} disabled={uploadingFile}>
                                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                                        {uploadingFile ? 'Uploading…' : 'Upload record'}
                                    </button>
                                </div>
                            </div>

                            {uploadError && (
                                <div style={{ background: '#FEE', border: '1.5px solid #F2C4C4', borderRadius: 12, padding: '10px 14px' }}>
                                    <p style={{ fontSize: 12, color: '#B94B4B', margin: 0 }}>{uploadError}</p>
                                </div>
                            )}

                            <div className="ll-card ll-fadein-1" style={{ overflow: 'hidden', padding: 0 }}>
                                {myReports.length === 0 && (
                                    <div style={{ padding: 48, textAlign: 'center' }}>
                                        <span style={{ fontSize: 36 }}>📭</span>
                                        <p style={{ fontSize: 13, color: '#ABA9B8', marginTop: 12 }}>No records yet. Upload your first medical report!</p>
                                    </div>
                                )}
                                {myReports.map((r, i) => {
                                    const bg = r.reportType === 'Scan' ? '#C8DFCC' : r.reportType === 'Prescription' ? '#F5E6C8' : '#D4C5E8'
                                    const sizeStr = r.fileSize > 1024 * 1024 ? `${(r.fileSize / (1024 * 1024)).toFixed(1)} MB` : `${(r.fileSize / 1024).toFixed(0)} KB`
                                    return (
                                        <div key={r.id} className="ll-row" style={{ padding: '14px 20px', borderBottom: i < myReports.length - 1 ? '1.5px solid #F4F1EC' : 'none', borderRadius: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
                                                <div style={{ width: 40, height: 40, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#1A1A2E" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                </div>
                                                <div style={{ minWidth: 0 }}>
                                                    <p style={{ fontSize: 13, fontWeight: 500, color: '#1A1A2E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.fileName}</p>
                                                    <p style={{ fontSize: 11, color: '#ABA9B8', marginTop: 2, fontFamily: 'monospace' }}>{r.ipfsCid ? `${r.ipfsCid.slice(0, 6)}…${r.ipfsCid.slice(-4)}` : 'local'} · {sizeStr}</p>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                                                <span className="ll-badge" style={{ background: bg, color: '#1A1A2E' }}>{r.reportType}</span>
                                                <span style={{ fontSize: 11, color: '#ABA9B8' }}>{new Date(r.uploadedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                {r.fileUrl && (
                                                    <a href={r.fileUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#ABA9B8', display: 'flex' }}>
                                                        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* ══ AI DIAGNOSTICS ══ */}
                    {!isDoctor && activeTab === 'diagnostics' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                            <div className="ll-fadein">
                                <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 700, color: '#1A1A2E', margin: 0 }}>AI Diagnostic Engine</h2>
                                <p style={{ fontSize: 12, color: '#ABA9B8', marginTop: 4 }}>Powered by Groq · Results in under 3 seconds</p>
                            </div>

                            <div className="ll-card ll-fadein-1" style={{ padding: 28, background: '#F5E6C8', border: 'none' }}>
                                <p style={{ fontSize: 15, fontWeight: 600, color: '#1A1A2E', marginBottom: 16 }}>Describe your symptoms</p>
                                <textarea
                                    className="ll-input"
                                    placeholder="e.g. 'Mild headache for 2 days, slight fatigue, no fever'"
                                    value={symptomsInput}
                                    onChange={e => setSymptomsInput(e.target.value)}
                                    style={{ minHeight: 100, resize: 'vertical', background: 'rgba(255,255,255,.8)', border: '1.5px solid rgba(26,26,46,.1)' }}
                                />
                                {diagError && <p style={{ fontSize: 12, color: '#B94B4B', marginTop: 8 }}>{diagError}</p>}
                                <button className="ll-btn-primary" style={{ width: '100%', marginTop: 14, borderRadius: 14 }} onClick={runDiagnostic} disabled={diagLoading}>
                                    {diagLoading ? '⏳ Analyzing…' : 'Run AI Diagnostic →'}
                                </button>
                            </div>

                            {diagResult && (
                                <div className="ll-card ll-fadein-1" style={{ padding: 24, borderColor: diagResult.riskLevel === 'EMERGENCY' ? '#F2C4C4' : diagResult.riskLevel === 'MODERATE' ? '#F5E6C8' : '#C8DFCC', borderWidth: 2 }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                                        <div>
                                            <p style={{ fontSize: 14, fontWeight: 600, color: '#1A1A2E', marginBottom: 6 }}>🤖 AI Analysis Result</p>
                                            <p style={{ fontSize: 13, color: '#6B6780', lineHeight: 1.65 }}>{diagResult.aiSummary}</p>
                                        </div>
                                        <span className="ll-badge" style={{
                                            background: diagResult.riskLevel === 'EMERGENCY' ? '#F2C4C4' : diagResult.riskLevel === 'MODERATE' ? '#F5E6C8' : '#C8DFCC',
                                            color: '#1A1A2E', flexShrink: 0,
                                        }}>{diagResult.riskLevel}</span>
                                    </div>
                                    <div style={{ padding: '10px 14px', borderRadius: 10, background: '#F8F5F0', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                                        <span style={{ fontSize: 13 }}>→</span>
                                        <span style={{ fontSize: 12, color: '#6B6780' }}>{diagResult.recommendedAction}</span>
                                    </div>
                                    <p style={{ fontSize: 11, color: '#ABA9B8', marginTop: 10 }}>Confidence: {Math.round(diagResult.confidenceScore * 100)}%</p>
                                </div>
                            )}

                            <div className="ll-fadein-2">
                                <p style={{ fontSize: 14, fontWeight: 600, color: '#1A1A2E', marginBottom: 14 }}>Past results</p>
                                {pastAnalyses.length === 0 && <p style={{ fontSize: 12, color: '#ABA9B8' }}>No past analyses yet. Run your first diagnostic above!</p>}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {pastAnalyses.map(d => {
                                        const bg = d.riskLevel === 'EMERGENCY' ? '#F2C4C4' : d.riskLevel === 'MODERATE' ? '#F5E6C8' : '#C8DFCC'
                                        return (
                                            <div key={d.id} className="ll-card" style={{ padding: 20 }}>
                                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                                                    <div>
                                                        <p style={{ fontSize: 13, fontWeight: 600, color: '#1A1A2E' }}>{d.aiSummary}</p>
                                                        <p style={{ fontSize: 11, color: '#ABA9B8', marginTop: 3 }}>Symptoms: {d.symptomsInput}</p>
                                                    </div>
                                                    <span className="ll-badge" style={{ background: bg, color: '#1A1A2E', flexShrink: 0 }}>{d.riskLevel}</span>
                                                </div>
                                                <div style={{ padding: '8px 12px', borderRadius: 8, background: '#F8F5F0', fontSize: 12, color: '#6B6780' }}>→ {d.recommendedAction}</div>
                                                <p style={{ fontSize: 11, color: '#ABA9B8', marginTop: 8 }}>{new Date(d.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ══ EMERGENCY BEACON ══ */}
                    {!isDoctor && activeTab === 'emergency' && (() => {
                        const ed = {
                            name: userName,
                            bloodGroup: user?.patient?.bloodGroup || 'Not set',
                            allergies: user?.patient?.allergies || 'None listed',
                            emergencyContact: user?.patient?.emergencyContact || 'Not set',
                            conditions: 'None listed',
                            medications: 'None listed',
                        }

                        return (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                <div className="ll-fadein">
                                    <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 700, color: '#1A1A2E', margin: 0 }}>Emergency Beacon</h2>
                                    <p style={{ fontSize: 12, color: '#ABA9B8', marginTop: 4 }}>Scannable without login · Always accessible</p>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.3fr 1.3fr', gap: 20 }}>
                                    {/* Section 1: Offline QR Code */}
                                    <div className="ll-card ll-fadein-1" style={{ padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 100, background: '#F2C4C4', marginBottom: 20, width: 'fit-content' }}>
                                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#E05454', display: 'inline-block', animation: 'pulseGreen 1.5s ease-in-out infinite' }} />
                                                <span style={{ fontSize: 11, fontWeight: 700, color: '#B94B4B', textTransform: 'uppercase', letterSpacing: '.08em' }}>Offline QR Active</span>
                                            </div>
                                            <div className="ll-qr-float">
                                                <div style={{ width: 180, height: 180, borderRadius: 20, background: '#fff', padding: 10, boxShadow: '0 12px 40px rgba(0,0,0,.1)', border: '2px solid #F0EDE8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <canvas ref={qrCanvasRef} style={{ width: '100%', height: '100%', borderRadius: 12 }} />
                                                </div>
                                            </div>
                                            <p style={{ fontSize: 11, color: '#ABA9B8', marginTop: 14, textAlign: 'center', lineHeight: 1.5 }}>
                                                Generated locally on device.<br />Responders scan this to view medical details.
                                            </p>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', marginTop: 12 }}>
                                            <button className="ll-btn-ghost" style={{ width: '100%', borderRadius: 14, padding: '8px 0', fontSize: 11 }} onClick={downloadQR}>
                                                📥 Save to Device
                                            </button>
                                            <button className="ll-btn-ghost" style={{ width: '100%', borderRadius: 14, padding: '8px 0', fontSize: 11 }} onClick={shareQROffline}>
                                                🔗 Share QR Code
                                            </button>
                                            {(() => {
                                                const smsBody = encodeURIComponent(`LIFELINK EMERGENCY! Patient: ${userName}. Blood: ${ed.bloodGroup}. Allergies: ${ed.allergies}. Emergency Contact: ${ed.emergencyContact}. GPS Location: ${userLocation ? `${userLocation.lat.toFixed(6)}, ${userLocation.lon.toFixed(6)}` : 'Unknown'}. Please scan my emergency QR when you arrive: http://localhost:3000/emergency/scan?id=${user?.patient?.id || ''}`)
                                                return (
                                                    <a href={`sms:${ed.emergencyContact}?body=${smsBody}`} className="ll-btn-primary" style={{ width: '100%', borderRadius: 14, padding: '8px 0', fontSize: 11, textDecoration: 'none', textAlign: 'center' }}>
                                                        💬 Send SMS Alert
                                                    </a>
                                                )
                                            })()}
                                        </div>
                                    </div>

                                    {/* Section 2: Patient Info */}
                                    <div className="ll-fadein-2" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        {[
                                            { label: 'Blood Group', value: ed.bloodGroup, emoji: '🩸', bg: '#F2C4C4' },
                                            { label: 'Allergies', value: ed.allergies, emoji: '⚠️', bg: '#F5E6C8' },
                                            { label: 'Emergency Contact', value: ed.emergencyContact, emoji: '📞', bg: '#C8DFCC' },
                                            { label: 'Conditions', value: ed.conditions, emoji: '🫁', bg: '#D4C5E8' },
                                            { label: 'Medications', value: ed.medications, emoji: '💊', bg: '#C4D8F2' },
                                        ].map((info, i) => (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 14, background: '#fff', border: '1.5px solid #F0EDE8' }}>
                                                <div style={{ width: 34, height: 34, borderRadius: 10, background: info.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{info.emoji}</div>
                                                <div style={{ minWidth: 0, flex: 1 }}>
                                                    <p style={{ fontSize: 9, color: '#ABA9B8', textTransform: 'uppercase', letterSpacing: '.07em', margin: 0 }}>{info.label}</p>
                                                    <p style={{ fontSize: 13, fontWeight: 600, color: '#1A1A2E', marginTop: 1, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{info.value}</p>
                                                </div>
                                            </div>
                                        ))}
                                        <button className="ll-btn-primary" style={{ width: '100%', borderRadius: 14, marginTop: 4 }} onClick={() => setShowEditModal(true)}>
                                            Update Emergency Info →
                                        </button>
                                    </div>

                                    {/* Section 3: Nearest Clinics (Offline Geolocation) */}
                                    <div className="ll-card ll-fadein-3" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14, background: 'var(--ll-sidebar)' }}>
                                        <div>
                                            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--ll-text)', margin: 0 }}>Nearest ERs (Offline Maps)</p>
                                            <p style={{ fontSize: 11, color: 'var(--ll-text-muted)', marginTop: 4, margin: 0 }}>No internet needed · GPS & voice calls active</p>
                                        </div>

                                        {locationError && (
                                            <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 10, padding: '8px 10px' }}>
                                                <p style={{ fontSize: 10, color: '#F87171', margin: 0 }}>{locationError}</p>
                                            </div>
                                        )}

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto', flex: 1, maxHeight: 280 }}>
                                            {nearestDoctors.length === 0 ? (
                                                <p style={{ fontSize: 11, color: 'var(--ll-text-muted)' }}>Locating nearest emergency responders…</p>
                                            ) : (
                                                nearestDoctors.slice(0, 3).map((doc, idx) => (
                                                    <div key={idx} style={{
                                                        padding: 10, borderRadius: 12, background: 'var(--ll-card-bg)',
                                                        border: '1.5px solid var(--ll-card-border)', display: 'flex',
                                                        flexDirection: 'column', gap: 6, transition: 'all 0.2s'
                                                    }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 4 }}>
                                                            <div style={{ minWidth: 0, flex: 1 }}>
                                                                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ll-text)', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{doc.name}</p>
                                                                <p style={{ fontSize: 9, color: 'var(--ll-text-muted)', marginTop: 2, margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{doc.address}</p>
                                                                <p style={{ fontSize: 9, color: 'var(--ll-text-muted)', fontFamily: 'monospace', margin: '2px 0 0' }}>Lat: {doc.lat.toFixed(4)}, Lon: {doc.lon.toFixed(4)}</p>
                                                            </div>
                                                            <span className="ll-badge" style={{ background: '#E6FAF5', color: '#3ECFAA', flexShrink: 0, fontSize: 9, padding: '2px 6px' }}>
                                                                {doc.distance !== null ? `${doc.distance.toFixed(1)} km` : 'Registry'}
                                                            </span>
                                                        </div>
                                                        <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
                                                            <a href={`tel:${doc.phone}`} className="ll-btn-primary" style={{
                                                                flex: 1, padding: '6px 0', fontSize: 11,
                                                                borderRadius: 8, textDecoration: 'none', textAlign: 'center',
                                                                display: 'block'
                                                            }}>
                                                                📞 Call
                                                            </a>
                                                            <a href={`https://www.google.com/maps/dir/?api=1&destination=${doc.lat},${doc.lon}`} target="_blank" rel="noopener noreferrer" className="ll-btn-ghost" style={{
                                                                flex: 1, padding: '6px 0', fontSize: 11,
                                                                borderRadius: 8, textDecoration: 'none', textAlign: 'center',
                                                                display: 'block', paddingLeft: 4, paddingRight: 4
                                                             }}>
                                                                🗺️ Maps
                                                            </a>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                        
                                        <button className="ll-btn-ghost" style={{ width: '100%', padding: '8px 0', fontSize: 11, borderRadius: 10 }} onClick={detectLocationAndNearestDoctors}>
                                            🔄 Refresh Nearest ERs
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })()}

                    {/* ══ CONSENT LOGS ══ */}
                    {!isDoctor && activeTab === 'consent' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                            <div className="ll-fadein">
                                <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 700, color: 'var(--ll-text)', margin: 0 }}>Consent Management</h2>
                                <p style={{ fontSize: 12, color: 'var(--ll-text-muted)', marginTop: 4 }}>Control who can access your medical records in real-time</p>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }}>
                                {/* Left Column: Registry & Controls */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                    
                                    {/* Who Has Access */}
                                    <div className="ll-card ll-fadein-1" style={{ overflow: 'hidden', padding: 0 }}>
                                        <div style={{ padding: '16px 20px', borderBottom: '1.5px solid var(--ll-card-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--ll-text)', margin: 0 }}>Who Has Access</p>
                                            <span className="ll-badge" style={{ background: 'var(--ll-primary)', color: '#fff' }}>{activeConsents.length}</span>
                                        </div>
                                        {activeConsents.length === 0 && (
                                            <div style={{ padding: '32px', textAlign: 'center' }}>
                                                <span style={{ fontSize: 32 }}>🔒</span>
                                                <p style={{ fontSize: 12, color: 'var(--ll-text-muted)', marginTop: 10, marginBottom: 0 }}>No active access grants. Add a doctor below.</p>
                                            </div>
                                        )}
                                        {activeConsents.map((c, i) => (
                                            <div key={c.id} className="ll-row" style={{ padding: '14px 20px', borderBottom: i < activeConsents.length - 1 ? '1.5px solid var(--ll-card-border)' : 'none', borderRadius: 0 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
                                                    <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#C8DFCC,#D4C5E8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#1A1A2E', flexShrink: 0 }}>DR</div>
                                                    <div style={{ minWidth: 0, flex: 1 }}>
                                                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ll-text)', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{c.doctorName || 'General Practitioner'}</p>
                                                        <p style={{ fontSize: 11, color: 'var(--ll-text-muted)', margin: '2px 0 0', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{c.doctorEmail}</p>
                                                        <span className="ll-badge" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6', marginTop: 6, display: 'inline-block', fontSize: 10 }}>{formatDate(c.expiresAt)}</span>
                                                    </div>
                                                </div>
                                                <button className="ll-btn-ghost" style={{ padding: '6px 12px', fontSize: 12, color: '#EF4444', borderColor: 'rgba(239,68,68,0.2)', flexShrink: 0 }} onClick={() => handleRevokeConsent(c.id)} disabled={consentLoading}>
                                                    Revoke
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Grant New Access */}
                                    <div className="ll-card ll-fadein-2" style={{ padding: 24 }}>
                                        <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--ll-text)', marginBottom: 16, marginTop: 0 }}>Grant new access</p>
                                        <form onSubmit={handleGrantConsent} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                            <div>
                                                <label style={{ fontSize: 11, color: 'var(--ll-text-muted)', textTransform: 'uppercase', letterSpacing: '.07em', fontWeight: 600, display: 'block', marginBottom: 6 }}>Doctor Email *</label>
                                                <input className="ll-input" required type="email" placeholder="doctor@hospital.com" value={doctorEmail} onChange={e => setDoctorEmail(e.target.value)} />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: 11, color: 'var(--ll-text-muted)', textTransform: 'uppercase', letterSpacing: '.07em', fontWeight: 600, display: 'block', marginBottom: 6 }}>Doctor Name (Optional)</label>
                                                <input className="ll-input" type="text" placeholder="Dr. Rajesh Sharma" value={doctorName} onChange={e => setDoctorName(e.target.value)} />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: 11, color: 'var(--ll-text-muted)', textTransform: 'uppercase', letterSpacing: '.07em', fontWeight: 600, display: 'block', marginBottom: 6 }}>Access Expiry Date (Optional)</label>
                                                <input className="ll-input" type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} min={new Date().toISOString().split('T')[0]} />
                                            </div>
                                            
                                            {successMessage && (
                                                <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1.5px solid rgba(16, 185, 129, 0.2)', borderRadius: 12, padding: '10px 14px' }}>
                                                    <p style={{ fontSize: 12, color: '#10B981', margin: 0, fontWeight: 600 }}>{successMessage}</p>
                                                </div>
                                            )}
                                            {consentError && (
                                                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1.5px solid rgba(239, 68, 68, 0.2)', borderRadius: 12, padding: '10px 14px' }}>
                                                    <p style={{ fontSize: 12, color: '#EF4444', margin: 0, fontWeight: 600 }}>{consentError}</p>
                                                </div>
                                            )}

                                            <button type="submit" className="ll-btn-primary" style={{ width: '100%', marginTop: 8, borderRadius: 14 }} disabled={consentLoading}>
                                                {consentLoading ? 'Granting Access...' : 'Grant Access →'}
                                            </button>
                                        </form>
                                    </div>
                                </div>

                                {/* Right Column: Visualizer Map & Audit logs */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                    {/* Interactive SVG Network Map */}
                                    <div className="ll-card ll-fadein-1" style={{ padding: 24, display: 'flex', flexDirection: 'column', height: '100%', minHeight: '380px', justifyContent: 'space-between' }}>
                                        <div>
                                            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--ll-text)', margin: '0 0 4px' }}>Consent Network Map</p>
                                            <p style={{ fontSize: 11, color: 'var(--ll-text-muted)', margin: '0 0 16px' }}>Real-time smart contract authority graph</p>
                                        </div>
                                        
                                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.15)', borderRadius: 16, border: '1px solid var(--ll-card-border)', position: 'relative', overflow: 'hidden' }}>
                                            <svg width="100%" height="280" viewBox="0 0 300 280">
                                                {/* Center Node: Patient */}
                                                <circle cx="150" cy="140" r="28" fill="var(--ll-primary)" style={{ filter: 'drop-shadow(0 0 12px var(--ll-primary))' }} />
                                                <text x="150" y="143" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="bold">PATIENT</text>
                                                
                                                {activeConsents.length === 0 ? (
                                                    // Locked shield if no active doctor
                                                    <g>
                                                        <circle cx="150" cy="140" r="50" fill="none" stroke="rgba(239, 68, 68, 0.2)" strokeWidth="1.5" strokeDasharray="4 4" />
                                                        <text x="150" y="210" textAnchor="middle" fill="#ef4444" fontSize="11" fontWeight="700">🔒 Vault Secured</text>
                                                    </g>
                                                ) : (
                                                    activeConsents.map((c, idx) => {
                                                        const angle = (idx * 2 * Math.PI) / activeConsents.length
                                                        const rx = 90
                                                        const ry = 80
                                                        const dx = 150 + rx * Math.cos(angle)
                                                        const dy = 140 + ry * Math.sin(angle)
                                                        const docId = (c.doctorName || c.doctorEmail || '').slice(0, 4).toUpperCase()

                                                        return (
                                                            <g key={idx}>
                                                                {/* Glowing link path */}
                                                                <line x1="150" y1="140" x2={dx} y2={dy} stroke="var(--ll-primary)" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />
                                                                
                                                                {/* Pulsing signal dot travelling from patient to doctor */}
                                                                <circle r="3.5" fill="#3ECFAA">
                                                                    <animateMotion dur="2s" repeatCount="indefinite" path={`M 150 140 L ${dx} ${dy}`} />
                                                                </circle>

                                                                {/* Doctor Node */}
                                                                <circle cx={dx} cy={dy} r="20" fill="var(--ll-card-bg)" stroke="var(--ll-accent)" strokeWidth="2" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))' }} />
                                                                <text x={dx} y={dy + 3} textAnchor="middle" fill="var(--ll-text)" fontSize="8" fontWeight="bold">DR-{docId}</text>
                                                            </g>
                                                        )
                                                    })
                                                )}
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Audit Trail */}
                                    <div className="ll-card ll-fadein-3" style={{ padding: 24 }}>
                                        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--ll-text)', marginBottom: 16, marginTop: 0 }}>Audit trail</p>
                                        {consentLogs.length === 0 && <p style={{ fontSize: 12, color: 'var(--ll-text-muted)', margin: 0 }}>No transactions recorded yet.</p>}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 300, overflowY: 'auto', paddingRight: 4 }}>
                                            {consentLogs.map((log, i) => {
                                                const doctorDisplay = log.doctorName || log.doctorEmail || 'Unknown';
                                                return (
                                                    <div key={log.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 12, background: 'var(--ll-sidebar)', border: '1.5px solid var(--ll-card-border)' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                                                            <span style={{ fontSize: 16, flexShrink: 0 }}>{getActionIcon(log.action)}</span>
                                                            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ll-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>
                                                                <strong>{doctorDisplay}</strong> {getActionText(log.action)}
                                                            </span>
                                                        </div>
                                                        <span style={{ fontSize: 11, color: 'var(--ll-text-muted)', flexShrink: 0 }}>{formatTime(log.createdAt)}</span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ══ AI CHAT ══ */}
                    {!isDoctor && activeTab === 'chat' && (
                        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 160px)', gap: 0 }}>
                            <div className="ll-fadein" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 44, height: 44, borderRadius: 14, background: '#1A1A2E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🤖</div>
                                    <div>
                                        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: '#1A1A2E', margin: 0 }}>AI Health Assistant</h2>
                                        <p style={{ fontSize: 12, color: '#ABA9B8', marginTop: 2 }}>Describe symptoms · Get instant guidance</p>
                                    </div>
                                </div>
                                {chatMessages.length > 0 && (
                                    <button className="ll-btn-ghost" style={{ fontSize: 12, padding: '8px 16px' }} onClick={() => { setChatMessages([]); setChatHistory([]) }}>New chat</button>
                                )}
                            </div>

                            {/* Messages */}
                            <div id="chat-messages" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, paddingRight: 4 }}>
                                {chatMessages.length === 0 && (
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, paddingTop: 60 }}>
                                        <div style={{ width: 64, height: 64, borderRadius: 20, background: '#F5E6C8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30 }}>💬</div>
                                        <div style={{ textAlign: 'center' }}>
                                            <p style={{ fontSize: 15, fontWeight: 600, color: '#1A1A2E' }}>Start a conversation</p>
                                            <p style={{ fontSize: 13, color: '#ABA9B8', marginTop: 4, maxWidth: 280 }}>Tell me your symptoms and I'll help you understand what might be going on.</p>
                                        </div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                                            {['I have a fever', 'My head hurts', 'Stomach pain', 'Feeling dizzy'].map((q, i) => (
                                                <button key={i} className="ll-btn-ghost" style={{ fontSize: 12, padding: '8px 16px' }} onClick={() => setChatInput(q)}>{q}</button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {chatMessages.map((msg, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                                        <div style={{
                                            maxWidth: '78%', padding: '12px 16px', borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                            background: msg.role === 'user' ? '#1A1A2E' : '#fff',
                                            border: msg.role === 'user' ? 'none' : '1.5px solid #F0EDE8',
                                            boxShadow: '0 2px 12px rgba(0,0,0,.05)',
                                        }}>
                                            <p style={{ fontSize: 13, color: msg.role === 'user' ? '#fff' : '#1A1A2E', lineHeight: 1.65, whiteSpace: 'pre-wrap', margin: 0 }}>{msg.content}</p>
                                        </div>
                                    </div>
                                ))}
                                {chatLoading && (
                                    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                                        <div style={{ padding: '14px 18px', borderRadius: '18px 18px 18px 4px', background: '#fff', border: '1.5px solid #F0EDE8', display: 'flex', gap: 6, alignItems: 'center' }}>
                                            {[0, .2, .4].map((d, i) => (
                                                <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: '#C8DFCC', animation: `dotPulse 1.4s ease-in-out ${d}s infinite` }} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Input */}
                            <div style={{ marginTop: 16 }}>
                                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, padding: '10px 10px 10px 16px', borderRadius: 18, background: '#fff', border: '1.5px solid #E8E4DC', boxShadow: '0 2px 12px rgba(0,0,0,.04)' }}>
                                    <textarea
                                        value={chatInput}
                                        onChange={e => setChatInput(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessage() } }}
                                        placeholder="Describe your symptoms…"
                                        rows={1}
                                        style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontFamily: 'inherit', fontSize: 13, color: '#1A1A2E', resize: 'none', maxHeight: 120, padding: '4px 0' }}
                                    />
                                    <button
                                        onClick={sendChatMessage}
                                        disabled={chatLoading || !chatInput.trim()}
                                        style={{
                                            width: 38, height: 38, borderRadius: 12, border: 'none',
                                            background: chatInput.trim() ? '#1A1A2E' : '#F4F1EC',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            cursor: chatInput.trim() && !chatLoading ? 'pointer' : 'not-allowed',
                                            flexShrink: 0, transition: 'background .15s',
                                        }}
                                    >
                                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={chatInput.trim() ? '#fff' : '#ABA9B8'} strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" /></svg>
                                    </button>
                                </div>
                                <p style={{ fontSize: 11, color: '#ABA9B8', textAlign: 'center', marginTop: 8 }}>AI assistant · Not a substitute for professional medical advice</p>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* ─── PROFILE EDIT MODAL ─── */}
            {showEditModal && (
                <div className="ll-popin" style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(26,26,46,.4)', backdropFilter: 'blur(8px)' }}>
                    <div style={{ background: '#fff', borderRadius: 24, width: '100%', maxWidth: 440, padding: 28, boxShadow: '0 24px 64px rgba(0,0,0,.12)', border: '1.5px solid #F0EDE8' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
                            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: '#1A1A2E', margin: 0 }}>Update Emergency Info</h3>
                            <button onClick={() => setShowEditModal(false)} style={{ background: '#F4F1EC', border: 'none', borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#6B6780" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {[
                                { label: 'Blood Group', key: 'bloodGroup', type: 'select', options: ['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
                                { label: 'Allergies', key: 'allergies', type: 'text', placeholder: 'e.g. Peanuts, Penicillin, None' },
                                { label: 'Emergency Contact', key: 'emergencyContact', type: 'text', placeholder: 'Phone number' },
                                { label: 'Gender', key: 'gender', type: 'select', options: ['', 'Male', 'Female', 'Other', 'Prefer not to say'] },
                                { label: 'Date of Birth', key: 'dob', type: 'date' },
                            ].map(field => (
                                <div key={field.key}>
                                    <label style={{ fontSize: 11, fontWeight: 600, color: '#6B6780', textTransform: 'uppercase', letterSpacing: '.07em', display: 'block', marginBottom: 6 }}>{field.label}</label>
                                    {field.type === 'select' ? (
                                        <select className="ll-input" value={(editForm as any)[field.key]} onChange={e => setEditForm(prev => ({ ...prev, [field.key]: e.target.value }))}>
                                            {(field.options || []).map(o => <option key={o} value={o}>{o || `Select ${field.label}`}</option>)}
                                        </select>
                                    ) : (
                                        <input className="ll-input" type={field.type} placeholder={(field as any).placeholder || ''} value={(editForm as any)[field.key]} onChange={e => setEditForm(prev => ({ ...prev, [field.key]: e.target.value }))} />
                                    )}
                                </div>
                            ))}
                            {consentError && <p style={{ fontSize: 12, color: '#B94B4B' }}>{consentError}</p>}
                            <button type="submit" className="ll-btn-primary" style={{ width: '100%', borderRadius: 14, marginTop: 4 }} disabled={consentLoading}>
                                {consentLoading ? 'Saving…' : 'Save Profile Changes'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}