import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import NotificationBell from './NotificationBell.jsx'
import logoParamadina from '../assets/Logo_Universitas_Paramadna.png'

const NAV_BY_ROLE = {
  mahasiswa: [
    { to: '/', label: 'Ringkasan' },
    { to: '/izin/baru', label: 'Ajukan Izin' },
    { to: '/revisi/baru', label: 'Ajukan Revisi Kehadiran' },
  ],
  dosen: [
    { to: '/', label: 'Pengajuan Masuk' },
    { to: '/rekap', label: 'Rekap Kehadiran' },
  ],
  admin: [
    { to: '/', label: 'Dashboard Admin (FIR)' },
    { to: '/rekap', label: 'Rekap Kehadiran' },
    { to: '/pengguna', label: 'Kelola Pengguna' },
    { to: '/kelas', label: 'Kelola Kelas' },
  ],
}

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const nav = NAV_BY_ROLE[user?.role] || []

  return (
    <div className="flex min-h-screen">
      {/* Sidebar Navigasi */}
      <aside className="flex w-64 flex-col justify-between bg-ink-800 px-5 py-6 text-ink-100 shrink-0">
        <div>
          <div className="mb-8 flex items-center gap-3">
            <img 
              src={logoParamadina} 
              alt="Logo Paramadina" 
              className="h-10 w-auto object-contain rounded-md bg-white/10 p-1"
            />
            <div>
              <p className="font-display text-base leading-tight text-white font-semibold">SIKELAS</p>
              <p className="text-[10px] uppercase tracking-wider text-ink-300">Izin & Kehadiran</p>
            </div>
          </div>

          <nav className="space-y-1">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `block rounded-md px-3 py-2 text-sm font-medium transition-all ${
                    isActive ? 'bg-ink-700 text-white' : 'text-ink-200 hover:bg-ink-700/60 hover:text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="border-t border-ink-700 pt-4">
          <p className="truncate text-sm font-medium text-white">{user?.name}</p>
          <p className="truncate text-xs text-ink-300 font-sans">{user?.email}</p>
          <span className="mt-2 inline-block rounded-full bg-ink-700 px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold text-amber-300">
            {user?.role}
          </span>
          <button
            onClick={logout}
            className="mt-4 w-full rounded-md border border-ink-600 py-2 text-xs font-semibold text-ink-200 hover:bg-ink-700 transition-all cursor-pointer"
          >
            Keluar
          </button>
        </div>
      </aside>

      {/* Area Konten Utama */}
      <div className="flex-1 flex flex-col bg-ink-50">
        {/* Top Header Bar dengan Notification Bell */}
        <header className="flex items-center justify-between border-b border-ink-200/70 bg-white px-8 py-3.5 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            <p className="text-xs font-medium text-ink-500">
              Sistem Perizinan Akademik Online
            </p>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <div className="h-4 w-px bg-ink-200"></div>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 font-display text-xs font-bold text-amber-800">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <span className="text-xs font-semibold text-ink-800">{user?.name}</span>
            </div>
          </div>
        </header>

        {/* Konten Halaman */}
        <main className="flex-1 px-10 py-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}

