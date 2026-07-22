import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../api/axios.js'
import { storage } from '../utils/storage.js'

export default function Profil() {
  const { user, setUser } = useAuth()

  const [form, setForm] = useState({
    name: user?.name || '',
    nim: user?.nim || '',
    nip: user?.nip || '',
    jurusan: user?.jurusan || 'Teknik Informatika',
    semester: user?.semester || 3,
  })

  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [recap, setRecap] = useState(null)
  const [classesTaught, setClassesTaught] = useState([])

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        nim: user.nim || '',
        nip: user.nip || '',
        jurusan: user.jurusan || 'Teknik Informatika',
        semester: user.semester || 3,
      })

      if (user.role === 'mahasiswa') {
        api.get('/attendance/recap')
          .then(res => {
            const row = (res.data.rows || []).find(r => r.nim === user.nim)
            setRecap(row || null)
          })
          .catch(() => {})
      } else if (user.role === 'dosen') {
        api.get('/admin/classes')
          .then(res => {
            const list = (res.data.classes || []).filter(c => c.lecturerEmail === user.email)
            setClassesTaught(list)
          })
          .catch(() => {})
      }
    }
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    setError('')

    try {
      const res = await api.put('/auth/profile', form)
      const updatedUser = res.data.user
      setUser(updatedUser)
      setMessage('Profil Anda berhasil diperbarui!')
    } catch (err) {
      // Fallback update to storage
      const updatedLocal = storage.updateProfile(user.email, form)
      if (updatedLocal) {
        setUser({ ...user, ...form })
        setMessage('Profil berhasil diperbarui!')
      } else {
        setError(err.message || 'Gagal memperbarui profil.')
      }
    } finally {
      setSaving(false)
    }
  }

  const roleLabels = {
    mahasiswa: 'Mahasiswa Paramadina',
    dosen: 'Dosen Pengampu',
    admin: 'Administrator / FIR',
  }

  const roleColors = {
    mahasiswa: 'bg-amber-100 text-amber-800 border-amber-300',
    dosen: 'bg-sky-100 text-sky-800 border-sky-300',
    admin: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Halaman */}
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-850">Profil Saya</h1>
        <p className="text-xs text-ink-500 mt-1">
          Kelola informasi identitas akun, status akademik, dan pengaturan profil Anda di SIKELAS.
        </p>
      </div>

      {/* Kartu Profil Utama */}
      <div className="bg-white rounded-2xl border border-ink-100 shadow-xs overflow-hidden">
        {/* Banner Atas */}
        <div className="h-28 bg-gradient-to-r from-ink-800 via-ink-700 to-amber-700 p-6 flex items-end">
          <span className={`px-3 py-1 text-xs font-semibold rounded-full border shadow-xs ${roleColors[user?.role] || 'bg-white text-ink-800'}`}>
            {roleLabels[user?.role] || user?.role}
          </span>
        </div>

        <div className="px-6 pb-6 pt-0 relative">
          {/* Avatar & Identitas Singkat */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-12 mb-6 gap-4">
            <div className="flex items-end gap-4">
              <div className="h-20 w-20 rounded-2xl bg-amber-400 border-4 border-white shadow-md flex items-center justify-center font-display text-2xl font-bold text-ink-900 shrink-0">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-ink-900">{user?.name}</h2>
                <p className="text-xs text-ink-500 font-medium">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Alert Message */}
          {message && (
            <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-medium text-emerald-800 flex items-center gap-2">
              <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              {message}
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-medium text-rose-800 flex items-center gap-2">
              <svg className="h-4 w-4 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              {error}
            </div>
          )}

          {/* Informasi Khusus Per Role */}
          {user?.role === 'mahasiswa' && recap && (
            <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl bg-emerald-50 p-3.5 border border-emerald-100 text-center">
                <p className="text-[10px] uppercase font-bold text-emerald-700">Hadir</p>
                <p className="text-xl font-bold text-emerald-900 mt-1">{recap.hadir || 0}</p>
              </div>
              <div className="rounded-xl bg-amber-50 p-3.5 border border-amber-100 text-center">
                <p className="text-[10px] uppercase font-bold text-amber-700">Izin</p>
                <p className="text-xl font-bold text-amber-900 mt-1">{recap.izin || 0}</p>
              </div>
              <div className="rounded-xl bg-sky-50 p-3.5 border border-sky-100 text-center">
                <p className="text-[10px] uppercase font-bold text-sky-700">Sakit</p>
                <p className="text-xl font-bold text-sky-900 mt-1">{recap.sakit || 0}</p>
              </div>
              <div className="rounded-xl bg-rose-50 p-3.5 border border-rose-100 text-center">
                <p className="text-[10px] uppercase font-bold text-rose-700">Alpa</p>
                <p className="text-xl font-bold text-rose-900 mt-1">{recap.alpa || 0}</p>
              </div>
            </div>
          )}

          {user?.role === 'dosen' && classesTaught.length > 0 && (
            <div className="mb-6 rounded-xl bg-sky-50/70 border border-sky-100 p-4">
              <h4 className="text-xs font-bold text-sky-900 uppercase tracking-wider mb-2">Kelas yang Diampu</h4>
              <div className="flex flex-wrap gap-2">
                {classesTaught.map(c => (
                  <span key={c.id || c._id} className="rounded-lg bg-white px-3 py-1 text-xs font-semibold text-sky-800 shadow-xs border border-sky-200">
                    {c.name} ({c.students || 0} Mahasiswa)
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Form Edit Profil */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-ink-100">
            <h3 className="font-display text-sm font-bold text-ink-850">Sunting Data Profil</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ink-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full rounded-lg border border-ink-200 px-3 py-2 text-xs focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-700 mb-1">Alamat Email (Akun)</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full rounded-lg border border-ink-200 bg-ink-50 px-3 py-2 text-xs text-ink-500 cursor-not-allowed"
                />
              </div>

              {user?.role === 'mahasiswa' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-ink-700 mb-1">Nomor Induk Mahasiswa (NIM)</label>
                    <input
                      type="text"
                      value={form.nim}
                      onChange={(e) => setForm({ ...form, nim: e.target.value })}
                      placeholder="Contoh: 2310512099"
                      className="w-full rounded-lg border border-ink-200 px-3 py-2 text-xs focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink-700 mb-1">Program Studi / Jurusan</label>
                    <input
                      type="text"
                      value={form.jurusan}
                      onChange={(e) => setForm({ ...form, jurusan: e.target.value })}
                      className="w-full rounded-lg border border-ink-200 px-3 py-2 text-xs focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink-700 mb-1">Semester Aktif</label>
                    <select
                      value={form.semester}
                      onChange={(e) => setForm({ ...form, semester: e.target.value })}
                      className="w-full rounded-lg border border-ink-200 px-3 py-2 text-xs focus:border-amber-400 focus:outline-none"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                        <option key={s} value={s}>Semester {s}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {user?.role === 'dosen' && (
                <div>
                  <label className="block text-xs font-semibold text-ink-700 mb-1">Nomor Induk Pegawai (NIP)</label>
                  <input
                    type="text"
                    value={form.nip}
                    onChange={(e) => setForm({ ...form, nip: e.target.value })}
                    placeholder="Contoh: 198203012010121001"
                    className="w-full rounded-lg border border-ink-200 px-3 py-2 text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>
              )}
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-amber-400 hover:bg-amber-500 text-ink-950 font-semibold px-5 py-2.5 text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {saving ? 'Menyimpan...' : 'Simpan Perubahan Profil'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
