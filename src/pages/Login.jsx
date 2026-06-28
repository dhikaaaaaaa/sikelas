import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const { loginWithGoogle, loginAsDemo } = useAuth()

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

        {/* Pembatas Teks */}
        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-ink-150"></div>
          </div>
          <span className="relative bg-white px-3 text-[10px] uppercase tracking-wider font-semibold text-ink-400">
            Atau Masuk Tamu (Demo)
          </span>
        </div>

        {/* Tombol Login Tamu / Demo */}
        <div className="space-y-2">
          <button
            onClick={() => loginAsDemo('mahasiswa')}
            className="flex w-full items-center justify-between rounded-lg border border-emerald-100 bg-emerald-50/50 px-4 py-2.5 text-xs font-semibold text-emerald-800 transition-colors hover:bg-emerald-50 cursor-pointer"
          >
            <span>Masuk Sebagai Mahasiswa</span>
            <span className="text-[10px] text-emerald-600 bg-emerald-100/50 px-1.5 py-0.5 rounded font-normal">Naila Putri</span>
          </button>
          
          <button
            onClick={() => loginAsDemo('dosen')}
            className="flex w-full items-center justify-between rounded-lg border border-blue-100 bg-blue-50/50 px-4 py-2.5 text-xs font-semibold text-blue-800 transition-colors hover:bg-blue-50 cursor-pointer"
          >
            <span>Masuk Sebagai Dosen</span>
            <span className="text-[10px] text-blue-600 bg-blue-100/50 px-1.5 py-0.5 rounded font-normal">Dr. Bagus S.</span>
          </button>
          
          <button
            onClick={() => loginAsDemo('admin')}
            className="flex w-full items-center justify-between rounded-lg border border-purple-100 bg-purple-50/50 px-4 py-2.5 text-xs font-semibold text-purple-800 transition-colors hover:bg-purple-50 cursor-pointer"
          >
            <span>Masuk Sebagai Admin</span>
            <span className="text-[10px] text-purple-600 bg-purple-100/50 px-1.5 py-0.5 rounded font-normal">Akademik</span>
          </button>
        </div>
      </div>
    </div>
  )
}

