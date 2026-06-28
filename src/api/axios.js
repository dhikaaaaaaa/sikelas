import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
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
