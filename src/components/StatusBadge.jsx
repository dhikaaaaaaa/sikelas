const STYLES = {
  pending: 'bg-amber-50 text-amber-600 border-amber-200',
  pending_admin: 'bg-amber-50 text-amber-700 border-amber-200',
  pending_dosen: 'bg-blue-50 text-blue-700 border-blue-200',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-rose-50 text-rose-700 border-rose-200',
  rejected_by_admin: 'bg-rose-50 text-rose-700 border-rose-200',
  rejected_by_dosen: 'bg-rose-50 text-rose-700 border-rose-200',
  escalated: 'bg-purple-50 text-purple-700 border-purple-200',
}

const LABELS = {
  pending: 'Menunggu',
  pending_admin: 'Menunggu Admin/FIR',
  pending_dosen: 'Menunggu Dosen',
  approved: 'Disetujui',
  rejected: 'Ditolak',
  rejected_by_admin: 'Ditolak Admin/FIR',
  rejected_by_dosen: 'Ditolak Dosen',
  escalated: 'Banding Admin',
}

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${STYLES[status] || STYLES.pending}`}
    >
      {LABELS[status] || status}
    </span>
  )
}

