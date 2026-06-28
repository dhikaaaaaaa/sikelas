import { useEffect, useState } from 'react'
import api from '../api/axios.js'

export default function KelolaPengguna() {
  const [users, setUsers] = useState([])
  const [showModal, setShowModal] = useState(false)
  
  // State Form Baru
  const [form, setForm] = useState({ name: '', email: '', role: 'mahasiswa', nim: '', nip: '', semester: 1, jurusan: 'Teknik Informatika' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  function fetchUsers() {
    api.get('/admin/users')
      .then((res) => setUsers(res.data.users))
      .catch(() => {})
  }

  async function updateRole(id, role) {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)))
    try {
      await api.patch(`/admin/users/${id}`, { role })
    } catch {
      // Handled by mock
    }
  }

  function handleInputChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    const payload = {
      name: form.name,
      email: form.email,
      role: form.role,
      ...(form.role === 'mahasiswa' && { 
        nim: form.nim, 
        semester: Number(form.semester) || 1, 
        jurusan: form.jurusan || 'Teknik Informatika' 
      }),
      ...(form.role === 'dosen' && { nip: form.nip }),
    }

    try {
      await api.post('/admin/users', payload)
      fetchUsers()
      setShowModal(false)
      setForm({ name: '', email: '', role: 'mahasiswa', nim: '', nip: '', semester: 1, jurusan: 'Teknik Informatika' })
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
          <h1 className="font-display text-2xl font-semibold text-ink-800">Kelola Pengguna</h1>
          <p className="mt-1 text-sm text-ink-500 font-sans">Tetapkan role mahasiswa, dosen, atau admin untuk setiap akun di sistem.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="rounded-lg bg-ink-800 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-ink-700 transition-all"
        >
          Tambah Pengguna
        </button>
      </div>

      {/* Tabel Pengguna */}
      <div className="overflow-hidden rounded-xl border border-ink-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-ink-50 text-ink-500 uppercase tracking-wider text-[11px] font-semibold">
            <tr>
              <th className="px-5 py-3 font-medium">Nama Lengkap</th>
              <th className="px-5 py-3 font-medium">Email Kampus</th>
              <th className="px-5 py-3 font-medium">Informasi Role</th>
              <th className="px-5 py-3 font-medium">Ubah Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-ink-50/45 transition-colors">
                <td className="px-5 py-3.5 font-medium text-ink-800">{u.name}</td>
                <td className="px-5 py-3.5 text-ink-500 font-sans">{u.email}</td>
                <td className="px-5 py-3.5">
                  {u.role === 'mahasiswa' && (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium font-sans w-fit">
                        Mahasiswa (NIM: {u.nim || '-'})
                      </span>
                      <span className="text-[11px] text-ink-400 font-medium pl-1">
                        {u.jurusan || 'Teknik Informatika'} · Semester {u.semester || 1}
                      </span>
                    </div>
                  )}
                  {u.role === 'dosen' && (
                    <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium font-sans">
                      Dosen (NIP: {u.nip || '-'})
                    </span>
                  )}
                  {u.role === 'admin' && (
                    <span className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full font-medium">
                      Admin Akademik
                    </span>
                  )}
                </td>
                <td className="px-5 py-3.5">
                  <select
                    value={u.role}
                    onChange={(e) => updateRole(u.id, e.target.value)}
                    className="rounded-lg border border-ink-200 bg-white px-2 py-1 text-xs text-ink-700 focus:border-amber-400 outline-hidden transition-all"
                  >
                    <option value="mahasiswa">Mahasiswa</option>
                    <option value="dosen">Dosen</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Tambah Pengguna */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-ink-100 pb-3">
              <h3 className="font-display text-lg font-semibold text-ink-850">Tambah Pengguna Baru</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-ink-400 hover:text-ink-700 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-ink-600 uppercase tracking-wider">Nama Lengkap</label>
                <input
                  required
                  type="text"
                  placeholder="Nama Lengkap..."
                  value={form.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-ink-200 px-3 py-2 text-sm text-ink-750 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-hidden transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-600 uppercase tracking-wider">Email Kampus</label>
                <input
                  required
                  type="email"
                  placeholder="name@kampus.ac.id..."
                  value={form.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-ink-200 px-3 py-2 text-sm text-ink-750 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-hidden transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-600 uppercase tracking-wider font-sans">Role Pengguna</label>
                <select
                  value={form.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-750 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-hidden transition-all"
                >
                  <option value="mahasiswa">Mahasiswa</option>
                  <option value="dosen">Dosen</option>
                  <option value="admin">Admin Akademik</option>
                </select>
              </div>

              {form.role === 'mahasiswa' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-ink-600 uppercase tracking-wider font-sans">Nomor Induk Mahasiswa (NIM)</label>
                    <input
                      required
                      type="text"
                      placeholder="23105120xx..."
                      value={form.nim}
                      onChange={(e) => handleInputChange('nim', e.target.value)}
                      className="mt-1 w-full rounded-lg border border-ink-200 px-3 py-2 text-sm text-ink-750 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-hidden transition-all font-sans"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-ink-600 uppercase tracking-wider font-sans">Semester</label>
                      <select
                        value={form.semester}
                        onChange={(e) => handleInputChange('semester', e.target.value)}
                        className="mt-1 w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-750 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-hidden transition-all"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                          <option key={s} value={s}>Semester {s}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-ink-600 uppercase tracking-wider font-sans">Jurusan</label>
                      <input
                        required
                        type="text"
                        placeholder="Teknik Informatika..."
                        value={form.jurusan}
                        onChange={(e) => handleInputChange('jurusan', e.target.value)}
                        className="mt-1 w-full rounded-lg border border-ink-200 px-3 py-2 text-sm text-ink-750 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-hidden transition-all"
                      />
                    </div>
                  </div>
                </>
              )}

              {form.role === 'dosen' && (
                <div>
                  <label className="block text-xs font-semibold text-ink-600 uppercase tracking-wider font-sans">Nomor Induk Pegawai (NIP)</label>
                  <input
                    required
                    type="text"
                    placeholder="198203012010121xxx..."
                    value={form.nip}
                    onChange={(e) => handleInputChange('nip', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-ink-200 px-3 py-2 text-sm text-ink-750 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-hidden transition-all font-sans"
                  />
                </div>
              )}

              {error && <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-600 border border-rose-100">{error}</div>}

              <div className="flex gap-2 border-t border-ink-100 pt-4 mt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-lg bg-ink-800 py-2 text-sm font-semibold text-white hover:bg-ink-700 transition-all disabled:opacity-60"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Pengguna'}
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

