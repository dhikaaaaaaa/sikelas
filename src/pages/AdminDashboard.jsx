import { useState } from 'react'
import { useRequests } from '../hooks/useRequests.js'
import RequestCard from '../components/RequestCard.jsx'
import api from '../api/axios.js'

export default function AdminDashboard() {
  const { requests, setRequests, loading, usingMock } = useRequests('/requests/all')
  const [busyId, setBusyId] = useState(null)
  
  // State Tab
  const [activeTab, setActiveTab] = useState('escalated') // escalated, history
  
  // State Lightbox
  const [lightbox, setLightbox] = useState(null)

  async function decide(request, decision) {
    if (!confirm(`Apakah Anda yakin ingin memberikan keputusan FINAL "${decision === 'approve' ? 'Setuju' : 'Tolak'}" untuk kasus banding ini?`)) return
    
    setBusyId(request.id)
    try {
      await api.post(`/requests/${request.id}/admin-decision`, { decision })
      setRequests((prev) =>
        prev.map((r) => (r.id === request.id ? { ...r, status: decision === 'approve' ? 'approved' : 'rejected' } : r)),
      )
    } catch (err) {
      alert('Gagal memproses keputusan admin: ' + err.message)
    } finally {
      setBusyId(null)
    }
  }

  // Filter pengajuan berdasarkan Tab
  const finalRequests = requests.filter(r => {
    if (activeTab === 'escalated') {
      return r.status === 'escalated'
    } else {
      // Riwayat penanganan kasus oleh admin (yang sudah disetujui/ditolak setelah eskalasi)
      // Untuk simulasi, tampilkan semua yang statusnya approved/rejected dan tipenya pernah melewati eskalasi, atau tampilkan saja riwayat non-pending
      return r.status === 'approved' || r.status === 'rejected'
    }
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink-850">Dashboard Admin Akademik</h1>
        <p className="text-sm text-ink-500">
          Penengah banding mahasiswa atas keputusan dosen. Keputusan admin bersifat final dan mengikat.
        </p>
      </div>

      {usingMock && (
        <div className="rounded-lg bg-amber-50 border border-amber-100 px-4 py-2.5 text-xs text-amber-700">
          Mode Demo — Keputusan final Admin akan langsung memperbarui database dan mengubah status presensi mahasiswa.
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-ink-100 pb-2">
        <div className="flex border-b border-transparent">
          <button
            onClick={() => setActiveTab('escalated')}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-all ${
              activeTab === 'escalated'
                ? 'border-amber-400 text-ink-800 font-semibold'
                : 'border-transparent text-ink-400 hover:text-ink-600'
            }`}
          >
            Banding Aktif ({requests.filter(r => r.status === 'escalated').length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-all ${
              activeTab === 'history'
                ? 'border-amber-400 text-ink-800 font-semibold'
                : 'border-transparent text-ink-400 hover:text-ink-600'
            }`}
          >
            Kasus Selesai ({requests.filter(r => r.status === 'approved' || r.status === 'rejected').length})
          </button>
        </div>
      </div>

      {/* Daftar Pengajuan */}
      <div className="space-y-4">
        {loading && <p className="text-sm text-ink-400">Memuat data banding...</p>}
        {!loading && finalRequests.length === 0 && (
          <div className="rounded-xl border border-dashed border-ink-200 bg-white p-8 text-center">
            <p className="text-sm text-ink-400">Tidak ada pengajuan banding untuk kategori ini.</p>
          </div>
        )}
        {finalRequests.map((r) => (
          <RequestCard
            key={r.id}
            request={r}
            onViewAttachment={(url, title, student) => setLightbox({ url, title, student })}
            actions={
              r.status === 'escalated' ? (
                <>
                  <button
                    onClick={() => decide(r, 'approve')}
                    disabled={busyId === r.id}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 shadow-sm transition-all disabled:opacity-60"
                  >
                    Setujui Banding (Final)
                  </button>
                  <button
                    onClick={() => decide(r, 'reject')}
                    disabled={busyId === r.id}
                    className="rounded-lg border border-rose-200 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 shadow-xs transition-all disabled:opacity-60"
                  >
                    Tolak Banding (Final)
                  </button>
                </>
              ) : null
            }
          />
        ))}
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

