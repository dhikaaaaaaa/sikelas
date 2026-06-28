import { createContext, useContext, useEffect, useState } from 'react'
import api from '../api/axios.js'
import { storage } from '../utils/storage.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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

  function loginWithCustomEmail(email) {
    // Cari dari localStorage
    const users = storage.getUsers()
    let matchedUser = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase())

    if (!matchedUser) {
      throw new Error('Akun Google ini tidak terdaftar di database SIKELAS. Silakan hubungi Admin.')
    }

    setUser(matchedUser)
    sessionStorage.setItem('sikelas_demo_user', JSON.stringify(matchedUser))
    return matchedUser
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
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout, loginWithCustomEmail }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
