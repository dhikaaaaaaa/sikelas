import axios from 'axios'

// Gunakan backend Vercel di production, atau proxy lokal di development
const BACKEND_URL = import.meta.env.PROD
  ? 'https://sikelas-lemon.vercel.app/api'
  : '/api'

const api = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true, // required for session cookie (Google OAuth session)
})

// Handle response errors globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.message || 'Terjadi kesalahan pada server'
    return Promise.reject(new Error(message))
  }
)

export default api
