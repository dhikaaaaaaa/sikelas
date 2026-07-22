import { useState, useEffect } from 'react'
import { useRequests } from '../hooks/useRequests.js'
import RequestCard from '../components/RequestCard.jsx'
import api, { getImageUrl } from '../api/axios.js'

// Grafik absensi per semester (reusable)
function AbsensiChart({ data }) {
  const semesters = [1,2,3,4,5,6,7,8]
  const maxVal = 100
  const barW = 36
  const chartH = 140
  const gap = 12

  return (
    <div className="bg-white rounded-2xl border border-ink-100 shadow-xs p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display text-base font-semibold text-ink-800">Rata-Rata Kehadiran per Semester</h2>
          <p className="text-xs text-ink-400 mt-0.5">Persentase rata-rata hadir semua mahasiswa tiap semester</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-ink-500">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block"></span>≥ 80%</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-amber-400 inline-block"></span>60–79%</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-rose-400 inline-block"></span>&lt; 60%</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <svg
          width={semesters.length * (barW + gap) + gap}
          height={chartH + 48}
          style={{ display: 'block', minWidth: '100%' }}
        >
          {[0,25,50,75,100].map(line => {
            const y = chartH - (line / maxVal) * chartH
            return (
              <g key={line}>
                <line x1={0} y1={y} x2={semesters.length * (barW + gap) + gap} y2={y} stroke="#f1f0ef" strokeWidth="1" />
                <text x={0} y={y - 3} fontSize="9" fill="#9e9b96" textAnchor="start">{line}%</text>
              </g>
            )
          })}
          {semesters.map((sem, i) => {
            const pct = data[sem] ?? 0
            const barH = (pct / maxVal) * chartH
            const x = gap + i * (barW + gap)
            const y = chartH - barH
            const color = pct >= 80 ? '#22c55e' : pct >= 60 ? '#fbbf24' : '#f87171'
            const hasData = data[sem] !== undefined
            return (
              <g key={sem}>
                <rect x={x} y={hasData ? y : chartH} width={barW} height={hasData ? barH : 0} rx={5} fill={hasData ? color : '#e9e7e4'} opacity={hasData ? 0.9 : 0.4} />
                {hasData && <text x={x + barW / 2} y={y - 5} fontSize="9" fontWeight="600" fill={color} textAnchor="middle">{Math.round(pct)}%</text>}
                {!hasData && <text x={x + barW / 2} y={chartH - 5} fontSize="9" fill="#ccc" textAnchor="middle">—</text>}
                <text x={x + barW / 2} y={chartH + 16} fontSize="10" fill="#6b6963" textAnchor="middle">Sem {sem}</text>
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const { requests, setRequests, loading } = useRequests('/requests/all')
  const [busyId, setBusyId] = useState(null)
  const [activeTab, setActiveTab] = useState('izin_masuk')
  const [lightbox, setLightbox] = useState(null)
  const [attendanceData, setAttendanceData] = useState({})

  // Ambil data kehadiran untuk grafik
  useEffect(() => {
    api.get('/admin/users')
      .then(async usersRes => {
        const students = (usersRes.data.users || []).filter(u => u.role === 'mahasiswa')
        const attRes = await api.get('/attendance/recap').catch(() => ({ data: { records: [] } }))
        const records = attRes.data.records || []
        const semData = {}
        const semCount = {}
        for (const rec of records) {
          const student = students.find(s => s.nim === rec.nim)
          if (!student) continue
          const sem = student.semester || 1
          const total = (rec.hadir || 0) + (rec.izin || 0) + (rec.sakit || 0) + (rec.alpa || 0)
          if (total === 0) continue
          const pct = (rec.hadir / total) * 100
          semData[sem] = (semData[sem] || 0) + pct
          semCount[sem] = (semCount[sem] || 0) + 1
        }
        const avg = {}
        for (const sem in semData) avg[sem] = semData[sem] / semCount[sem]
        setAttendanceData(avg)
      })
      .catch(() => {})
  }, [])

  async function decide(request, decision) {
    let confirmMsg = 'Apakah Anda yakin?'
    if (request.status === 'pending_admin' && request.type === 'izin') {
      confirmMsg = `Apakah Anda yakin ingin ${decision === 'approve' ? 'menyetujui dan meneruskan ke Dosen' : 'menolak'} pengajuan izin ini?`
    } else if (request.status === 'pending_admin' && request.type === 'revisi') {
      confirmMsg = `Apakah Anda yakin ingin memberikan keputusan final "${decision === 'approve' ? 'Setuju' : 'Tolak'}" untuk revisi kehadiran ini?`
    } else if (request.status === 'escalated') {
      confirmMsg = `Apakah Anda yakin ingin memberikan keputusan final "${decision === 'approve' ? 'Setuju' : 'Tolak'}" untuk kasus banding ini?`
    }

    if (!confirm(confirmMsg)) return
    setBusyId(request.id)
    try {
      const res = await api.post(`/requests/${request.id}/admin-decision`, { decision })
      const updatedReq = res.data.request
      setRequests((prev) =>
        prev.map((r) => (r.id === request.id ? { ...r, status: updatedReq.status } : r)),
      )
    } catch (err) {
      alert('Gagal memproses keputusan admin: ' + err.message)
    } finally {
      setBusyId(null)
    }
  }

  const pendingIzinCount = requests.filter(r => r.type === 'izin' && r.status === 'pending_admin').length
  const pendingRevisiCount = requests.filter(r => r.type === 'revisi' && r.status === 'pending_admin').length
  const escalatedCount = requests.filter(r => r.status === 'escalated').length
  const historyCount = requests.filter(r => ['approved', 'rejected', 'rejected_by_admin', 'rejected_by_dosen'].includes(r.status)).length

  const finalRequests = requests.filter(r => {
    if (activeTab === 'izin_masuk') return r.type === 'izin' && r.status === 'pending_admin'
    if (activeTab === 'revisi_final') return r.type === 'revisi' && r.status === 'pending_admin'
    if (activeTab === 'escalated') return r.status === 'escalated'
    return ['approved', 'rejected', 'rejected_by_admin', 'rejected_by_dosen'].includes(r.status)
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink-850">Dashboard Admin / FIR Paramadina</h1>
        <p className="text-sm text-ink-500">
          Pusat verifikasi izin kelas, persetujuan revisi kehadiran, dan penanganan banding mahasiswa.
        </p>
      </div>

      {/* ── Grafik Kehadiran Per Semester ── */}
      <AbsensiChart data={attendanceData} />

      {/* Tabs */}
      <div className="border-b border-ink-100 pb-2">
        <div className="flex flex-wrap border-b border-transparent gap-1">
          <button
            onClick={() => setActiveTab('izin_masuk')}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-all ${
              activeTab === 'izin_masuk'
                ? 'border-amber-400 text-ink-800 font-semibold'
                : 'border-transparent text-ink-400 hover:text-ink-600'
            }`}
          >
            Izin Masuk ({pendingIzinCount})
          </button>
          <button
            onClick={() => setActiveTab('revisi_final')}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-all ${
              activeTab === 'revisi_final'
                ? 'border-amber-400 text-ink-800 font-semibold'
                : 'border-transparent text-ink-400 hover:text-ink-600'
            }`}
          >
            Revisi Kehadiran ({pendingRevisiCount})
          </button>
          <button
            onClick={() => setActiveTab('escalated')}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-all ${
              activeTab === 'escalated'
                ? 'border-amber-400 text-ink-800 font-semibold'
                : 'border-transparent text-ink-400 hover:text-ink-600'
            }`}
          >
            Banding Aktif ({escalatedCount})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-all ${
              activeTab === 'history'
                ? 'border-amber-400 text-ink-800 font-semibold'
                : 'border-transparent text-ink-400 hover:text-ink-600'
            }`}
          >
            Riwayat Process ({historyCount})
          </button>
        </div>
      </div>

      {/* Daftar Pengajuan */}
      <div className="space-y-4">
        {loading && <p className="text-sm text-ink-400">Memuat data pengajuan...</p>}
        {!loading && finalRequests.length === 0 && (
          <div className="rounded-xl border border-dashed border-ink-200 bg-white p-8 text-center">
            <p className="text-sm text-ink-400">Tidak ada pengajuan untuk kategori ini.</p>
          </div>
        )}
        {finalRequests.map((r) => (
          <RequestCard
            key={r.id}
            request={r}
            onViewAttachment={(url, title, student) => setLightbox({ url, title, student })}
            actions={
              r.status === 'pending_admin' && r.type === 'izin' ? (
                <>
                  <button
                    onClick={() => decide(r, 'approve')}
                    disabled={busyId === r.id}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 shadow-sm transition-all disabled:opacity-60"
                  >
                    Setujui & Teruskan ke Dosen
                  </button>
                  <button
                    onClick={() => decide(r, 'reject')}
                    disabled={busyId === r.id}
                    className="rounded-lg border border-rose-200 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 shadow-xs transition-all disabled:opacity-60"
                  >
                    Tolak Izin
                  </button>
                </>
              ) : r.status === 'pending_admin' && r.type === 'revisi' ? (
                <>
                  <button
                    onClick={() => decide(r, 'approve')}
                    disabled={busyId === r.id}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 shadow-sm transition-all disabled:opacity-60"
                  >
                    Setujui Revisi (Final)
                  </button>
                  <button
                    onClick={() => decide(r, 'reject')}
                    disabled={busyId === r.id}
                    className="rounded-lg border border-rose-200 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 shadow-xs transition-all disabled:opacity-60"
                  >
                    Tolak Revisi (Final)
                  </button>
                </>
              ) : r.status === 'escalated' ? (
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

      {/* Lightbox */}
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
              <div className="flex items-center gap-3">
                <a 
                  href={getImageUrl(lightbox.url)} 
                  download
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg bg-amber-400 hover:bg-amber-500 text-ink-950 px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Unduh
                </a>
                <button 
                  onClick={() => setLightbox(null)} 
                  className="text-ink-400 hover:text-ink-700 text-2xl font-bold"
                >
                  &times;
                </button>
              </div>
            </div>
            <div className="flex justify-center bg-ink-50 rounded-xl overflow-hidden p-2 max-h-[70vh]">
              {lightbox.url.endsWith('.pdf') ? (
                <div className="flex flex-col items-center justify-center p-8 text-center text-ink-500">
                  <svg className="h-16 w-16 text-rose-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <p className="font-medium text-sm">Dokumen PDF Terlampir</p>
                  <a href={getImageUrl(lightbox.url)} target="_blank" rel="noreferrer" className="mt-4 rounded-lg bg-ink-800 px-4 py-2 text-xs font-semibold text-white hover:bg-ink-700">Buka PDF di Tab Baru</a>
                </div>
              ) : (
                <img 
                  src={getImageUrl(lightbox.url)} 
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
                      <a href="${getImageUrl(lightbox.url)}" target="_blank" class="mt-4 text-xs font-semibold text-amber-500 underline">Unduh/Lihat berkas bukti</a>
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
