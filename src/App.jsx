import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import Layout from './components/Layout.jsx'
import Login from './pages/Login.jsx'
import MahasiswaDashboard from './pages/MahasiswaDashboard.jsx'
import IzinBaru from './pages/IzinBaru.jsx'
import RevisiBaru from './pages/RevisiBaru.jsx'
import DosenDashboard from './pages/DosenDashboard.jsx'
import RekapKehadiran from './pages/RekapKehadiran.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import KelolaPengguna from './pages/KelolaPengguna.jsx'
import KelolaKelas from './pages/KelolaKelas.jsx'

function DashboardByRole() {
  const { user } = useAuth()
  if (user.role === 'dosen') return <DosenDashboard />
  if (user.role === 'admin') return <AdminDashboard />
  return <MahasiswaDashboard />
}

export default function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-ink-400">Memuat...</div>
  }

  if (!user) {
    return <Login />
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardByRole />} />

        {user.role === 'mahasiswa' && (
          <>
            <Route path="/izin/baru" element={<IzinBaru />} />
            <Route path="/revisi/baru" element={<RevisiBaru />} />
          </>
        )}

        {user.role === 'dosen' && <Route path="/rekap" element={<RekapKehadiran />} />}

        {user.role === 'admin' && (
          <>
            <Route path="/pengguna" element={<KelolaPengguna />} />
            <Route path="/kelas" element={<KelolaKelas />} />
          </>
        )}

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}
