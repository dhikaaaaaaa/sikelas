# SIKELAS — Frontend

Frontend React (Vite + Tailwind) untuk sistem **Izin Kelas & Revisi Kehadiran Mahasiswa**, dengan 3 role: mahasiswa, dosen, admin.

## Menjalankan

```bash
npm install
npm run dev
```

App berjalan di `http://localhost:5173`. Semua request ke `/api/*` di-proxy ke backend Express di `http://localhost:3000` (atur di `vite.config.js`).

## Pratinjau tanpa backend

Backend Express belum jalan? Buka langsung salah satu URL ini untuk melihat tampilan tiap role dengan data contoh:

- `http://localhost:5173/?demo=mahasiswa`
- `http://localhost:5173/?demo=dosen`
- `http://localhost:5173/?demo=admin`

Setiap halaman juga otomatis fallback ke data contoh (`src/utils/mockData.js`) jika request ke API gagal, jadi tampilan tetap terlihat sambil backend masih dikembangkan.

## Struktur folder

```
src/
  api/axios.js          instance axios + base URL /api
  context/AuthContext.jsx   sesi user dari Google OAuth (GET /api/auth/me)
  hooks/useRequests.js  fetch daftar pengajuan + fallback mock
  components/           Layout, RequestCard, StatusBadge
  pages/
    Login.jsx
    MahasiswaDashboard.jsx, IzinBaru.jsx, RevisiBaru.jsx
    DosenDashboard.jsx, RekapKehadiran.jsx
    AdminDashboard.jsx, KelolaPengguna.jsx, KelolaKelas.jsx
```

## Endpoint backend yang diharapkan

Sesuaikan nama/path ini dengan rute Express yang sudah/akan dibuat:

| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/api/auth/me` | Data user yang sedang login (dari sesi Google OAuth) |
| GET | `/api/auth/google` | Redirect ke Google OAuth |
| POST | `/api/auth/logout` | Hapus sesi |
| POST | `/api/permissions` | Mahasiswa ajukan izin kelas (multipart, field `attachment`) |
| POST | `/api/attendance-revisions` | Mahasiswa ajukan revisi kehadiran |
| GET | `/api/permissions/mine` | Daftar pengajuan izin milik mahasiswa login |
| GET | `/api/requests/pending` | Daftar pengajuan pending untuk dosen yang login |
| POST | `/api/requests/:id/decision` | Dosen approve/reject (`{ decision: 'approve' | 'reject' }`) |
| GET | `/api/requests/escalated` | Daftar pengajuan yang dieskalasi/ditolak untuk admin |
| POST | `/api/requests/:id/admin-decision` | Keputusan final admin |
| GET | `/api/attendance/recap` | Rekap kehadiran per kelas |
| GET / PATCH | `/api/admin/users` | Kelola role pengguna |
| GET | `/api/admin/classes` | Daftar kelas |

## Catatan

- Warna dan tipografi (navy `ink-*` + amber accent, font Source Serif 4 untuk judul) didefinisikan di `tailwind.config.js` — silakan disesuaikan dengan identitas kampus.
- `withCredentials: true` di `src/api/axios.js` penting agar cookie sesi Google OAuth dari backend ikut terkirim.
