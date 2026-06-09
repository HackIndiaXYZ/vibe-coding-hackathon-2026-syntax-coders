'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function TriageScanPortal() {
    const searchParams = useSearchParams()
    
    // Read parameters from scanned QR code URL (useful offline)
    const patientId = searchParams.get('id') || ''
    const patientName = searchParams.get('name') || 'Unknown Patient'
    const bloodGroup = searchParams.get('blood') || 'Not set'
    const allergies = searchParams.get('allergies') || 'None listed'
    const emergencyContact = searchParams.get('contact') || 'Not set'

    const [doctors, setDoctors] = useState<any[]>([])
    const [selectedDoctorId, setSelectedDoctorId] = useState('')
    const [reason, setReason] = useState('')
    const [alertStatus, setAlertStatus] = useState<{ type: 'success' | 'error' | '', message: string }>({ type: '', message: '' })
    const [bookingStatus, setBookingStatus] = useState<{ type: 'success' | 'error' | '', message: string }>({ type: '', message: '' })
    const [loadingAlert, setLoadingAlert] = useState(false)
    const [loadingBooking, setLoadingBooking] = useState(false)
    const [isOnline, setIsOnline] = useState(true)

    // Detect offline status
    useEffect(() => {
        setIsOnline(navigator.onLine)
        const handleOnline = () => setIsOnline(true)
        const handleOffline = () => setIsOnline(false)
        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)
        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    // Load available doctors publicly for booking
    useEffect(() => {
        if (!isOnline) return
        fetch('http://localhost:4000/api/emergency/doctors')
            .then(res => res.json())
            .then(data => {
                if (data.doctors) {
                    setDoctors(data.doctors)
                    if (data.doctors.length > 0) {
                        setSelectedDoctorId(data.doctors[0].id)
                    }
                }
            })
            .catch(err => {
                console.error("Failed to load doctors:", err)
            })
    }, [isOnline])

    const handleHospitalAlert = async () => {
        if (!isOnline) {
            setAlertStatus({ type: 'error', message: 'Network offline. Please trigger the cellular SMS alert instead.' })
            return
        }
        setLoadingAlert(true)
        setAlertStatus({ type: '', message: '' })
        try {
            const res = await fetch('http://localhost:4000/api/emergency/public-checkin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ patientId })
            })
            const data = await res.json()
            if (res.ok) {
                setAlertStatus({ type: 'success', message: '🚨 Hospital alerted! On-duty doctors have been notified on their dashboard.' })
            } else {
                setAlertStatus({ type: 'error', message: data.message || 'Failed to trigger emergency check-in.' })
            }
        } catch (error) {
            setAlertStatus({ type: 'error', message: 'Server is unreachable. Please contact the patient\'s emergency phone directly.' })
        } finally {
            setLoadingAlert(false)
        }
    }

    const handleBookAppointment = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!isOnline) {
            setBookingStatus({ type: 'error', message: 'Network offline. Cannot book slot.' })
            return
        }
        if (!selectedDoctorId) {
            setBookingStatus({ type: 'error', message: 'Please select a doctor.' })
            return
        }
        setLoadingBooking(true)
        setBookingStatus({ type: '', message: '' })
        try {
            const res = await fetch('http://localhost:4000/api/emergency/public-appointment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    patientId,
                    doctorId: selectedDoctorId,
                    reason: reason || 'Emergency admission request',
                    scheduledAt: new Date().toISOString()
                })
            })
            const data = await res.json()
            if (res.ok) {
                setBookingStatus({ type: 'success', message: '📅 Admission & slot requested successfully!' })
                setReason('')
            } else {
                setBookingStatus({ type: 'error', message: data.message || 'Failed to book slot.' })
            }
        } catch (error) {
            setBookingStatus({ type: 'error', message: 'Server unreachable. Failed to book appointment.' })
        } finally {
            setLoadingBooking(false)
        }
    }

    // Prefilled SMS for complete offline transmission fallback
    const smsBody = encodeURIComponent(`LIFELINK EMERGENCY ALERT! Patient: ${patientName}. Blood Group: ${bloodGroup}. Allergies: ${allergies}. Emergency Contact: ${emergencyContact}. Scan QR URL: http://localhost:3000/emergency/scan?id=${patientId}`)
    const smsHref = `sms:${emergencyContact}?body=${smsBody}`

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
            color: '#f8fafc',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            padding: '40px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        }}>
            <div style={{ maxWidth: '680px', width: '100%', display: 'flex', flexDirection: 'column', gap: 24 }}>
                
                {/* Header Widget */}
                <div style={{
                    background: 'rgba(30, 41, 59, 0.7)',
                    backdropFilter: 'blur(12px)',
                    border: '1.5px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 24,
                    padding: '30px 24px',
                    textAlign: 'center',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, height: 4,
                        background: 'linear-gradient(90deg, #ef4444 0%, #3b82f6 100%)'
                    }} />
                    
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8 }}>
                        <div style={{
                            width: 12, height: 12, borderRadius: '50%',
                            background: '#ef4444',
                            animation: 'pulse 1.5s ease-in-out infinite'
                        }} />
                        <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.15em', color: '#ef4444' }}>
                            Triage Access Mode
                        </span>
                    </div>
                    
                    <h1 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 8px', fontFamily: 'serif', letterSpacing: '-.02em' }}>LifeLink Emergency Portal</h1>
                    <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>Scan Verified · Medical Summary Access</p>
                </div>

                {/* Offline Warning Banner */}
                {!isOnline && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: 16,
                        padding: '14px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12
                    }}>
                        <span style={{ fontSize: 20 }}>⚠️</span>
                        <div>
                            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#fca5a5' }}>Offline Mode Active</p>
                            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#cbd5e1' }}>You are viewing cached details offline. Online check-in/booking is unavailable. Please call the responder or send the SMS Alert.</p>
                        </div>
                    </div>
                )}

                {/* Patient Summary Card */}
                <div style={{
                    background: 'rgba(30, 41, 59, 0.7)',
                    backdropFilter: 'blur(12px)',
                    border: '1.5px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 24,
                    padding: 24,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
                }}>
                    <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 16px', color: '#cbd5e1', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 10 }}>
                        🧑‍⚕️ Patient Emergency Details
                    </h2>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div style={{ padding: '12px 16px', borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}>
                            <p style={{ margin: 0, fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.05em' }}>Full Name</p>
                            <p style={{ margin: '4px 0 0', fontSize: 16, fontWeight: 700, color: '#fff' }}>{patientName}</p>
                        </div>

                        <div style={{ padding: '12px 16px', borderRadius: 16, background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                            <p style={{ margin: 0, fontSize: 10, color: '#fca5a5', textTransform: 'uppercase', letterSpacing: '.05em' }}>Blood Group</p>
                            <p style={{ margin: '4px 0 0', fontSize: 16, fontWeight: 700, color: '#ef4444' }}>{bloodGroup}</p>
                        </div>

                        <div style={{ padding: '12px 16px', borderRadius: 16, background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.1)', gridColumn: 'span 2' }}>
                            <p style={{ margin: 0, fontSize: 10, color: '#fde047', textTransform: 'uppercase', letterSpacing: '.05em' }}>Known Allergies</p>
                            <p style={{ margin: '4px 0 0', fontSize: 15, fontWeight: 600, color: '#f59e0b' }}>{allergies}</p>
                        </div>

                        <div style={{ padding: '12px 16px', borderRadius: 16, background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.1)', gridColumn: 'span 2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <p style={{ margin: 0, fontSize: 10, color: '#a7f3d0', textTransform: 'uppercase', letterSpacing: '.05em' }}>Emergency Contact Number</p>
                                <p style={{ margin: '4px 0 0', fontSize: 15, fontWeight: 600, color: '#10b981' }}>{emergencyContact}</p>
                            </div>
                            <a href={`tel:${emergencyContact}`} style={{
                                background: '#10b981', color: '#fff', textDecoration: 'none',
                                padding: '8px 16px', borderRadius: 12, fontSize: 12, fontWeight: 700,
                                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)'
                            }}>
                                Call Contact
                            </a>
                        </div>
                    </div>
                </div>

                {/* Actions Section */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    
                    {/* Check-in Card */}
                    <div style={{
                        background: 'rgba(30, 41, 59, 0.7)',
                        backdropFilter: 'blur(12px)',
                        border: '1.5px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: 24,
                        padding: 24,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
                    }}>
                        <div>
                            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 6px', color: '#fff' }}>🚨 Trigger Check-in</h3>
                            <p style={{ fontSize: 12, color: '#94a3b8', margin: '0 0 16px', lineHeight: 1.4 }}>Alert the entire ER response dashboard at the hospital. On-duty doctors can pick up this case immediately.</p>
                        </div>
                        
                        <div>
                            {alertStatus.message && (
                                <p style={{
                                    fontSize: 11, margin: '0 0 12px', padding: 10, borderRadius: 12,
                                    background: alertStatus.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                    color: alertStatus.type === 'success' ? '#a7f3d0' : '#fca5a5',
                                    border: alertStatus.type === 'success' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)'
                                }}>
                                    {alertStatus.message}
                                </p>
                            )}
                            <button
                                onClick={handleHospitalAlert}
                                disabled={loadingAlert || !patientId}
                                style={{
                                    width: '100%', padding: '12px 0', fontSize: 13, fontWeight: 700,
                                    borderRadius: 14, cursor: 'pointer', border: 'none',
                                    background: '#ef4444', color: '#fff',
                                    transition: 'all 0.15s',
                                    boxShadow: '0 6px 20px rgba(239, 68, 68, 0.3)'
                                }}
                            >
                                {loadingAlert ? 'Alerting Hospital...' : 'Notify ER & Alert Doctor'}
                            </button>
                        </div>
                    </div>

                    {/* Book Appointment Card */}
                    <div style={{
                        background: 'rgba(30, 41, 59, 0.7)',
                        backdropFilter: 'blur(12px)',
                        border: '1.5px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: 24,
                        padding: 24,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
                    }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 6px', color: '#fff' }}>📅 Book Admission Slot</h3>
                        <p style={{ fontSize: 12, color: '#94a3b8', margin: '0 0 16px', lineHeight: 1.4 }}>Request a slot with an approved doctor to handle admission setup.</p>
                        
                        <form onSubmit={handleBookAppointment} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <div>
                                <label style={{ fontSize: 10, color: '#94a3b8', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>Select Doctor</label>
                                {doctors.length === 0 ? (
                                    <select disabled style={{ width: '100%', padding: '10px 12px', borderRadius: 10, background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', color: '#64748b', fontSize: 12 }}>
                                        <option>No doctors available</option>
                                    </select>
                                ) : (
                                    <select
                                        value={selectedDoctorId}
                                        onChange={e => setSelectedDoctorId(e.target.value)}
                                        style={{ width: '100%', padding: '10px 12px', borderRadius: 10, background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: 12 }}
                                    >
                                        {doctors.map(doc => (
                                            <option key={doc.id} value={doc.id}>
                                                Dr. {doc.user.name} ({doc.specialization})
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            <div>
                                <label style={{ fontSize: 10, color: '#94a3b8', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>Symptom/Reason</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Chest discomfort, Breathing issue"
                                    value={reason}
                                    onChange={e => setReason(e.target.value)}
                                    style={{
                                        width: '100%', padding: '10px 12px', borderRadius: 10, background: '#1e293b',
                                        border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: 12, outline: 'none'
                                    }}
                                />
                            </div>

                            {bookingStatus.message && (
                                <p style={{
                                    fontSize: 11, margin: '0', padding: 8, borderRadius: 10,
                                    background: bookingStatus.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                    color: bookingStatus.type === 'success' ? '#a7f3d0' : '#fca5a5',
                                    border: bookingStatus.type === 'success' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)'
                                }}>
                                    {bookingStatus.message}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={loadingBooking || !patientId || doctors.length === 0}
                                style={{
                                    width: '100%', padding: '11px 0', fontSize: 12, fontWeight: 700,
                                    borderRadius: 12, cursor: 'pointer', border: 'none',
                                    background: '#3b82f6', color: '#fff', marginTop: 4,
                                    boxShadow: '0 4px 14px rgba(59, 130, 246, 0.25)'
                                }}
                            >
                                {loadingBooking ? 'Booking...' : 'Book Emergency Slot'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Offline SMS Widget */}
                <div style={{
                    background: 'rgba(30, 41, 59, 0.7)',
                    backdropFilter: 'blur(12px)',
                    border: '1.5px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 24,
                    padding: 20,
                    textAlign: 'center',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
                }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 4px', color: '#cbd5e1' }}>💬 Complete Offline Fallback</h3>
                    <p style={{ fontSize: 12, color: '#94a3b8', margin: '0 0 14px' }}>If cellular data is blocked, send patient profile details instantly via offline standard SMS.</p>
                    <a href={smsHref} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1.5px solid rgba(255, 255, 255, 0.1)',
                        padding: '10px 24px', borderRadius: 100, color: '#fff',
                        textDecoration: 'none', fontSize: 12, fontWeight: 600,
                        transition: 'background 0.2s'
                    }}>
                        Send Emergency SMS Alert
                    </a>
                </div>
            </div>

            <style jsx global>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.4; transform: scale(0.95); }
                }
            `}</style>
        </div>
    )
}

export default function Page() {
    return (
        <Suspense fallback={
            <div style={{
                minHeight: '100vh',
                background: '#0f172a',
                color: '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'sans-serif'
            }}>
                Loading LifeLink triage portal...
            </div>
        }>
            <TriageScanPortal />
        </Suspense>
    )
}
