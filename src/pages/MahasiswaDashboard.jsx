import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useRequests } from '../hooks/useRequests.js'
import RequestCard from '../components/RequestCard.jsx'
import api from '../api/axios.js'

export default function MahasiswaDashboard() {
  const { user } = useAuth()
  const { requests, setRequests, loading, usingMock } = useRequests('/permissions/mine', (r) => r.studentName === user?.name)
  const [recap, setRecap] = useState(null)
  const [activeTab, setActiveTab] = useState('semua') // semua, menunggu, diproses
  const [actionBusyId, setActionBusyId] = useState(null)
  const [lightbox, setLightbox] = useState(null) // { url, title, student }

  // Ambil rekap kehadiran mahasiswa yang login
  useEffect(() => {
    api.get('/attendance/recap')
      .then(res => {
        const myRecap = res.data.rows.find(row => row.nim === user?.nim)
        setRecap(myRecap || null)
      })
      .catch(() => {
        // Fallback ditangani di axios interceptor
      })
  }, [requests, user])

  const pendingCount = requests.filter((r) => r.status === 'pending').length

  const filteredRequests = requests.filter(r => {
    if (activeTab === 'menunggu') return r.status === 'pending'
    if (activeTab === 'diproses') return r.status !== 'pending'
    return true
  })

  async function handleEscalate(requestId) {
    if (!confirm('Apakah Anda yakin ingin mengajukan banding ke Admin untuk keputusan dosen ini?')) return
    
    setActionBusyId(requestId)
    try {
      await api.post(`/requests/${requestId}/escalate`)
      setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'escalated' } : r))
    } catch (err) {
      alert('Gagal mengirim banding: ' + err.message)
    } finally {
      setActionBusyId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-850">Halo, {user?.name}</h1>
          <p className="text-sm text-ink-500">
            NIM: {user?.nim} · Mahasiswa Akademik
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/izin/baru" className="rounded-lg bg-ink-800 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-ink-700 transition-all">
            Ajukan Izin
          </Link>
          <Link
            to="/revisi/baru"
            className="rounded-lg border border-ink-200 bg-white px-4 py-2.5 text-sm font-medium text-ink-700 shadow-xs hover:bg-ink-50 transition-all"
          >
            Ajukan Revisi Kehadiran
          </Link>
        </div>
      </div>

      {/* Rekap Kehadiran Personal */}
      {recap && (
        <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-xs">
          <h2 className="font-display text-lg font-medium text-ink-800 mb-4">Ringkasan Kehadiran Sesi</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl bg-emerald-50/50 border border-emerald-100 p-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Hadir</p>
              <p className="mt-2 text-2xl font-bold text-emerald-800">{recap.hadir}</p>
            </div>
            <div className="rounded-xl bg-amber-50/50 border border-amber-100 p-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">Izin</p>
              <p className="mt-2 text-2xl font-bold text-amber-800">{recap.izin}</p>
            </div>
            <div className="rounded-xl bg-blue-50/50 border border-blue-100 p-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Sakit</p>
              <p className="mt-2 text-2xl font-bold text-blue-800">{recap.sakit}</p>
            </div>
            <div className="rounded-xl bg-rose-50/50 border border-rose-100 p-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-rose-600">Alpa</p>
              <p className="mt-2 text-2xl font-bold text-rose-800">{recap.alpa}</p>
            </div>
          </div>
        </div>
      )}

      {usingMock && (
        <div className="rounded-lg bg-amber-50 border border-amber-100 px-4 py-2.5 text-xs text-amber-700">
          Mode Demo — Perubahan data disimpan dalam memori lokal (localStorage) browser Anda.
        </div>
      )}

      {/* Tabs Filter & Daftar Pengajuan */}
      <div className="space-y-4">
        <div className="flex border-b border-ink-100">
          {[
            { id: 'semua', label: 'Semua Pengajuan' },
            { id: 'menunggu', label: `Menunggu Tinjauan (${pendingCount})` },
            { id: 'diproses', label: 'Selesai Diproses' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`border-b-2 px-4 py-2.5 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'border-amber-400 text-ink-800 font-semibold'
                  : 'border-transparent text-ink-400 hover:text-ink-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {loading && <p className="text-sm text-ink-400">Memuat pengajuan...</p>}
          {!loading && filteredRequests.length === 0 && (
            <div className="rounded-xl border border-dashed border-ink-200 bg-white p-8 text-center">
              <p className="text-sm text-ink-400">Belum ada pengajuan untuk kategori ini.</p>
            </div>
          )}
          {filteredRequests.map((r) => (
            <RequestCard
              key={r.id}
              request={r}
              onViewAttachment={(url, title, student) => setLightbox({ url, title, student })}
              actions={
                r.status === 'rejected' ? (
                  <button
                    onClick={() => handleEscalate(r.id)}
                    disabled={actionBusyId === r.id}
                    className="rounded-lg bg-amber-400 px-4 py-2 text-xs font-semibold text-ink-900 shadow-xs hover:bg-amber-300 transition-all disabled:opacity-60"
                  >
                    {actionBusyId === r.id ? 'Mengirim...' : 'Ajukan Banding ke Admin'}
                  </button>
                ) : null
              }
            />
          ))}
        </div>
      </div>

      {/* Lightbox Modal Bukti Pendukung */}
      {lightbox && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          onClick={() => setLightbox(null)}
        >
          <div 
            className="relative max-w-3xl w-full bg-white rounded-2xl p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-ink-100 pb-3">
              <div>
                <h3 className="font-display text-lg font-semibold text-ink-850">Bukti Lampiran Pengajuan</h3>
                <p className="text-xs text-ink-500">{lightbox.student} · {lightbox.title}</p>
              </div>
              <button 
                onClick={() => setLightbox(null)}
                className="text-ink-400 hover:text-ink-700 text-lg font-bold"
              >
                &times;
              </button>
            </div>
            <div className="flex justify-center bg-ink-50 rounded-xl overflow-hidden p-2 max-h-[70vh]">
              {lightbox.url.endsWith('.pdf') ? (
                <div className="flex flex-col items-center justify-center p-8 text-center text-ink-500">
                  <svg className="h-16 w-16 text-rose-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <p className="font-medium text-sm">Dokumen PDF Terlampir</p>
                  <a 
                    href={lightbox.url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="mt-4 rounded-lg bg-ink-800 px-4 py-2 text-xs font-semibold text-white hover:bg-ink-700"
                  >
                    Buka PDF di Tab Baru
                  </a>
                </div>
              ) : (
                <img 
                  src={lightbox.url} 
                  alt="Bukti Lampiran" 
                  className="object-contain max-h-[60vh] rounded-lg shadow-sm"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                    const parent = e.target.parentNode;
                    const fallbackDiv = document.createElement('div');
                    fallbackDiv.className = 'p-12 text-center text-ink-500 flex flex-col items-center justify-center';
                    fallbackDiv.innerHTML = `
                      <svg class="h-12 w-12 text-ink-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p class="text-sm font-medium">Gambar Bukti Terlampir</p>
                      <a href="${lightbox.url}" target="_blank" class="mt-4 text-xs font-semibold text-amber-500 underline">Unduh/Lihat berkas bukti</a>
                    `;
                    parent.appendChild(fallbackDiv);
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

