import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const { loginWithGoogle, loginWithEmail } = useAuth()
  const [error, setError] = useState('')
  const [showBypass, setShowBypass] = useState(false)
  const [emailInput, setEmailInput] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('error') === 'not_registered') {
      setError('Email Google Anda belum didaftarkan oleh admin. Silakan hubungi Fakultas.')
    } else if (params.get('error') === 'oauth_not_configured') {
      setError('Google OAuth Client ID belum dikonfigurasi di backend/.env. Silakan gunakan fitur Login Manual (Bypass OAuth) di bawah ini.')
      setShowBypass(true)
    }
  }, [])

  const handleBypassLogin = async (e) => {
    e.preventDefault()
    if (!emailInput) return
    setLoading(true)
    setError('')
    try {
      await loginWithEmail(emailInput)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl border border-slate-100">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-400 font-display text-2xl font-bold text-slate-900 shadow-md">
            S
          </div>
          <div>
            <p className="font-display text-xl leading-tight text-slate-900 font-bold tracking-tight">SIKELAS</p>
            <p className="text-xs text-slate-500 font-medium">Sistem Izin Kelas & Revisi Kehadiran</p>
          </div>
        </div>

        <h1 className="font-display text-2xl font-bold text-slate-800">Masuk ke akun SIKELAS</h1>
        <p className="mt-1 text-sm text-slate-500">
          Silakan masuk menggunakan akun Google Anda.
        </p>

        {error && (
          <div className="mt-4 rounded-xl bg-rose-50 p-3 text-xs text-rose-600 border border-rose-200 flex items-start gap-2">
            <span className="font-bold text-rose-500">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Tombol Login Google Resmi */}
        <button
          onClick={loginWithGoogle}
          className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-400 active:scale-[0.99] cursor-pointer shadow-sm"
        >
          <svg width="19" height="19" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.13-.85 2.09-1.81 2.73v2.27h2.92c1.71-1.57 2.69-3.88 2.69-6.64z" />
            <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.27c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.71H.92v2.33A8.997 8.997 0 0 0 9 18z" />
            <path fill="#FBBC05" d="M3.97 10.7A5.41 5.41 0 0 1 3.68 9c0-.59.1-1.17.29-1.7V4.97H.92A8.997 8.997 0 0 0 0 9c0 1.45.35 2.83.92 4.03l3.05-2.33z" />
            <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A8.997 8.997 0 0 0 .92 4.97L3.97 7.3C4.68 5.16 6.66 3.58 9 3.58z" />
          </svg>
          Masuk dengan Google
        </button>

        {/* Bypass Option */}
        <div className="mt-6 text-center">
          <button
            onClick={() => setShowBypass(!showBypass)}
            className="text-xs font-semibold text-slate-400 hover:text-slate-500 transition-colors"
          >
            {showBypass ? 'Sembunyikan login manual' : 'Atau masuk secara manual (Bypass OAuth)'}
          </button>
        </div>

        {showBypass && (
          <form onSubmit={handleBypassLogin} className="mt-4 flex gap-2">
            <input
              type="email"
              placeholder="Masukkan email mahasiswa/dosen..."
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="flex-1 rounded-xl border border-slate-300 px-3.5 py-2 text-xs focus:border-amber-500 focus:outline-none"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
            >
              {loading ? '...' : 'Masuk'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}






