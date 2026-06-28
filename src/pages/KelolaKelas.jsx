import { useEffect, useState } from 'react'
import api from '../api/axios.js'

// Database mata kuliah per semester (kurikulum umum)
const MATKUL_PER_SEMESTER = {
  1: ['Kalkulus I', 'Algoritma & Pemrograman', 'Bahasa Indonesia', 'Pendidikan Pancasila', 'Fisika Dasar', 'Pengenalan Sistem Komputer'],
  2: ['Kalkulus II', 'Struktur Data', 'Aljabar Linear', 'Bahasa Inggris Teknik', 'Logika Matematika', 'Sistem Operasi'],
  3: ['Basis Data', 'Pemrograman Berorientasi Objek', 'Matematika Diskrit', 'Sistem Digital', 'Probabilitas & Statistika', 'Arsitektur Komputer'],
  4: ['Jaringan Komputer', 'Rekayasa Perangkat Lunak', 'Analisis & Desain Algoritma', 'Pemrograman Web', 'Kecerdasan Buatan', 'Grafika Komputer'],
  5: ['Keamanan Informasi', 'Manajemen Proyek TI', 'Pemrosesan Bahasa Alami', 'Machine Learning', 'Cloud Computing', 'Mobile Programming'],
  6: ['Sistem Terdistribusi', 'Data Mining', 'Interaksi Manusia-Komputer', 'Etika Profesi TI', 'Analitik Data', 'IoT & Embedded System'],
  7: ['Skripsi Proposal', 'Topik Khusus I', 'Magang / Kerja Praktik', 'Seminar Riset', 'Sistem Informasi Manajemen'],
  8: ['Skripsi / Tugas Akhir', 'Topik Khusus II', 'Kolokium', 'Publikasi Ilmiah'],
}

export default function KelolaKelas() {
  const [classes, setClasses] = useState([])
  const [lecturers, setLecturers] = useState([])
  const [allStudents, setAllStudents] = useState([])
  const [selectedStudentNims, setSelectedStudentNims] = useState([])
  const [showModal, setShowModal] = useState(false)
  
  // State Form Baru
  const [form, setForm] = useState({ code: '', name: '', lecturerEmail: '', students: 30, semester: 1 })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Mata kuliah tersedia berdasarkan semester yang dipilih
  const availableMatkul = MATKUL_PER_SEMESTER[form.semester] || []

  useEffect(() => {
    fetchClasses()
    fetchLecturers()
    fetchStudents()
  }, [])

  function fetchClasses() {
    api.get('/admin/classes')
      .then((res) => setClasses(res.data.classes || []))
      .catch(() => {})
  }

  function fetchLecturers() {
    api.get('/admin/users')
      .then((res) => {
        const list = res.data.users.filter(u => u.role === 'dosen')
        setLecturers(list)
        if (list.length > 0) {
          setForm(prev => ({ ...prev, lecturerEmail: list[0].email }))
        }
      })
      .catch(() => {})
  }

  function fetchStudents() {
    api.get('/admin/users')
      .then((res) => {
        const list = res.data.users.filter(u => u.role === 'mahasiswa')
        setAllStudents(list)
      })
      .catch(() => {})
  }

  function handleInputChange(field, value) {
    if (field === 'semester') {
      // Reset mata kuliah bila semester berubah
      setForm(prev => ({ ...prev, semester: Number(value), name: '' }))
    } else {
      setForm(prev => ({ ...prev, [field]: value }))
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    const selectedLect = lecturers.find(l => l.email === form.lecturerEmail)
    const payload = {
      name: `${form.code.toUpperCase()} — ${form.name}`,
      lecturer: selectedLect ? selectedLect.name : 'Dosen Tidak Dikenal',
      lecturerEmail: form.lecturerEmail,
      students: selectedStudentNims.length || Number(form.students) || 30,
      studentNims: selectedStudentNims,
      semester: Number(form.semester) || 1,
    }

    try {
      await api.post('/admin/classes', payload)
      fetchClasses()
      setShowModal(false)
      setForm({ code: '', name: '', lecturerEmail: lecturers[0]?.email || '', students: 30, semester: 1 })
      setSelectedStudentNims([])
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  // Badge warna per semester
  const semesterColor = (sem) => {
    const colors = ['bg-violet-100 text-violet-700','bg-blue-100 text-blue-700','bg-emerald-100 text-emerald-700','bg-amber-100 text-amber-700','bg-orange-100 text-orange-700','bg-rose-100 text-rose-700','bg-indigo-100 text-indigo-700','bg-pink-100 text-pink-700']
    return colors[(sem - 1) % colors.length] || 'bg-ink-100 text-ink-600'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-800">Kelola Kelas</h1>
          <p className="mt-1 text-sm text-ink-500 font-sans">Daftar kelas aktif, dosen pengampu, semester, dan jumlah mahasiswa terdaftar.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="rounded-lg bg-ink-800 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-ink-700 transition-all"
        >
          Tambah Kelas
        </button>
      </div>

      {/* Grid Kelas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {classes.map((c) => (
          <div key={c.id} className="rounded-xl border border-ink-100 bg-white p-5 shadow-xs transition-all hover:shadow-sm">
            <div className="flex items-start justify-between gap-2 mb-3">
              <h3 className="font-display text-lg font-medium text-ink-800">{c.name}</h3>
              {c.semester && (
                <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${semesterColor(c.semester)}`}>
                  Sem {c.semester}
                </span>
              )}
            </div>
            <div className="space-y-1 text-sm text-ink-500 font-sans">
              <p className="flex items-center gap-1.5">
                <svg className="h-4 w-4 text-ink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Dosen: <span className="font-medium text-ink-700">{c.lecturer}</span>
              </p>
              <p className="flex items-center gap-1.5">
                <svg className="h-4 w-4 text-ink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {(c.studentNims || []).length} Mahasiswa terdaftar
              </p>
              {c.studentNims && c.studentNims.length > 0 && (
                <div className="mt-2 text-xs font-sans text-ink-400">
                  <span className="font-semibold text-ink-650">NIM Mahasiswa:</span> {c.studentNims.join(', ')}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Tambah Kelas */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-ink-100 pb-3">
              <h3 className="font-display text-lg font-semibold text-ink-850">Tambah Kelas Baru</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-ink-400 hover:text-ink-700 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              {/* Baris: Kode + Semester */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-ink-600 uppercase tracking-wider font-sans">Kode Kelas</label>
                  <input
                    required
                    type="text"
                    placeholder="CS302"
                    value={form.code}
                    onChange={(e) => handleInputChange('code', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-ink-200 px-3 py-2 text-sm text-ink-750 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-hidden transition-all uppercase font-sans"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink-600 uppercase tracking-wider font-sans">Semester</label>
                  <select
                    required
                    value={form.semester}
                    onChange={(e) => handleInputChange('semester', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-750 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-hidden transition-all"
                  >
                    {[1,2,3,4,5,6,7,8].map(s => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Nama Mata Kuliah — dropdown dinamis */}
              <div>
                <label className="block text-xs font-semibold text-ink-600 uppercase tracking-wider">Nama Mata Kuliah</label>
                <select
                  required
                  value={form.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-750 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-hidden transition-all"
                >
                  <option value="">-- Pilih Mata Kuliah Semester {form.semester} --</option>
                  {availableMatkul.map(mk => (
                    <option key={mk} value={mk}>{mk}</option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-ink-400 font-sans">{availableMatkul.length} mata kuliah tersedia untuk Semester {form.semester}</p>
              </div>

              {/* Dosen */}
              <div>
                <label className="block text-xs font-semibold text-ink-600 uppercase tracking-wider">Dosen Pengampu</label>
                <select
                  required
                  value={form.lecturerEmail}
                  onChange={(e) => handleInputChange('lecturerEmail', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-750 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-hidden transition-all"
                >
                  <option value="">-- Pilih Dosen --</option>
                  {lecturers.map(l => (
                    <option key={l.id} value={l.email}>{l.name} ({l.email})</option>
                  ))}
                </select>
              </div>

              {/* Mahasiswa */}
              <div>
                <label className="block text-xs font-semibold text-ink-600 uppercase tracking-wider mb-2 font-sans">
                  Daftarkan Mahasiswa Ke Kelas Ini
                </label>
                <div className="max-h-40 overflow-y-auto rounded-lg border border-ink-200 p-2.5 space-y-2 bg-ink-50/50">
                  {allStudents.length === 0 ? (
                    <p className="text-xs text-ink-400 p-2">Belum ada mahasiswa terdaftar.</p>
                  ) : (
                    allStudents.map(student => (
                      <label key={student.nim} className="flex items-center gap-2 text-xs text-ink-750 cursor-pointer hover:bg-ink-100/50 p-1 rounded-sm">
                        <input
                          type="checkbox"
                          checked={selectedStudentNims.includes(student.nim)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedStudentNims(prev => [...prev, student.nim])
                            } else {
                              setSelectedStudentNims(prev => prev.filter(nim => nim !== student.nim))
                            }
                          }}
                          className="rounded border-ink-300 text-amber-500 focus:ring-amber-550 h-3.5 w-3.5"
                        />
                        <span className="font-semibold">{student.name}</span>
                        <span className="text-ink-400 font-sans">({student.nim})</span>
                        <span className="text-ink-400 font-sans text-[10px] bg-ink-100 px-1.5 py-0.5 rounded-full ml-auto">
                          Sem {student.semester || 1}
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              {error && <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-600 border border-rose-100">{error}</div>}

              <div className="flex gap-2 border-t border-ink-100 pt-4 mt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-lg bg-ink-800 py-2 text-sm font-semibold text-white hover:bg-ink-700 transition-all disabled:opacity-60"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Kelas'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-ink-200 px-4 py-2 text-sm font-semibold text-ink-700 hover:bg-ink-50 transition-all"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
