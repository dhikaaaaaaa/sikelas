import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const { loginWithGoogle, loginWithCustomEmail } = useAuth()
  const [error, setError] = useState('')
  
  // Ambil error parameter dari URL jika ada
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('error') === 'not_registered') {
      setError('Email Google Anda belum didaftarkan oleh admin. Silakan hubungi Fakultas.')
    }
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-800 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-400 font-display text-lg font-semibold text-ink-900">
            S
          </div>
          <div>
            <p className="font-display text-lg leading-tight text-ink-800 font-semibold">SIKELAS</p>
            <p className="text-xs text-ink-400">Izin kelas & revisi kehadiran</p>
          </div>
        </div>

        <h1 className="font-display text-xl text-ink-850">Masuk ke akun kampus</h1>
        <p className="mt-1 text-sm text-ink-500">
          Gunakan akun Google kampus untuk masuk secara resmi.
        </p>

        {error && <div className="mt-4 rounded-lg bg-rose-50 p-3 text-xs text-rose-600 border border-rose-100">{error}</div>}

        {/* Tombol Login Resmi */}
        <button
          onClick={loginWithGoogle}
          className="mt-6 flex w-full items-center justify-center gap-3 rounded-lg border border-ink-200 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50 cursor-pointer"
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.13-.85 2.09-1.81 2.73v2.27h2.92c1.71-1.57 2.69-3.88 2.69-6.64z" />
            <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.27c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.71H.92v2.33A8.997 8.997 0 0 0 9 18z" />
            <path fill="#FBBC05" d="M3.97 10.7A5.41 5.41 0 0 1 3.68 9c0-.59.1-1.17.29-1.7V4.97H.92A8.997 8.997 0 0 0 0 9c0 1.45.35 2.83.92 4.03l3.05-2.33z" />
            <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A8.997 8.997 0 0 0 .92 4.97L3.97 7.3C4.68 5.16 6.66 3.58 9 3.58z" />
          </svg>
          Masuk dengan Google
        </button>
      </div>
    </div>
  )
}





