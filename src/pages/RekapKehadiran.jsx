import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../api/axios.js'

// Pemetaan kelas mahasiswa untuk filter simulasi
const STUDENT_ENROLLMENT = {
  cs101: ['2310512034', '2310512057'], // Naila, Dimas
  cs204: ['2310512034', '2310512041'], // Naila, Rangga
}

export default function RekapKehadiran() {
  const { user } = useAuth()
  const [rows, setRows] = useState([])
  const [classes, setClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState('cs101') // Bawaan CS101
  const [searchQuery, setSearchQuery] = useState('')
  const [exporting, setExporting] = useState(false)

  // Ambil data rekap dan kelas terdaftar
  useEffect(() => {
    api.get('/attendance/recap')
      .then((res) => setRows(res.data.rows || []))
      .catch(() => {})

    api.get('/admin/classes')
      .then((res) => {
        // Hanya tampilkan kelas yang diampu dosen ini
        const classesTaught = res.data.classes.filter(c => c.lecturerEmail === user?.email)
        setClasses(classesTaught)
        if (classesTaught.length > 0) {
          setSelectedClass(classesTaught[0].id)
        }
      })
      .catch(() => {})
  }, [user])

  // Filter berdasarkan kelas terdaftar
  const enrolledNims = STUDENT_ENROLLMENT[selectedClass] || []
  const classFilteredRows = rows.filter(row => enrolledNims.includes(row.nim))

  // Filter berdasarkan pencarian nama/NIM
  const filteredRows = classFilteredRows.filter(row => 
    row.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    row.nim.includes(searchQuery)
  )

  function handleExport(format) {
    const className = classes.find(c => c.id === selectedClass)?.name || selectedClass
    setExporting(true)
    setTimeout(() => {
      setExporting(false)
      alert(`Rekap Kehadiran kelas "${className}" berhasil diekspor sebagai berkas ${format.toUpperCase()}!`)
    }, 1200)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-850">Rekap Kehadiran</h1>
          <p className="text-sm text-ink-500">Ringkasan kehadiran mahasiswa terdaftar per kelas secara real-time.</p>
        </div>
        
        {/* Tombol Ekspor */}
        <div className="flex gap-2">
          <button
            onClick={() => handleExport('excel')}
            disabled={exporting}
            className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 py-2 text-xs font-semibold text-ink-700 shadow-xs hover:bg-ink-50 transition-all disabled:opacity-60"
          >
            <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Ekspor Excel
          </button>
          <button
            onClick={() => handleExport('pdf')}
            disabled={exporting}
            className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 py-2 text-xs font-semibold text-ink-700 shadow-xs hover:bg-ink-50 transition-all disabled:opacity-60"
          >
            <svg className="h-4 w-4 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Ekspor PDF
          </button>
        </div>
      </div>

      {/* Kontrol Filter Kelas & Pencarian */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white border border-ink-100 p-4 rounded-xl shadow-xs">
        <div className="flex flex-col gap-1 w-full sm:max-w-xs">
          <label className="text-xs font-semibold text-ink-500 uppercase tracking-wider">Pilih Kelas</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="mt-1 w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-hidden"
          >
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1 w-full sm:max-w-xs">
          <label className="text-xs font-semibold text-ink-500 uppercase tracking-wider">Cari Mahasiswa</label>
          <input
            type="text"
            placeholder="Masukkan Nama atau NIM..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mt-1 w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-hidden"
          />
        </div>
      </div>

      {/* Tabel Rekap */}
      <div className="overflow-hidden rounded-xl border border-ink-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-ink-50 text-ink-500 uppercase tracking-wider text-[11px] font-semibold border-b border-ink-100">
            <tr>
              <th className="px-5 py-3.5 font-medium">Nama Mahasiswa</th>
              <th className="px-5 py-3.5 font-medium">NIM</th>
              <th className="px-5 py-3.5 font-medium text-center">Hadir</th>
              <th className="px-5 py-3.5 font-medium text-center">Izin</th>
              <th className="px-5 py-3.5 font-medium text-center">Sakit</th>
              <th className="px-5 py-3.5 font-medium text-center">Alpa</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-5 py-8 text-center text-sm text-ink-400">
                  Tidak ada data mahasiswa terdaftar.
                </td>
              </tr>
            ) : (
              filteredRows.map((row) => (
                <tr key={row.nim} className="hover:bg-ink-50/40 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-ink-800">{row.name}</td>
                  <td className="px-5 py-3.5 text-ink-500 font-sans">{row.nim}</td>
                  <td className="px-5 py-3.5 text-center font-bold text-emerald-600 bg-emerald-50/20">{row.hadir}</td>
                  <td className="px-5 py-3.5 text-center font-semibold text-amber-600 bg-amber-50/20">{row.izin}</td>
                  <td className="px-5 py-3.5 text-center font-semibold text-blue-600 bg-blue-50/20">{row.sakit}</td>
                  <td className="px-5 py-3.5 text-center font-bold text-rose-650 bg-rose-50/20">{row.alpa}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

