import axios from 'axios'
import { storage } from '../utils/storage.js'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // perlu untuk session/cookie dari Google OAuth di backend
})

// Lempar pesan error yang konsisten atau tangani fallback lokal jika backend mati
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const config = err.config
    // Jika terjadi kesalahan jaringan (tidak ada koneksi) atau error 404, coba tangani secara lokal
    if (!err.response || err.response.status === 404 || err.response.status === 504) {
      console.warn(`Backend offline/tidak ditemukan. Menangani secara lokal untuk: ${config.method.toUpperCase()} ${config.url}`)
      
      const url = config.url
      const method = config.method.toLowerCase()

      try {
        // GET /attendance/recap
        if (url === '/attendance/recap' && method === 'get') {
          return { data: { rows: storage.getRecap() } }
        }

        // GET /admin/users
        if (url === '/admin/users' && method === 'get') {
          return { data: { users: storage.getUsers() } }
        }

        // POST /admin/users
        if (url === '/admin/users' && method === 'post') {
          const userData = JSON.parse(config.data)
          const newUser = storage.addUser(userData)
          return { data: { user: newUser } }
        }

        // PATCH /admin/users/:id
        if (url.startsWith('/admin/users/') && method === 'patch') {
          const id = url.split('/').pop()
          const { role } = JSON.parse(config.data)
          const updatedUser = storage.updateUserRole(id, role)
          return { data: { user: updatedUser } }
        }

        // GET /admin/classes
        if (url === '/admin/classes' && method === 'get') {
          return { data: { classes: storage.getClasses() } }
        }

        // POST /admin/classes
        if (url === '/admin/classes' && method === 'post') {
          const classData = JSON.parse(config.data)
          const newClass = storage.addClass(classData)
          return { data: { class: newClass } }
        }

        // POST /permissions (Izin)
        if (url === '/permissions' && method === 'post') {
          let payload = {}
          if (config.data instanceof FormData) {
            payload = Object.fromEntries(config.data.entries())
          } else {
            payload = typeof config.data === 'string' ? JSON.parse(config.data) : config.data
          }
          // Cari nama mahasiswa yang sedang login dari sessionStorage
          const loggedUser = JSON.parse(sessionStorage.getItem('sikelas_demo_user')) || { name: 'Naila Putri', email: 'mahasiswa@gmail.com' }
          const classes = storage.getClasses()
          const matchedClass = classes.find(c => c.id === payload.classId)

          const newReq = storage.saveRequest({
            type: 'izin',
            classId: payload.classId,
            className: matchedClass ? matchedClass.name : payload.classId,
            studentName: loggedUser.name,
            studentEmail: loggedUser.email,
            sessionDate: payload.sessionDate,
            reason: payload.reason,
            attachmentUrl: payload.attachment ? URL.createObjectURL(payload.attachment) : 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=600&auto=format&fit=crop',
          })
          return { data: { request: newReq } }
        }

        // POST /attendance-revisions (Revisi)
        if (url === '/attendance-revisions' && method === 'post') {
          let payload = {}
          if (config.data instanceof FormData) {
            payload = Object.fromEntries(config.data.entries())
          } else {
            payload = typeof config.data === 'string' ? JSON.parse(config.data) : config.data
          }
          const loggedUser = JSON.parse(sessionStorage.getItem('sikelas_demo_user')) || { name: 'Naila Putri', email: 'mahasiswa@gmail.com' }
          const classes = storage.getClasses()
          const matchedClass = classes.find(c => c.id === payload.classId)

          const newReq = storage.saveRequest({
            type: 'revisi',
            classId: payload.classId,
            className: matchedClass ? matchedClass.name : payload.classId,
            studentName: loggedUser.name,
            studentEmail: loggedUser.email,
            sessionDate: payload.sessionDate,
            reason: payload.reason,
            attachmentUrl: payload.attachment ? URL.createObjectURL(payload.attachment) : 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop',
          })
          return { data: { request: newReq } }
        }

        // POST /requests/:id/decision
        if (url.match(/\/requests\/[^/]+\/decision/) && method === 'post') {
          const id = url.split('/')[2]
          const { decision } = JSON.parse(config.data)
          const status = decision === 'approve' ? 'approved' : 'rejected'
          const updatedReq = storage.updateRequestStatus(id, status)
          return { data: { request: updatedReq } }
        }

        // POST /requests/:id/admin-decision
        if (url.match(/\/requests\/[^/]+\/admin-decision/) && method === 'post') {
          const id = url.split('/')[2]
          const { decision } = JSON.parse(config.data)
          const status = decision === 'approve' ? 'approved' : 'rejected'
          const updatedReq = storage.updateRequestStatus(id, status)
          return { data: { request: updatedReq } }
        }

        // POST /requests/:id/escalate
        if (url.match(/\/requests\/[^/]+\/escalate/) && method === 'post') {
          const id = url.split('/')[2]
          const updatedReq = storage.updateRequestStatus(id, 'escalated')
          return { data: { request: updatedReq } }
        }
      } catch (mockErr) {
        console.error('Gagal memproses mock lokal:', mockErr)
      }
    }

    const message = err.response?.data?.message || 'Terjadi kesalahan pada server'
    return Promise.reject(new Error(message))
  },
)

export default api

