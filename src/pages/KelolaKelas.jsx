import { useEffect, useState } from 'react'
import api from '../api/axios.js'

export default function KelolaKelas() {
  const [classes, setClasses] = useState([])
  const [lecturers, setLecturers] = useState([])
  const [showModal, setShowModal] = useState(false)
  
  // State Form Baru
  const [form, setForm] = useState({ code: '', name: '', lecturerEmail: '', students: 30 })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchClasses()
    fetchLecturers()
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

  function handleInputChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
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
      students: Number(form.students) || 30
    }

    try {
      await api.post('/admin/classes', payload)
      fetchClasses()
      setShowModal(false)
      setForm({ code: '', name: '', lecturerEmail: lecturers[0]?.email || '', students: 30 })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-800">Kelola Kelas</h1>
          <p className="mt-1 text-sm text-ink-500 font-sans">Daftar kelas aktif, dosen pengampu, dan jumlah mahasiswa yang terdaftar.</p>
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
            <h3 className="font-display text-lg font-medium text-ink-800">{c.name}</h3>
            <div className="mt-3 space-y-1 text-sm text-ink-500 font-sans">
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
                {c.students} Mahasiswa terdaftar
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Tambah Kelas */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
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
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
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
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-ink-600 uppercase tracking-wider">Nama Mata Kuliah</label>
                  <input
                    required
                    type="text"
                    placeholder="Jaringan Komputer..."
                    value={form.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-ink-200 px-3 py-2 text-sm text-ink-750 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-hidden transition-all"
                  />
                </div>
              </div>

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

              <div>
                <label className="block text-xs font-semibold text-ink-600 uppercase tracking-wider font-sans">Kuota Mahasiswa Terdaftar</label>
                <input
                  required
                  type="number"
                  placeholder="30"
                  min="1"
                  value={form.students}
                  onChange={(e) => handleInputChange('students', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-ink-200 px-3 py-2 text-sm text-ink-750 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-hidden transition-all font-sans"
                />
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

