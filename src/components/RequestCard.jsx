import StatusBadge from './StatusBadge.jsx'

const TYPE_LABEL = {
  izin: 'Izin kelas',
  revisi: 'Revisi kehadiran',
}

export default function RequestCard({ request, actions, onViewAttachment }) {
  return (
    <div className="rounded-xl border border-ink-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-500">
            {TYPE_LABEL[request.type] || request.type}
          </p>
          <h3 className="mt-1 font-display text-lg font-medium text-ink-800">{request.className}</h3>
          <p className="text-sm text-ink-500 font-sans">
            {request.studentName} · {request.sessionDate}
          </p>
        </div>
        <StatusBadge status={request.status} />
      </div>

      <p className="mt-3 text-sm leading-relaxed text-ink-600">{request.reason}</p>

      {request.attachmentUrl && (
        <button
          onClick={(e) => {
            if (onViewAttachment) {
              e.preventDefault()
              onViewAttachment(request.attachmentUrl, request.className, request.studentName)
            } else {
              window.open(request.attachmentUrl, '_blank')
            }
          }}
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-ink-600 hover:text-amber-500 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
          Lihat Berkas Bukti
        </button>
      )}

      {actions && <div className="mt-4 flex gap-2 border-t border-ink-100 pt-4">{actions}</div>}
    </div>
  )
}

