'use client'

import { useState, useEffect } from 'react'

interface Patient {
  consentId: string
  patientId: string
  patientName: string
  patientEmail: string
  consentGrantedAt: string
  consentExpiresAt: string | null
}

interface PatientRecord {
  id: string
  fileName: string
  reportType: string
  uploadedAt: string
  fileUrl: string
  fileSize: number
  ipfsCid: string
}

interface AiAnalysis {
  id: string
  aiSummary: string
  riskLevel: string
  recommendedAction: string
  createdAt: string
}

interface AuditLog {
  id: string
  patientId: string
  action: string
  recordName: string | null
  createdAt: string
  patient: { name: string }
}

interface TriageResult {
  triagePriority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'ROUTINE'
  clinicalSummary: string
  differentialDiagnosis: string[]
  recommendedTests: string[]
  treatmentSuggestions: string[]
  redFlags: string[]
  followUpTimeline: string
  confidenceScore: number
}

const PRIORITY_COLORS: Record<string, string> = {
  CRITICAL: '#FF4444',
  HIGH: '#FF8C42',
  MEDIUM: '#FFD700',
  LOW: '#4CAF79',
  ROUTINE: '#4FA4C8',
}

const PRIORITY_BG: Record<string, string> = {
  CRITICAL: 'rgba(255,68,68,0.12)',
  HIGH: 'rgba(255,140,66,0.12)',
  MEDIUM: 'rgba(255,215,0,0.12)',
  LOW: 'rgba(76,175,121,0.12)',
  ROUTINE: 'rgba(79,164,200,0.12)',
}

const ACTION_ICONS: Record<string, string> = {
  record_viewed: '👁',
  ai_triage_run: '🧠',
  access_granted: '🔓',
  access_revoked: '🔒',
}

function formatRelativeTime(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return `${diffDays}d ago`
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return 'No expiry'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function DoctorWorkspace({ user }: { user: any }) {
  const [activeView, setActiveView] = useState<'patients' | 'triage' | 'audit'>('patients')
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [patientRecords, setPatientRecords] = useState<PatientRecord[]>([])
  const [patientAnalyses, setPatientAnalyses] = useState<AiAnalysis[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [loadingPatients, setLoadingPatients] = useState(false)
  const [loadingRecords, setLoadingRecords] = useState(false)
  const [loadingAudit, setLoadingAudit] = useState(false)

  // Triage state
  const [triageSymptoms, setTriageSymptoms] = useState('')
  const [triageNotes, setTriageNotes] = useState('')
  const [triageLoading, setTriageLoading] = useState(false)
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null)
  const [triageError, setTriageError] = useState('')

  const token = () => localStorage.getItem('accessToken')

  const fetchPatients = async () => {
    setLoadingPatients(true)
    try {
      const res = await fetch('/api/doctor/patients', {
        headers: { Authorization: `Bearer ${token()}` },
      })
      const data = await res.json()
      if (data.success) setPatients(data.patients)
    } catch { } finally { setLoadingPatients(false) }
  }

  const fetchPatientRecords = async (patientId: string) => {
    setLoadingRecords(true)
    setPatientRecords([])
    setPatientAnalyses([])
    try {
      const res = await fetch(`/api/doctor/patient-records?patientId=${patientId}`, {
        headers: { Authorization: `Bearer ${token()}` },
      })
      const data = await res.json()
      if (data.success) {
        setPatientRecords(data.reports || [])
        setPatientAnalyses(data.analyses || [])
      }
    } catch { } finally { setLoadingRecords(false) }
  }

  const fetchAuditLogs = async () => {
    setLoadingAudit(true)
    try {
      const res = await fetch('/api/doctor/audit-logs', {
        headers: { Authorization: `Bearer ${token()}` },
      })
      const data = await res.json()
      if (data.success) setAuditLogs(data.logs)
    } catch { } finally { setLoadingAudit(false) }
  }

  const runTriage = async () => {
    if (!selectedPatient || !triageSymptoms.trim()) {
      setTriageError('Please select a patient and enter their symptoms.')
      return
    }
    setTriageLoading(true)
    setTriageError('')
    setTriageResult(null)
    try {
      const res = await fetch('/api/doctor/ai-triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({
          patientId: selectedPatient.patientId,
          symptoms: triageSymptoms,
          notes: triageNotes,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setTriageError(data.message || 'Triage failed'); return }
      setTriageResult(data.triage)
    } catch { setTriageError('Unable to connect to AI service') } finally { setTriageLoading(false) }
  }

  useEffect(() => {
    fetchPatients()
    fetchAuditLogs()
  }, [])

  useEffect(() => {
    if (selectedPatient) {
      fetchPatientRecords(selectedPatient.patientId)
    }
  }, [selectedPatient])

  const navItems = [
    { id: 'patients' as const, label: 'Patient Vault', emoji: '👥' },
    { id: 'triage' as const, label: 'AI Triage', emoji: '🧠' },
    { id: 'audit' as const, label: 'Audit Terminal', emoji: '📜' },
  ]

  const doctorInitials = user?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'DR'

  return (
    <div className="ll-fadein" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Doctor Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--ll-primary) 0%, var(--ll-accent) 100%)',
        borderRadius: 24,
        padding: '32px 36px',
        position: 'relative',
        overflow: 'hidden',
        border: '1.5px solid var(--ll-hero-border)',
        boxShadow: '0 8px 32px rgba(var(--ll-accent-rgb), 0.25)',
      }}>
        {/* Background decoration */}
        <svg style={{ position: 'absolute', right: 0, top: 0, width: 300, height: 200, opacity: 0.1, pointerEvents: 'none' }} viewBox="0 0 300 200" fill="none">
          <circle cx="250" cy="50" r="120" fill="#fff" />
          <circle cx="250" cy="50" r="80" fill="none" stroke="#fff" strokeWidth="1" strokeDasharray="4 4" />
          <circle cx="250" cy="50" r="100" fill="none" stroke="#fff" strokeWidth="0.5" />
        </svg>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              border: '2px solid rgba(255,255,255,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, fontWeight: 700, color: '#fff',
              backdropFilter: 'blur(8px)'
            }}>
              {doctorInitials}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 100, letterSpacing: '.08em', textTransform: 'uppercase', border: '1px solid rgba(255,255,255,0.3)' }}>
                  🩺 VERIFIED DOCTOR
                </span>
              </div>
              <h2 style={{ color: '#fff', fontSize: 26, fontWeight: 700, margin: 0, fontFamily: "'Playfair Display', serif" }}>
                Dr. {user?.name || 'Loading...'}
              </h2>
            </div>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, margin: 0, maxWidth: 480 }}>
            Welcome to your clinical workspace. Access patient records, run AI-powered triage, and maintain secure audit trails — all with blockchain-verified consent.
          </p>

          {/* Quick stats */}
          <div style={{ display: 'flex', gap: 20, marginTop: 20 }}>
            {[
              { label: 'Consented Patients', value: patients.length, emoji: '👥' },
              { label: 'Records Accessed', value: auditLogs.filter(l => l.action === 'record_viewed').length, emoji: '📋' },
              { label: 'AI Triages Run', value: auditLogs.filter(l => l.action === 'ai_triage_run').length, emoji: '🧠' },
            ].map(stat => (
              <div key={stat.label} style={{
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: 14,
                padding: '12px 18px',
                backdropFilter: 'blur(8px)',
              }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>{stat.emoji} {stat.value}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sub-Navigation */}
      <div style={{
        display: 'flex', gap: 8,
        background: 'var(--ll-card-bg)',
        border: '1.5px solid var(--ll-card-border)',
        borderRadius: 16,
        padding: 6,
      }}>
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: 12,
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: 14,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'all 0.15s',
              background: activeView === item.id ? 'var(--ll-primary)' : 'transparent',
              color: activeView === item.id ? '#fff' : 'var(--ll-text-muted)',
            }}
          >
            <span>{item.emoji}</span>
            {item.label}
          </button>
        ))}
      </div>

      {/* ── PATIENT VAULT ── */}
      {activeView === 'patients' && (
        <div style={{ display: 'grid', gridTemplateColumns: selectedPatient ? '320px 1fr' : '1fr', gap: 20 }}>
          {/* Patient List */}
          <div className="ll-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--ll-text)', margin: 0 }}>
                👥 Consented Patients
              </h3>
              <button
                onClick={fetchPatients}
                style={{
                  background: 'rgba(var(--ll-accent-rgb),0.12)', border: 'none',
                  borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
                  fontSize: 12, fontWeight: 600, color: 'var(--ll-text)',
                  fontFamily: 'inherit',
                }}
              >
                ↻ Refresh
              </button>
            </div>

            {loadingPatients ? (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--ll-text-muted)' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
                <p style={{ margin: 0, fontSize: 14 }}>Loading patients...</p>
              </div>
            ) : patients.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--ll-text-muted)' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🔐</div>
                <p style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 600, color: 'var(--ll-text)' }}>No consented patients</p>
                <p style={{ margin: 0, fontSize: 13 }}>Patients must grant you consent first to appear here.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {patients.map(patient => (
                  <div
                    key={patient.consentId}
                    onClick={() => setSelectedPatient(patient)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 12,
                      border: '1.5px solid',
                      borderColor: selectedPatient?.consentId === patient.consentId
                        ? 'var(--ll-primary)'
                        : 'var(--ll-card-border)',
                      cursor: 'pointer',
                      background: selectedPatient?.consentId === patient.consentId
                        ? 'rgba(var(--ll-accent-rgb),0.08)'
                        : 'transparent',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--ll-primary), var(--ll-accent))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0,
                      }}>
                        {patient.patientName.slice(0, 2).toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ll-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {patient.patientName}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--ll-text-muted)', marginTop: 2 }}>
                          {patient.patientEmail}
                        </div>
                      </div>
                    </div>
                    <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 100,
                        background: 'rgba(76,175,121,0.15)', color: '#4CAF79', border: '1px solid rgba(76,175,121,0.3)'
                      }}>
                        ✓ CONSENT ACTIVE
                      </span>
                      <span style={{ fontSize: 10, color: 'var(--ll-text-muted)' }}>
                        {patient.consentExpiresAt ? `Expires ${formatDate(patient.consentExpiresAt)}` : 'No expiry'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Patient Details Panel */}
          {selectedPatient && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Patient Header */}
              <div className="ll-card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--ll-primary), var(--ll-accent))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, fontWeight: 700, color: '#fff',
                  }}>
                    {selectedPatient.patientName.slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--ll-text)', margin: '0 0 4px' }}>
                      {selectedPatient.patientName}
                    </h3>
                    <p style={{ fontSize: 13, color: 'var(--ll-text-muted)', margin: 0 }}>
                      {selectedPatient.patientEmail} · Consent since {formatDate(selectedPatient.consentGrantedAt)}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedPatient(null)
                      setPatientRecords([])
                      setPatientAnalyses([])
                    }}
                    style={{
                      background: 'rgba(var(--ll-accent-rgb),0.1)', border: 'none', borderRadius: 8,
                      padding: '6px 12px', cursor: 'pointer', fontSize: 12, color: 'var(--ll-text-muted)',
                      fontFamily: 'inherit', fontWeight: 600,
                    }}
                  >
                    ✕ Close
                  </button>
                </div>
              </div>

              {/* Records */}
              <div className="ll-card" style={{ padding: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--ll-text)', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  📋 Medical Records
                  {loadingRecords && <span style={{ fontSize: 12, color: 'var(--ll-text-muted)', fontWeight: 400 }}>Loading...</span>}
                </h3>

                {!loadingRecords && patientRecords.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--ll-text-muted)' }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>📂</div>
                    <p style={{ margin: 0, fontSize: 13 }}>No records found for this patient.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {patientRecords.map(record => (
                      <div key={record.id} style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '12px 14px', borderRadius: 12,
                        border: '1.5px solid var(--ll-card-border)',
                        background: 'rgba(var(--ll-accent-rgb),0.04)',
                      }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                          background: 'rgba(var(--ll-accent-rgb),0.15)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 16,
                        }}>
                          {record.reportType === 'Scan' ? '🔬' : record.reportType === 'Prescription' ? '💊' : '🧾'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ll-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {record.fileName || 'Unnamed Record'}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--ll-text-muted)', marginTop: 2 }}>
                            {record.reportType || 'Report'} · {formatDate(record.uploadedAt)}
                          </div>
                        </div>
                        {record.ipfsCid && (
                          <span style={{
                            fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 100,
                            background: 'rgba(79,164,200,0.15)', color: '#4FA4C8',
                          }}>
                            ⛓ IPFS
                          </span>
                        )}
                        {record.fileUrl && (
                          <a
                            href={`http://localhost:4000${record.fileUrl}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              fontSize: 12, color: 'var(--ll-primary)', textDecoration: 'none',
                              fontWeight: 600, padding: '4px 10px', borderRadius: 8,
                              background: 'rgba(var(--ll-accent-rgb),0.1)',
                            }}
                          >
                            View ↗
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* AI Analyses History */}
              {patientAnalyses.length > 0 && (
                <div className="ll-card" style={{ padding: 20 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--ll-text)', margin: '0 0 14px' }}>
                    🔬 Recent AI Analyses
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {patientAnalyses.map(analysis => {
                      const risk = analysis.riskLevel || 'LOW'
                      const riskColor = risk === 'HIGH' || risk === 'CRITICAL' ? '#FF4444' : risk === 'MEDIUM' ? '#FFD700' : '#4CAF79'
                      return (
                        <div key={analysis.id} style={{
                          padding: '12px 14px', borderRadius: 12,
                          border: `1.5px solid ${riskColor}30`,
                          background: `${riskColor}08`,
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                            <span style={{
                              fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 100,
                              background: `${riskColor}20`, color: riskColor,
                              border: `1px solid ${riskColor}40`,
                            }}>
                              {risk} RISK
                            </span>
                            <span style={{ fontSize: 11, color: 'var(--ll-text-muted)' }}>
                              {formatRelativeTime(analysis.createdAt)}
                            </span>
                          </div>
                          <p style={{ fontSize: 13, color: 'var(--ll-text)', margin: '0 0 4px', lineHeight: 1.5 }}>
                            {analysis.aiSummary.slice(0, 150)}{analysis.aiSummary.length > 150 ? '...' : ''}
                          </p>
                          <p style={{ fontSize: 12, color: 'var(--ll-text-muted)', margin: 0 }}>
                            💡 {analysis.recommendedAction}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── AI TRIAGE ── */}
      {activeView === 'triage' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Input Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="ll-card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--ll-text)', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
                🧠 AI Clinical Triage
              </h3>
              <p style={{ fontSize: 13, color: 'var(--ll-text-muted)', margin: '0 0 20px' }}>
                Powered by LLaMA 3.3 · For verified doctors only · Not a replacement for clinical judgment
              </p>

              {/* Select Patient */}
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--ll-text-muted)', textTransform: 'uppercase', letterSpacing: '.07em', display: 'block', marginBottom: 6 }}>
                Select Patient *
              </label>
              <select
                className="ll-input"
                value={selectedPatient?.patientId || ''}
                onChange={e => {
                  const p = patients.find(x => x.patientId === e.target.value) || null
                  setSelectedPatient(p)
                }}
                style={{ marginBottom: 16 }}
              >
                <option value="">— Choose a consented patient —</option>
                {patients.map(p => (
                  <option key={p.patientId} value={p.patientId}>{p.patientName} ({p.patientEmail})</option>
                ))}
              </select>

              {/* Symptoms */}
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--ll-text-muted)', textTransform: 'uppercase', letterSpacing: '.07em', display: 'block', marginBottom: 6 }}>
                Presenting Symptoms *
              </label>
              <textarea
                className="ll-input"
                rows={5}
                placeholder="Describe presenting symptoms in detail, e.g. fever 38.9°C for 3 days, dry cough, mild shortness of breath, fatigue..."
                value={triageSymptoms}
                onChange={e => setTriageSymptoms(e.target.value)}
                style={{ resize: 'vertical', marginBottom: 16, lineHeight: 1.6 }}
              />

              {/* Doctor Notes */}
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--ll-text-muted)', textTransform: 'uppercase', letterSpacing: '.07em', display: 'block', marginBottom: 6 }}>
                Clinical Notes (optional)
              </label>
              <textarea
                className="ll-input"
                rows={3}
                placeholder="Additional clinical observations, patient history, medications, lab values..."
                value={triageNotes}
                onChange={e => setTriageNotes(e.target.value)}
                style={{ resize: 'vertical', marginBottom: 20, lineHeight: 1.6 }}
              />

              {triageError && (
                <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)', color: '#FF4444', fontSize: 13, marginBottom: 16 }}>
                  ⚠ {triageError}
                </div>
              )}

              <button
                onClick={runTriage}
                disabled={triageLoading || !selectedPatient || !triageSymptoms.trim()}
                className="ll-btn-primary"
                style={{ width: '100%', borderRadius: 14, gap: 10, fontSize: 15 }}
              >
                {triageLoading ? (
                  <>
                    <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⟳</span>
                    Running AI Triage...
                  </>
                ) : (
                  <>🧠 Run AI Triage</>
                )}
              </button>
            </div>

            {/* Disclaimer Card */}
            <div style={{
              padding: '14px 18px', borderRadius: 14,
              background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.2)',
            }}>
              <p style={{ fontSize: 12, color: 'var(--ll-text-muted)', margin: 0, lineHeight: 1.6 }}>
                <strong style={{ color: '#FFD700' }}>⚠ Clinical Decision Support Only</strong><br />
                This AI triage tool is designed to assist licensed medical professionals. All results should be validated by clinical judgment. This is not a diagnostic tool.
              </p>
            </div>
          </div>

          {/* Result Panel */}
          <div>
            {!triageResult && !triageLoading && (
              <div className="ll-card" style={{ padding: 40, textAlign: 'center' }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>🩺</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--ll-text)', margin: '0 0 8px' }}>
                  Ready for Triage
                </h3>
                <p style={{ fontSize: 14, color: 'var(--ll-text-muted)', margin: 0 }}>
                  Select a patient, describe symptoms and run the AI triage to see a comprehensive clinical assessment.
                </p>
              </div>
            )}

            {triageLoading && (
              <div className="ll-card" style={{ padding: 40, textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 16, animation: 'floatQR 2s ease-in-out infinite' }}>🧠</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--ll-text)', margin: '0 0 8px' }}>
                  Analyzing Clinical Data...
                </h3>
                <p style={{ fontSize: 14, color: 'var(--ll-text-muted)', margin: 0 }}>
                  LLaMA 3.3 is processing the clinical information. This takes a few seconds.
                </p>
              </div>
            )}

            {triageResult && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Priority Header */}
                <div style={{
                  padding: '20px 24px', borderRadius: 20,
                  background: PRIORITY_BG[triageResult.triagePriority] || 'rgba(79,164,200,0.12)',
                  border: `2px solid ${PRIORITY_COLORS[triageResult.triagePriority] || '#4FA4C8'}40`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: '50%',
                      background: PRIORITY_COLORS[triageResult.triagePriority] || '#4FA4C8',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 20,
                    }}>
                      {triageResult.triagePriority === 'CRITICAL' ? '🚨' :
                        triageResult.triagePriority === 'HIGH' ? '⚠' :
                          triageResult.triagePriority === 'MEDIUM' ? '⚡' :
                            triageResult.triagePriority === 'LOW' ? '✓' : '💙'}
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: PRIORITY_COLORS[triageResult.triagePriority], textTransform: 'uppercase', letterSpacing: '.08em' }}>
                        Triage Priority
                      </div>
                      <div style={{ fontSize: 24, fontWeight: 800, color: PRIORITY_COLORS[triageResult.triagePriority] }}>
                        {triageResult.triagePriority}
                      </div>
                    </div>
                    <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                      <div style={{ fontSize: 11, color: 'var(--ll-text-muted)', marginBottom: 2 }}>AI Confidence</div>
                      <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--ll-text)' }}>
                        {triageResult.confidenceScore}%
                      </div>
                    </div>
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--ll-text)', margin: '14px 0 0', lineHeight: 1.6 }}>
                    {triageResult.clinicalSummary}
                  </p>
                </div>

                {/* Differential Diagnosis */}
                {triageResult.differentialDiagnosis?.length > 0 && (
                  <div className="ll-card" style={{ padding: 18 }}>
                    <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--ll-text)', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                      🔍 Differential Diagnosis
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {triageResult.differentialDiagnosis.map((d, i) => (
                        <span key={i} style={{
                          fontSize: 12, padding: '4px 12px', borderRadius: 100,
                          background: 'rgba(var(--ll-accent-rgb),0.12)',
                          border: '1px solid rgba(var(--ll-accent-rgb),0.2)',
                          color: 'var(--ll-text)',
                        }}>
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Two columns: tests + treatment */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  {triageResult.recommendedTests?.length > 0 && (
                    <div className="ll-card" style={{ padding: 16 }}>
                      <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--ll-text)', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                        🧪 Recommended Tests
                      </h4>
                      <ul style={{ margin: 0, paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {triageResult.recommendedTests.map((t, i) => (
                          <li key={i} style={{ fontSize: 12, color: 'var(--ll-text)', lineHeight: 1.5 }}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {triageResult.treatmentSuggestions?.length > 0 && (
                    <div className="ll-card" style={{ padding: 16 }}>
                      <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--ll-text)', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                        💊 Treatment Suggestions
                      </h4>
                      <ul style={{ margin: 0, paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {triageResult.treatmentSuggestions.map((t, i) => (
                          <li key={i} style={{ fontSize: 12, color: 'var(--ll-text)', lineHeight: 1.5 }}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Red Flags */}
                {triageResult.redFlags?.length > 0 && (
                  <div style={{
                    padding: '14px 18px', borderRadius: 14,
                    background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.2)',
                  }}>
                    <h4 style={{ fontSize: 12, fontWeight: 700, color: '#FF4444', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                      🚩 Red Flags to Watch
                    </h4>
                    <ul style={{ margin: 0, paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {triageResult.redFlags.map((f, i) => (
                        <li key={i} style={{ fontSize: 12, color: '#FF4444', lineHeight: 1.5 }}>{f}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Follow-up */}
                {triageResult.followUpTimeline && (
                  <div style={{
                    padding: '12px 18px', borderRadius: 14,
                    background: 'rgba(76,175,121,0.08)', border: '1px solid rgba(76,175,121,0.2)',
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                    <span style={{ fontSize: 18 }}>📅</span>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#4CAF79', textTransform: 'uppercase', letterSpacing: '.06em' }}>Follow-up Timeline</div>
                      <div style={{ fontSize: 13, color: 'var(--ll-text)', marginTop: 2 }}>{triageResult.followUpTimeline}</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── AUDIT TERMINAL ── */}
      {activeView === 'audit' && (
        <div className="ll-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--ll-text)', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
                📜 Audit Terminal
              </h3>
              <p style={{ fontSize: 13, color: 'var(--ll-text-muted)', margin: 0 }}>
                Full immutable log of all patient data access and AI triage activities.
              </p>
            </div>
            <button
              onClick={fetchAuditLogs}
              style={{
                background: 'rgba(var(--ll-accent-rgb),0.12)', border: 'none',
                borderRadius: 8, padding: '8px 14px', cursor: 'pointer',
                fontSize: 13, fontWeight: 600, color: 'var(--ll-text)',
                fontFamily: 'inherit',
              }}
            >
              ↻ Refresh
            </button>
          </div>

          {/* Terminal-style log */}
          <div style={{
            background: '#0A0E1A',
            borderRadius: 16,
            border: '1.5px solid #1E2738',
            padding: '16px 0',
            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
            maxHeight: 520,
            overflowY: 'auto',
          }}>
            {/* Terminal header */}
            <div style={{ padding: '0 20px 12px', borderBottom: '1px solid #1E2738', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FF5F57' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FEBC2E' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28C840' }} />
              <span style={{ fontSize: 11, color: '#4FA4C8', marginLeft: 8 }}>lifelink@audit-terminal ~ doctor-access-log</span>
            </div>

            {loadingAudit ? (
              <div style={{ padding: '20px 20px', color: '#4FA4C8', fontSize: 13 }}>
                $ Loading audit logs...
              </div>
            ) : auditLogs.length === 0 ? (
              <div style={{ padding: '20px 20px', color: '#4FA4C8', fontSize: 13 }}>
                $ No audit logs found. Access patient records to generate entries.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {auditLogs.map((log, index) => {
                  const actionColor = log.action === 'ai_triage_run' ? '#9D65C9' :
                    log.action === 'record_viewed' ? '#4FA4C8' :
                      log.action === 'access_granted' ? '#4CAF79' : '#E05454'

                  return (
                    <div
                      key={log.id}
                      style={{
                        padding: '8px 20px',
                        background: index % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
                        display: 'flex', alignItems: 'flex-start', gap: 12,
                      }}
                    >
                      <span style={{ fontSize: 12, color: '#3D4F6B', minWidth: 22, paddingTop: 1, userSelect: 'none' }}>
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span style={{ fontSize: 11, color: '#3D6B5A', minWidth: 80, paddingTop: 1 }}>
                        {formatRelativeTime(log.createdAt)}
                      </span>
                      <span style={{ fontSize: 13, marginTop: 0, flexShrink: 0 }}>
                        {ACTION_ICONS[log.action] || '📝'}
                      </span>
                      <div style={{ flex: 1 }}>
                        <span style={{ color: actionColor, fontWeight: 700, fontSize: 12 }}>
                          [{log.action.toUpperCase()}]
                        </span>
                        <span style={{ color: '#8BA4C2', fontSize: 12 }}>
                          {' '}patient=
                        </span>
                        <span style={{ color: '#E2C97E', fontSize: 12 }}>
                          "{log.patient?.name || log.patientId}"
                        </span>
                        {log.recordName && (
                          <>
                            <span style={{ color: '#8BA4C2', fontSize: 12 }}> resource=</span>
                            <span style={{ color: '#88C3D8', fontSize: 12 }}>"{log.recordName}"</span>
                          </>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 16 }}>
            {[
              { label: 'Total Actions', value: auditLogs.length, color: 'var(--ll-primary)', emoji: '📊' },
              { label: 'Records Viewed', value: auditLogs.filter(l => l.action === 'record_viewed').length, color: '#4FA4C8', emoji: '👁' },
              { label: 'AI Triages', value: auditLogs.filter(l => l.action === 'ai_triage_run').length, color: '#9D65C9', emoji: '🧠' },
            ].map(stat => (
              <div key={stat.label} style={{
                padding: '14px 16px', borderRadius: 14,
                border: '1.5px solid var(--ll-card-border)',
                background: 'var(--ll-card-bg)',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <span style={{ fontSize: 20 }}>{stat.emoji}</span>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: stat.color }}>{stat.value}</div>
                  <div style={{ fontSize: 11, color: 'var(--ll-text-muted)' }}>{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
