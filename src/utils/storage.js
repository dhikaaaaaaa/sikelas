// Inisialisasi data bawaan jika localStorage masih kosong.

const DEFAULT_USERS = [
  { id: 'u1', name: 'Naila Putri', email: 'mahasiswa@gmail.com', role: 'mahasiswa', nim: '2310512034', semester: 3, jurusan: 'Teknik Informatika' },
  { id: 'u2', name: 'Dr. Bagus Santoso', email: 'dosen@gmail.com', role: 'dosen', nip: '198203012010121001' },
  { id: 'u3', name: 'Rangga Putra', email: 'rangga@kampus.ac.id', role: 'mahasiswa', nim: '2310512041', semester: 3, jurusan: 'Sistem Informasi' },
  { id: 'u4', name: 'Dimas Aulia', email: 'dimas@kampus.ac.id', role: 'mahasiswa', nim: '2310512057', semester: 5, jurusan: 'Teknik Informatika' },
  { id: 'u5', name: 'Admin Akademik', email: 'admin@gmail.com', role: 'admin' },
  { id: 'u6', name: 'Fadhil Husein', email: 'fadhil.husein@students.paramadina.ac.id', role: 'admin' },
  { id: 'u7', name: 'Andhika Saputra', email: 'andhika.saputra@students.paramadina.ac.id', role: 'mahasiswa', nim: '2310512099', semester: 3, jurusan: 'Teknik Informatika' },
  { id: 'u8', name: 'Najjuan Fariz', email: 'najjuan.fariz@students.paramadina.ac.id', role: 'dosen', nip: '199901012025011001' },
]

const DEFAULT_CLASSES = [
  { id: 'cs101', name: 'CS101 — Struktur Data', lecturer: 'Dr. Bagus Santoso', lecturerEmail: 'dosen@gmail.com', students: 32, studentNims: ['2310512034', '2310512057'] },
  { id: 'cs204', name: 'CS204 — Basis Data', lecturer: 'Najjuan Fariz', lecturerEmail: 'najjuan.fariz@students.paramadina.ac.id', students: 28, studentNims: ['2310512034', '2310512041', '2310512099'] },
]

const SAMPLE_PROOF = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIiB2aWV3Qm94PSIwIDAgNjAwIDQwMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2Y4ZmFmYyIvPjxyZWN0IHg9IjMwIiB5PSIzMCIgd2lkdGg9IjU0MCIgaGVpZ2h0PSIzNDAiIHJ4PSIxNiIgZmlsbD0icmdiKDI1NSwyNTUsMjU1KSIgc3Ryb2tlPSIjZTJlOGYwIiBzdHJva2Utd2lkdGg9IjIiLz48Y2lyY2xlIGN4PSIzMDAiIGN5PSIxMzAiIHI9IjUwIiBmaWxsPSIjZGJlYWZlIi8+PHBhdGggZD0iTTI4MCAxMTUgTDMwMCA5NSBMMzIwIDExNSBMMzEyIDExNSBMMzEyIDE0MCBMMjg4IDE0MCBMMjg4IDExNSBaIiBmaWxsPSIjM2I4MmY2Ii8+PHJlY3QgeD0iMjgwIiB5PSIxNDgiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0IiByeD0iMiIgZmlsbD0iIzkzYzVmZCIvPjxyZWN0IHg9IjE2MCIgeT0iMjAwIiB3aWR0aD0iMjgwIiBoZWlnaHQ9IjEyIiByeD0iNCIgZmlsbD0iI2UyZThmMCIvPjxyZWN0IHg9IjE5MCIgeT0iMjI0IiB3aWR0aD0iMjIwIiBoZWlnaHQ9IjEwIiByeD0iNCIgZmlsbD0iI2YxZjVmOSIvPjxyZWN0IHg9IjIxMCIgeT0iMjQ2IiB3aWR0aD0iMTgwIiBoZWlnaHQ9IjEwIiByeD0iNCIgZmlsbD0iI2YxZjVmOSIvPjx0ZXh0IHg9IjMwMCIgeT0iMzAwIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiMxZTI5M2IiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkJ1a3RpIExhbXBpcmFuIFRlcnZlcmlmaWthc2k8L3RleHQ+PHRleHQgeD0iMzAwIiB5PSIzMjUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjEzIiBmaWxsPSIjNjQ3NDhiIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5TSUtFTEFTIEFrYWRlbWlrIFBhcmFtYWRpbmE8L3RleHQ+PGNpcmNsZSBjeD0iMzAwIiBjeT0iMzY1IiByPSIxMiIgZmlsbD0iIzIyYzU1ZSIvPjxwYXRoIGQ9Ik0yOTQgMzY1IEwyOTggMzY5IEwzMDYgMzYxIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIuNSIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+'

const DEFAULT_REQUESTS = [
  {
    id: 'r1',
    type: 'izin',
    classId: 'cs101',
    className: 'CS101 — Struktur Data',
    studentName: 'Naila Putri',
    studentEmail: 'mahasiswa@gmail.com',
    sessionDate: '2026-07-02',
    reason: 'Mengikuti lomba debat tingkat nasional yang diwakilkan oleh kampus.',
    attachmentUrl: SAMPLE_PROOF,
    status: 'pending_admin',
  },
  {
    id: 'r2',
    type: 'revisi',
    classId: 'cs204',
    className: 'CS204 — Basis Data',
    studentName: 'Naila Putri',
    studentEmail: 'mahasiswa@gmail.com',
    sessionDate: '2026-06-20',
    reason: 'Sistem mencatat alpa, padahal sudah presensi QR tapi sinyal lambat.',
    attachmentUrl: SAMPLE_PROOF,
    status: 'approved',
  },
  {
    id: 'r3',
    type: 'izin',
    classId: 'cs204',
    className: 'CS204 — Basis Data',
    studentName: 'Rangga Putra',
    studentEmail: 'rangga@kampus.ac.id',
    sessionDate: '2026-06-18',
    reason: 'Sakit demam, surat dokter terlampir.',
    attachmentUrl: SAMPLE_PROOF,
    status: 'rejected',
  },
  {
    id: 'r4',
    type: 'revisi',
    classId: 'cs101',
    className: 'CS101 — Struktur Data',
    studentName: 'Dimas Aulia',
    studentEmail: 'dimas@kampus.ac.id',
    sessionDate: '2026-06-15',
    reason: 'Mahasiswa keberatan dengan keputusan dosen, mengajukan eskalasi.',
    attachmentUrl: SAMPLE_PROOF,
    status: 'escalated',
  },
  {
    id: 'r5',
    type: 'izin',
    classId: 'cs204',
    className: 'CS204 — Basis Data',
    studentName: 'Andhika Saputra',
    studentEmail: 'andhika.saputra@students.paramadina.ac.id',
    sessionDate: '2026-07-04',
    reason: 'Ada urusan keluarga penting di luar kota.',
    attachmentUrl: SAMPLE_PROOF,
    status: 'pending_admin',
  },
  {
    id: 'r6',
    type: 'revisi',
    classId: 'cs204',
    className: 'CS204 — Basis Data',
    studentName: 'Andhika Saputra',
    studentEmail: 'andhika.saputra@students.paramadina.ac.id',
    sessionDate: '2026-06-22',
    reason: 'Terlambat melakukan presensi QR karena kendala jaringan wifi kampus.',
    attachmentUrl: SAMPLE_PROOF,
    status: 'approved',
  },
]

// Base attendance stats before any modifications
const BASE_ATTENDANCE = {
  '2310512034': { name: 'Naila Putri', nim: '2310512034', hadir: 12, izin: 1, sakit: 0, alpa: 2 },
  '2310512041': { name: 'Rangga Putra', nim: '2310512041', hadir: 10, izin: 1, sakit: 2, alpa: 2 },
  '2310512057': { name: 'Dimas Aulia', nim: '2310512057', hadir: 14, izin: 0, sakit: 0, alpa: 1 },
  '2310512099': { name: 'Andhika Saputra', nim: '2310512099', hadir: 11, izin: 1, sakit: 0, alpa: 2 },
}

function initData() {
  const resetKey = 'sikelas_v6_base64_proofs';
  if (!localStorage.getItem(resetKey)) {
    localStorage.removeItem('sikelas_users')
    localStorage.removeItem('sikelas_classes')
    localStorage.removeItem('sikelas_requests')
    localStorage.removeItem('sikelas_attendance')
    localStorage.setItem(resetKey, 'true')
  }

  if (!localStorage.getItem('sikelas_users')) {
    localStorage.setItem('sikelas_users', JSON.stringify(DEFAULT_USERS))
  }
  if (!localStorage.getItem('sikelas_classes')) {
    localStorage.setItem('sikelas_classes', JSON.stringify(DEFAULT_CLASSES))
  }
  if (!localStorage.getItem('sikelas_requests')) {
    localStorage.setItem('sikelas_requests', JSON.stringify(DEFAULT_REQUESTS))
  }
  if (!localStorage.getItem('sikelas_attendance')) {
    localStorage.setItem('sikelas_attendance', JSON.stringify(BASE_ATTENDANCE))
  }
}

// Panggil inisialisasi
initData()

export const storage = {
  // Requests API
  getRequests() {
    initData()
    const raw = JSON.parse(localStorage.getItem('sikelas_requests')) || []
    let modified = false
    const sanitized = raw.map(r => {
      let updated = { ...r }
      // Update old pending status to new multi-step status
      if (updated.status === 'pending') {
        updated.status = updated.type === 'revisi' ? 'pending_dosen' : 'pending_admin'
        modified = true
      }
      // Update broken /uploads/, empty, or # image paths to valid Base64 sample proof
      if (!updated.attachmentUrl || updated.attachmentUrl.startsWith('/uploads/') || updated.attachmentUrl === '#') {
        updated.attachmentUrl = SAMPLE_PROOF
        modified = true
      }
      return updated
    })

    if (modified) {
      localStorage.setItem('sikelas_requests', JSON.stringify(sanitized))
    }
    return sanitized
  },

  saveRequest(request) {
    const requests = this.getRequests()
    const defaultStatus = request.type === 'revisi' ? 'pending_dosen' : 'pending_admin'
    const newReq = {
      id: 'req_' + Date.now(),
      status: defaultStatus,
      ...request,
      attachmentUrl: request.attachmentUrl || SAMPLE_PROOF,
    }
    requests.unshift(newReq)
    localStorage.setItem('sikelas_requests', JSON.stringify(requests))
    this.updateRecapFromRequests()
    return newReq;
  },

  updateRequestStatus(id, status) {
    const requests = this.getRequests()
    const updated = requests.map(r => r.id === id ? { ...r, status } : r)
    localStorage.setItem('sikelas_requests', JSON.stringify(updated))
    this.updateRecapFromRequests()
    return updated.find(r => r.id === id)
  },

  // Users API
  getUsers() {
    initData()
    return JSON.parse(localStorage.getItem('sikelas_users'))
  },

  updateUserRole(id, role) {
    const users = this.getUsers()
    const updated = users.map(u => u.id === id ? { ...u, role } : u)
    localStorage.setItem('sikelas_users', JSON.stringify(updated))
    return updated.find(u => u.id === id)
  },

  addUser(user) {
    const users = this.getUsers()
    const newUser = {
      id: 'u_' + Date.now(),
      ...user
    }
    users.push(newUser)
    localStorage.setItem('sikelas_users', JSON.stringify(users))

    // If it's a student, initialize attendance
    if (user.role === 'mahasiswa' && user.nim) {
      const attendance = JSON.parse(localStorage.getItem('sikelas_attendance')) || {}
      if (!attendance[user.nim]) {
        attendance[user.nim] = { name: user.name, nim: user.nim, hadir: 14, izin: 0, sakit: 0, alpa: 0 }
        localStorage.setItem('sikelas_attendance', JSON.stringify(attendance))
      }
    }
    return newUser
  },

  // Classes API
  getClasses() {
    initData()
    return JSON.parse(localStorage.getItem('sikelas_classes'))
  },

  addClass(classObj) {
    const classes = this.getClasses()
    const newClass = {
      id: 'cls_' + Date.now(),
      ...classObj
    }
    classes.push(newClass)
    localStorage.setItem('sikelas_classes', JSON.stringify(classes))
    return newClass
  },

  // Attendance & Recap
  getRecap() {
    initData()
    this.updateRecapFromRequests()
    return Object.values(JSON.parse(localStorage.getItem('sikelas_attendance')))
  },

  updateRecapFromRequests() {
    initData()
    const requests = JSON.parse(localStorage.getItem('sikelas_requests')) || []
    const users = JSON.parse(localStorage.getItem('sikelas_users')) || []
    const attendance = { ...BASE_ATTENDANCE }

    // Make sure all students have an entry in attendance
    users.forEach(u => {
      if (u.role === 'mahasiswa' && u.nim && !attendance[u.nim]) {
        attendance[u.nim] = { name: u.name, nim: u.nim, hadir: 14, izin: 0, sakit: 0, alpa: 0 }
      }
    })

    // Recalculate attendance stats based on approved requests
    // Reset to base stats first
    Object.keys(attendance).forEach(nim => {
      const base = BASE_ATTENDANCE[nim] || { name: attendance[nim].name, nim, hadir: 14, izin: 0, sakit: 0, alpa: 0 }
      attendance[nim] = { ...base }
    })

    // Process only approved requests
    requests.forEach(req => {
      if (req.status !== 'approved') return

      const student = users.find(u => u.name === req.studentName)
      if (!student || !student.nim) return

      const stat = attendance[student.nim]
      if (!stat) return

      if (req.type === 'izin') {
        // Izin reduces alpa and increases izin
        if (stat.alpa > 0) {
          stat.alpa -= 1
          stat.izin += 1
        } else {
          stat.izin += 1
        }
      } else if (req.type === 'revisi') {
        // Revision changes current system status (usually alpa) to hadir
        // We assume we turn alpa -> hadir
        if (stat.alpa > 0) {
          stat.alpa -= 1
          stat.hadir += 1
        }
      }
    })

    localStorage.setItem('sikelas_attendance', JSON.stringify(attendance))
  }
}
