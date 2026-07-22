const SAMPLE_PROOF = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIiB2aWV3Qm94PSIwIDAgNjAwIDQwMCI+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2Y4ZmFmYyIvPgogIDxyZWN0IHg9IjMwIiB5PSIzMCIgd2lkdGg9IjU0MCIgaGVpZ2h0PSIzNDAiIHJ4PSIxNiIgZmlsbD0icmdiKDI1NSwyNTUsMjU1KSIgc3Ryb2tlPSIjZTJlOGYwIiBzdHJva2Utd2lkdGg9IjIiLz4KICA8Y2lyY2xlIGN4PSIzMDAiIGN5PSIxMzAiIHI9IjUwIiBmaWxsPSIjZGJlYWZlIi8+CiAgPHBhdGggZD0iTTI4MCAxMTUgTDMwMCA5NSBMMzIwIDExNSBMMzEyIDExNSBMMzEyIDE0MCBMMjg4IDE0MCBMMjg4IDExNSBaIiBmaWxsPSIjM2I4MmY2Ii8+CiAgPHJlY3QgeD0iMjgwIiB5PSIxNDgiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0IiByeD0iMiIgZmlsbD0iIzkzYzVmZCIvPgogIDxyZWN0IHg9IjE2MCIgeT0iMjAwIiB3aWR0aD0iMjgwIiBoZWlnaHQ9IjEyIiByeD0iNCIgZmlsbD0iI2UyZThmMCIvPgogIDxyZWN0IHg9IjE5MCIgeT0iMjI0IiB3aWR0aD0iMjIwIiBoZWlnaHQ9IjEwIiByeD0iNCIgZmlsbD0iI2YxZjVmOSIvPgogIDxyZWN0IHg9IjIxMCIgeT0iMjQ2IiB3aWR0aD0iMTgwIiBoZWlnaHQ9IjEwIiByeD0iNCIgZmlsbD0iI2YxZjVmOSIvPgogIDx0ZXh0IHg9IjMwMCIgeT0iMzAwIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiMxZTI5M2IiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkJ1a3RpIExhbXBpcmFuIFRlcnZlcmlmaWthc2k8L3RleHQ+CiAgPHRleHQgeD0iMzAwIiB5PSIzMjUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjEzIiBmaWxsPSIjNjQ3NDhiIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5TSUtFTEFTIEFrYWRlbWlrIFBhcmFtYWRpbmE8L3RleHQ+CiAgPGNpcmNsZSBjeD0iMzAwIiBjeT0iMzY1IiByPSIxMiIgZmlsbD0iIzIyYzU1ZSIvPgogIDxwYXRoIGQ9Ik0yOTQgMzY1IEwyOTggMzY5IEwzMDYgMzYxIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIuNSIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPg=='

export const MOCK_REQUESTS = [
  {
    id: 'r1',
    type: 'izin',
    className: 'CS101 — Struktur Data',
    studentName: 'Naila Putri',
    sessionDate: '2026-07-02',
    reason: 'Mengikuti lomba debat tingkat nasional yang diwakilkan oleh kampus.',
    attachmentUrl: SAMPLE_PROOF,
    status: 'pending_admin',
  },
  {
    id: 'r2',
    type: 'revisi',
    className: 'CS204 — Basis Data',
    studentName: 'Naila Putri',
    sessionDate: '2026-06-20',
    reason: 'Sistem mencatat alpa, padahal sudah presensi QR tapi sinyal lambat.',
    attachmentUrl: SAMPLE_PROOF,
    status: 'approved',
  },
  {
    id: 'r3',
    type: 'izin',
    className: 'CS204 — Basis Data',
    studentName: 'Rangga Putra',
    sessionDate: '2026-06-18',
    reason: 'Sakit demam, surat dokter terlampir.',
    attachmentUrl: SAMPLE_PROOF,
    status: 'rejected',
  },
  {
    id: 'r4',
    type: 'revisi',
    className: 'CS101 — Struktur Data',
    studentName: 'Dimas Aulia',
    sessionDate: '2026-06-15',
    reason: 'Mahasiswa keberatan dengan keputusan dosen, mengajukan eskalasi.',
    attachmentUrl: SAMPLE_PROOF,
    status: 'escalated',
  },
]
