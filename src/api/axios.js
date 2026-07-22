import axios from 'axios'

// Gunakan backend Vercel di production, atau proxy lokal di development
export const BASE_URL = import.meta.env.PROD
  ? 'https://sikelas-lemon.vercel.app'
  : 'http://localhost:3000'

const BACKEND_URL = `${BASE_URL}/api`

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

export const getImageUrl = (url) => {
  if (!url || url === '#' || url === 'null' || url === 'undefined') return '';
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  return `${BASE_URL}${url}`;
}

export default api
