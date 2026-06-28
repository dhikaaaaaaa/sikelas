import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../api/axios.js'


export default function RekapKehadiran() {
  const { user } = useAuth()
  const [rows, setRows] = useState([])
  const [classes, setClasses] = useState([])
  const [users, setUsers] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSemester, setSelectedSemester] = useState('semua')
  const [selectedJurusan, setSelectedJurusan] = useState('semua')
  const [searchQuery, setSearchQuery] = useState('')
  const [exporting, setExporting] = useState(false)

  // Ambil data rekap, kelas terdaftar, dan detail user
  useEffect(() => {
    api.get('/attendance/recap')
      .then((res) => setRows(res.data.rows || []))
      .catch(() => {})

    api.get('/admin/users')
      .then((res) => setUsers(res.data.users || []))
      .catch(() => {})

    api.get('/admin/classes')
      .then((res) => {
        // Dosen hanya melihat kelas yang diampu sendiri, sedangkan Admin melihat semua kelas
        const classesTaught = user?.role === 'admin'
          ? res.data.classes
          : res.data.classes.filter(c => c.lecturerEmail === user?.email)
        setClasses(classesTaught)
        if (classesTaught.length > 0) {
          setSelectedClass(classesTaught[0].id)
        }
      })
      .catch(() => {})
  }, [user])

  // Cari objek kelas yang sedang dipilih
  const currentClassObj = classes.find(c => c.id === selectedClass)
  const enrolledNims = currentClassObj?.studentNims || []

  // Gabungkan data kehadiran dengan informasi semester & jurusan dari tabel users
  const enrichedRows = rows.map(row => {
    const studentUser = users.find(u => u.nim === row.nim)
    return {
      ...row,
      semester: studentUser?.semester || 1,
      jurusan: studentUser?.jurusan || 'Teknik Informatika'
    }
  })

  // 1. Filter mahasiswa terdaftar di kelas terpilih
  const classFilteredRows = enrichedRows.filter(row => enrolledNims.includes(row.nim))

  // 2. Filter berdasarkan Semester
  const semesterFilteredRows = classFilteredRows.filter(row => 
    selectedSemester === 'semua' || String(row.semester) === selectedSemester
  )

  // 3. Filter berdasarkan Jurusan
  const jurusanFilteredRows = semesterFilteredRows.filter(row => 
    selectedJurusan === 'semua' || row.jurusan.toLowerCase() === selectedJurusan.toLowerCase()
  )

  // 4. Filter berdasarkan pencarian nama/NIM
  const filteredRows = jurusanFilteredRows.filter(row => 
    row.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    row.nim.includes(searchQuery)
  )

  // Dapatkan opsi dinamis untuk Semester & Jurusan
  const uniqueSemesters = Array.from(
    new Set(
      users
        .filter(u => u.role === 'mahasiswa' && u.nim && enrolledNims.includes(u.nim))
        .map(u => u.semester)
        .filter(Boolean)
    )
  ).sort((a, b) => a - b)

  const uniqueJurusans = Array.from(
    new Set(
      users
        .filter(u => u.role === 'mahasiswa' && u.nim && enrolledNims.includes(u.nim))
        .map(u => u.jurusan)
        .filter(Boolean)
    )
  ).sort()

  function handleExport(format) {
    const className = currentClassObj?.name || selectedClass
    setExporting(true)
    
    if (format === 'excel') {
      setTimeout(() => {
        // Pembuatan file CSV kompatibel Excel
        const headers = ['Nama Mahasiswa', 'NIM', 'Semester', 'Jurusan', 'Hadir', 'Izin', 'Sakit', 'Alpa']
        const csvRows = [headers.join(';')]
        
        filteredRows.forEach(row => {
          const line = [
            `"${row.name.replace(/"/g, '""')}"`,
            `"${row.nim}"`,
            row.semester,
            `"${row.jurusan.replace(/"/g, '""')}"`,
            row.hadir,
            row.izin,
            row.sakit,
            row.alpa
          ]
          csvRows.push(line.join(';'))
        })
        
        const csvContent = '\uFEFF' + csvRows.join('\n') // UTF-8 BOM agar terbaca karakter khusus
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        
        const link = document.createElement('a')
        link.setAttribute('href', url)
        link.setAttribute('download', `rekap_kehadiran_${className.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        setExporting(false)
      }, 1000)
    } else {
      setTimeout(() => {
        setExporting(false)
        window.print()
      }, 500)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-850">Rekap Kehadiran</h1>
          <p className="text-sm text-ink-500">Ringkasan kehadiran mahasiswa terdaftar per kelas secara real-time.</p>
        </div>
        
        {/* Tombol Ekspor */}
        <div className="flex gap-2">
          <button
            onClick={() => handleExport('excel')}
            disabled={exporting || filteredRows.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 py-2 text-xs font-semibold text-ink-700 shadow-xs hover:bg-ink-50 transition-all disabled:opacity-50 cursor-pointer"
          >
            <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {exporting ? 'Mengekspor...' : 'Ekspor Excel'}
          </button>
          <button
            onClick={() => handleExport('pdf')}
            disabled={exporting || filteredRows.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 py-2 text-xs font-semibold text-ink-700 shadow-xs hover:bg-ink-50 transition-all disabled:opacity-50 cursor-pointer"
          >
            <svg className="h-4 w-4 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Ekspor PDF (Cetak)
          </button>
        </div>
      </div>

      {/* Kontrol Filter & Pencarian */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 bg-white border border-ink-100 p-4 rounded-xl shadow-xs print:hidden">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-ink-500 uppercase tracking-wider">Pilih Kelas</label>
          <select
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value)
              setSelectedSemester('semua')
              setSelectedJurusan('semua')
            }}
            className="mt-1 w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-hidden"
          >
            {classes.length === 0 && <option value="">-- Tidak ada kelas --</option>}
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-ink-500 uppercase tracking-wider">Pilih Semester</label>
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="mt-1 w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-770 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-hidden"
          >
            <option value="semua">Semua Semester</option>
            {uniqueSemesters.map(s => (
              <option key={s} value={String(s)}>Semester {s}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-ink-500 uppercase tracking-wider">Pilih Jurusan</label>
          <select
            value={selectedJurusan}
            onChange={(e) => setSelectedJurusan(e.target.value)}
            className="mt-1 w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-770 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-hidden"
          >
            <option value="semua">Semua Jurusan</option>
            {uniqueJurusans.map(j => (
              <option key={j} value={j}>{j}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
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

      {/* Identitas Kelas saat Cetak */}
      <div className="hidden print:block border-b border-ink-200 pb-3">
        <h2 className="text-xl font-bold text-ink-850">Laporan Rekapitulasi Kehadiran Mahasiswa</h2>
        <p className="text-sm text-ink-500">Kelas: <span className="font-semibold">{currentClassObj?.name}</span></p>
        <p className="text-sm text-ink-500">Dosen Pengampu: <span className="font-semibold">{currentClassObj?.lecturer} ({currentClassObj?.lecturerEmail})</span></p>
      </div>

      {/* Tabel Rekap */}
      <div className="overflow-hidden rounded-xl border border-ink-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-ink-50 text-ink-500 uppercase tracking-wider text-[11px] font-semibold border-b border-ink-100">
            <tr>
              <th className="px-5 py-3.5 font-medium">Nama Mahasiswa</th>
              <th className="px-5 py-3.5 font-medium">NIM</th>
              <th className="px-5 py-3.5 font-medium">Semester</th>
              <th className="px-5 py-3.5 font-medium">Jurusan</th>
              <th className="px-5 py-3.5 font-medium text-center">Hadir</th>
              <th className="px-5 py-3.5 font-medium text-center">Izin</th>
              <th className="px-5 py-3.5 font-medium text-center">Sakit</th>
              <th className="px-5 py-3.5 font-medium text-center">Alpa</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-5 py-8 text-center text-sm text-ink-400">
                  Tidak ada data mahasiswa terdaftar yang sesuai.
                </td>
              </tr>
            ) : (
              filteredRows.map((row) => (
                <tr key={row.nim} className="hover:bg-ink-50/40 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-ink-800">{row.name}</td>
                  <td className="px-5 py-3.5 text-ink-500 font-sans">{row.nim}</td>
                  <td className="px-5 py-3.5 text-ink-500 font-sans">Sem {row.semester}</td>
                  <td className="px-5 py-3.5 text-ink-500 font-sans text-xs">{row.jurusan}</td>
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


