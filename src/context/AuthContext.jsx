import { createContext, useContext, useEffect, useState } from 'react'
import api from '../api/axios.js'

const AuthContext = createContext(null)

// Data dummy supaya UI tetap bisa dilihat sebelum backend Express tersambung.
// Hapus DEMO_USERS dan logika demo saat backend sudah live.
const DEMO_USERS = {
  mahasiswa: { id: 'm1', name: 'Naila Putri', email: 'naila@kampus.ac.id', role: 'mahasiswa', nim: '2310512034' },
  dosen: { id: 'd1', name: 'Dr. Bagus Santoso', email: 'bagus@kampus.ac.id', role: 'dosen', nip: '198203012010121001' },
  admin: { id: 'a1', name: 'Admin Akademik', email: 'admin@kampus.ac.id', role: 'admin' },
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const demoRole = new URLSearchParams(window.location.search).get('demo')
    if (demoRole && DEMO_USERS[demoRole]) {
      setUser(DEMO_USERS[demoRole])
      sessionStorage.setItem('sikelas_demo_user', JSON.stringify(DEMO_USERS[demoRole]))
      setLoading(false)
      return
    }

    const savedDemo = sessionStorage.getItem('sikelas_demo_user')
    if (savedDemo) {
      setUser(JSON.parse(savedDemo))
      setLoading(false)
      return
    }

    api
      .get('/auth/me')
      .then((res) => {
        setUser(res.data.user)
      })
      .catch(() => {
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  function loginAsDemo(role) {
    if (DEMO_USERS[role]) {
      setUser(DEMO_USERS[role])
      sessionStorage.setItem('sikelas_demo_user', JSON.stringify(DEMO_USERS[role]))
      return true
    }
    return false
  }

  function loginWithGoogle() {
    window.location.href = '/api/auth/google'
  }

  async function logout() {
    try {
      await api.post('/auth/logout')
    } finally {
      setUser(null)
      sessionStorage.removeItem('sikelas_demo_user')
      window.location.href = '/'
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout, loginAsDemo }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
