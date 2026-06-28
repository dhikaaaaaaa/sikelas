const STYLES = {
  pending: 'bg-amber-50 text-amber-600 border-amber-200',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-rose-50 text-rose-700 border-rose-200',
  escalated: 'bg-ink-100 text-ink-600 border-ink-200',
}

const LABELS = {
  pending: 'Menunggu',
  approved: 'Disetujui',
  rejected: 'Ditolak',
  escalated: 'Eskalasi admin',
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
