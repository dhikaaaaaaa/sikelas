import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const { loginWithCustomEmail } = useAuth()
  const [showModal, setShowModal] = useState(false)
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const handleGoogleMockSubmit = (e) => {
    e.preventDefault()
    if (!email) {
      setError('Email wajib diisi')
      return
    }
    if (!email.includes('@')) {
      setError('Format email tidak valid (harus menggunakan @)')
      return
    }

    try {
      loginWithCustomEmail(email)
      setShowModal(false)
    } catch (err) {
      setError(err.message)
    }
  }

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

        <h1 className="font-display text-xl text-ink-800">Masuk ke akun kampus</h1>
        <p className="mt-1 text-sm text-ink-500">
          Gunakan akun Google kampus untuk masuk secara resmi.
        </p>

        {/* Tombol Login Resmi */}
        <button
          onClick={() => {
            setEmail('')
            setError('')
            setShowModal(true)
          }}
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

      {/* Modal Simulasi Google Sign-In */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-ink-100">
            {/* Google Logo */}
            <div className="flex justify-center mb-3">
              <svg width="32" height="32" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.13-.85 2.09-1.81 2.73v2.27h2.92c1.71-1.57 2.69-3.88 2.69-6.64z" />
                <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.27c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.71H.92v2.33A8.997 8.997 0 0 0 9 18z" />
                <path fill="#FBBC05" d="M3.97 10.7A5.41 5.41 0 0 1 3.68 9c0-.59.1-1.17.29-1.7V4.97H.92A8.997 8.997 0 0 0 0 9c0 1.45.35 2.83.92 4.03l3.05-2.33z" />
                <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A8.997 8.997 0 0 0 .92 4.97L3.97 7.3C4.68 5.16 6.66 3.58 9 3.58z" />
              </svg>
            </div>
            
            <h2 className="text-center font-display text-md font-bold text-ink-800">
              Sign in with Google
            </h2>
            <p className="text-center text-[10px] text-ink-500 mt-0.5 mb-4">
              Pilih atau ketik akun Google Kampus Anda
            </p>

            <form onSubmit={handleGoogleMockSubmit} className="space-y-3">
              {error && (
                <div className="rounded-lg bg-red-50 p-2.5 text-[11px] text-red-600 font-medium leading-relaxed">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-ink-600 uppercase tracking-wider mb-1">
                  Email Google Kampus
                </label>
                <input
                  type="text"
                  placeholder="budi@kampus.ac.id"
                  list="registered-emails"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setError('')
                  }}
                  className="w-full rounded-lg border border-ink-200 px-3 py-2 text-xs text-ink-800 placeholder-ink-400 focus:border-amber-500 focus:outline-none"
                  required
                />
                <datalist id="registered-emails">
                  <option value="naila@kampus.ac.id" />
                  <option value="bagus@kampus.ac.id" />
                  <option value="rangga@kampus.ac.id" />
                  <option value="dimas@kampus.ac.id" />
                  <option value="admin@kampus.ac.id" />
                </datalist>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-1/2 rounded-lg border border-ink-200 py-2 text-xs font-semibold text-ink-600 hover:bg-ink-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-1/2 rounded-lg bg-amber-500 py-2 text-xs font-semibold text-ink-950 hover:bg-amber-400 cursor-pointer"
                >
                  Masuk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}



