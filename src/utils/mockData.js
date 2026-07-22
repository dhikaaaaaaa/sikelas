const SAMPLE_PROOF = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIiB2aWV3Qm94PSIwIDAgNjAwIDQwMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2Y4ZmFmYyIvPjZyZWN0IHg9IjMwIiB5PSIzMCIgd2lkdGg9IjU0MCIgaGVpZ2h0PSIzNDAiIHJ4PSIxNiIgZmlsbD0icnhiKDI1NSwyNTUsMjU1KSIgc3Ryb2tlPSIjZTJlOGYwIiBzdHJva2Utd2lkdGg9IjIiLz48Y2lyY2xlIGN4PSIzMDAiIGN5PSIxNTAiIHI9IjQwIiBmaWxsPSIjZTBmMmZlIi8+PHBhdGggZD0iTTMwMCAxMTAgTDMxNSAxNTAgTDM1MCAxNTAgTDMyMCAxNzAgTDMzNSAyMTAgTDMwMCAxODUgTDI2NSAyMTAgTDI4MCAxNzAgTDI1MCAxNTAgTDI4NSAxNTAgWiIgZmlsbD0iIzAyODRjNzUiLz48dGV4dCB4PSIzMDAiIHk9IjI2MCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjAiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjMWUyOTNiIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5CdWt0aSBMYW1waXJhbiBUZXJ2ZXJpZmlrYXNpPC90ZXh0Pjx0ZXh0IHg9IzMwMCIgeT0iMjkwIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY0NzQ4YiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+U0lLRUxBUyBBa2FkZW1payBQYXJhbWFkaW5hPC90ZXh0Pjwvc3ZnPg=='

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
