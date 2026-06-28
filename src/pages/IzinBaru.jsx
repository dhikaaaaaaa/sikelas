import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios.js'

export default function IzinBaru() {
  const navigate = useNavigate()
  const [classes, setClasses] = useState([])
  const [form, setForm] = useState({ classId: '', sessionDate: '', reason: '' })
  const [file, setFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/admin/classes')
      .then(res => setClasses(res.data.classes || []))
      .catch(() => {})
  }, [])

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const data = new FormData()
      Object.entries(form).forEach(([key, value]) => data.append(key, value))
      if (file) data.append('attachment', file)

      await api.post('/permissions', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <Link to="/" className="text-sm font-medium text-ink-500 hover:text-ink-800 transition-colors">
          &larr; Kembali ke Dashboard
        </Link>
      </div>

      <h1 className="font-display text-2xl font-semibold text-ink-800">Ajukan Izin Kelas</h1>
      <p className="mt-1 text-sm text-ink-500">
        Isi formulir berikut sebelum sesi kelas berlangsung. Dosen terkait akan menerima notifikasi peninjauan.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5 rounded-2xl border border-ink-100 bg-white p-6 shadow-sm">
        <div>
          <label className="block text-sm font-medium text-ink-700">Pilih Kelas</label>
          <select
            required
            value={form.classId}
            onChange={(e) => update('classId', e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-hidden transition-all"
          >
            <option value="">-- Pilih Kelas --</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink-700">Tanggal Sesi</label>
          <input
            required
            type="date"
            value={form.sessionDate}
            onChange={(e) => update('sessionDate', e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-hidden transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink-700">Alasan Izin</label>
          <textarea
            required
            rows={4}
            value={form.reason}
            onChange={(e) => update('reason', e.target.value)}
            placeholder="Jelaskan alasan izin Anda secara jelas dan ringkas (misal: sakit demam, tugas dinas luar)..."
            className="mt-1.5 w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-hidden transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink-700">Bukti Pendukung</label>
          <div className="mt-1.5 flex justify-center rounded-lg border border-dashed border-ink-200 px-6 py-6 transition-all hover:border-amber-400">
            <div className="text-center space-y-1">
              <svg className="mx-auto h-8 w-8 text-ink-300" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="flex text-sm text-ink-600">
                <label className="relative cursor-pointer rounded-md bg-white font-medium text-amber-500 focus-within:outline-hidden hover:text-amber-600">
                  <span>Pilih file</span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="sr-only"
                  />
                </label>
                <p className="pl-1">atau seret dan lepas</p>
              </div>
              <p className="text-xs text-ink-400">Gambar atau PDF hingga 5MB</p>
              {file && (
                <p className="text-xs text-emerald-600 font-medium">Terpilih: {file.name}</p>
              )}
            </div>
          </div>
        </div>

        {error && <div className="rounded-lg bg-rose-50 p-3 text-sm text-rose-600 border border-rose-100">{error}</div>}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 rounded-lg bg-ink-800 py-2.5 text-sm font-medium text-white hover:bg-ink-700 transition-all disabled:opacity-60"
          >
            {submitting ? 'Mengirim...' : 'Kirim Pengajuan'}
          </button>
          <Link
            to="/"
            className="rounded-lg border border-ink-200 px-4 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50 transition-all"
          >
            Batal
          </Link>
        </div>
      </form>
    </div>
  )
}

