import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios.js'

export default function IzinBaru() {
  const navigate = useNavigate()
  const [classes, setClasses] = useState([])
  const [form, setForm] = useState({ classId: '', sessionDate: '', reason: '' })
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [isDragActive, setIsDragActive] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/admin/classes')
      .then(res => setClasses(res.data.classes || []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null)
      return
    }
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      return () => URL.revokeObjectURL(url)
    }
  }, [file])

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true)
    } else if (e.type === "dragleave") {
      setIsDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const data = new FormData()
      Object.entries(form).forEach(([key, value]) => data.append(key, value))
      if (file) data.append('attachment', file)

      await api.post('/permissions', data)
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
        Isi formulir berikut sebelum sesi kelas berlangsung. Pengajuan akan ditinjau oleh Admin/FIR Paramadina terlebih dahulu, lalu diteruskan ke Dosen terkait.
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
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`mt-1.5 flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-all duration-200 ${
              isDragActive
                ? 'border-amber-500 bg-amber-50/40 shadow-inner'
                : file
                ? 'border-emerald-400 bg-emerald-50/10'
                : 'border-ink-200 hover:border-amber-400 bg-white'
            }`}
          >
            <div className="text-center space-y-2 w-full flex flex-col items-center">
              {previewUrl ? (
                <div className="relative group w-32 h-32 rounded-lg overflow-hidden border border-emerald-200 shadow-md">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 shadow-md transition-colors"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ) : file ? (
                <div className="flex items-center gap-3 bg-emerald-50/50 border border-emerald-200 rounded-xl p-3 w-full max-w-sm">
                  <svg className="h-8 w-8 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div className="text-left min-w-0 flex-1">
                    <p className="text-xs font-semibold text-emerald-800 truncate">{file.name}</p>
                    <p className="text-[10px] text-emerald-600">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="text-rose-500 hover:text-rose-700 text-xs font-bold px-2 py-1 transition-colors"
                  >
                    Batal
                  </button>
                </div>
              ) : (
                <>
                  <svg className={`mx-auto h-10 w-10 transition-colors ${isDragActive ? 'text-amber-500 animate-bounce' : 'text-ink-300'}`} stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="flex text-sm text-ink-600 justify-center">
                    <label className="relative cursor-pointer rounded-md font-semibold text-amber-500 hover:text-amber-600 focus-within:outline-hidden">
                      <span>Pilih file</span>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => setFile(e.target.files[0])}
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1">atau seret dan lepas di sini</p>
                  </div>
                  <p className="text-xs text-ink-400">Gambar atau PDF hingga 5MB</p>
                </>
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

