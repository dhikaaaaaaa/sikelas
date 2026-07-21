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

  async function loginWithEmail(email) {
    try {
      const res = await api.post('/auth/login', { email })
      setUser(res.data.user)
      return res.data.user
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Gagal login'
      throw new Error(msg)
    }
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
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout, loginWithEmail }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
