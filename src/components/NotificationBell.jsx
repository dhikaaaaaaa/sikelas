import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../api/axios.js'
import { storage } from '../utils/storage.js'

export default function NotificationBell() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Fetch notifications (API or LocalStorage fallback)
  const fetchNotifications = () => {
    if (!user) return

    api.get('/notifications')
      .then((res) => {
        setNotifications(res.data.notifications || [])
        setUnreadCount(res.data.unreadCount || 0)
      })
      .catch(() => {
        // Fallback to LocalStorage
        const localNotifs = storage.getNotifications(user.email)
        setNotifications(localNotifs)
        setUnreadCount(localNotifs.filter((n) => !n.isRead).length)
      })
  }

  useEffect(() => {
    fetchNotifications()
    // Poll every 10 seconds for new notifications
    const interval = setInterval(fetchNotifications, 10000)
    return () => clearInterval(interval)
  }, [user])

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all')
    } catch {
      storage.markAllNotificationsRead(user?.email)
    }
    fetchNotifications()
  }

  const handleMarkOneRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`)
    } catch {
      storage.markNotificationRead(id)
    }
    fetchNotifications()
  }

  const formatTime = (isoString) => {
    if (!isoString) return ''
    const date = new Date(isoString)
    const now = new Date()
    const diffSec = Math.floor((now - date) / 1000)
    if (diffSec < 60) return 'Baru saja'
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} mnt lalu`
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} jam lalu`
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-ink-700 text-ink-200 hover:bg-ink-600 hover:text-white transition-all cursor-pointer"
        title="Notifikasi"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-11 z-50 w-80 sm:w-96 rounded-xl bg-white p-4 shadow-2xl ring-1 ring-black/10 border border-ink-100">
          <div className="flex items-center justify-between border-b border-ink-100 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <h4 className="font-display text-sm font-bold text-ink-900">Notifikasi</h4>
              {unreadCount > 0 && (
                <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-700">
                  {unreadCount} Baru
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-medium text-amber-600 hover:text-amber-700 underline cursor-pointer"
              >
                Tandai semua dibaca
              </button>
            )}
          </div>

          <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-ink-400">
                <svg className="mx-auto h-8 w-8 text-ink-300 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-xs">Belum ada notifikasi.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.isRead && handleMarkOneRead(n.id)}
                  className={`relative rounded-lg p-3 transition-all cursor-pointer ${
                    n.isRead ? 'bg-ink-50/50 hover:bg-ink-50' : 'bg-amber-50/60 hover:bg-amber-50 border-l-3 border-amber-500'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {/* Icon Type */}
                    {n.type === 'rejected' ? (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                    ) : n.type === 'approved' ? (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    ) : (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    )}

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h5 className={`text-xs font-bold ${n.type === 'rejected' ? 'text-rose-700' : n.type === 'approved' ? 'text-emerald-700' : 'text-ink-850'}`}>
                          {n.title}
                        </h5>
                        <span className="text-[10px] text-ink-400">{formatTime(n.createdAt)}</span>
                      </div>
                      <p className="mt-1 text-xs text-ink-600 leading-snug">{n.message}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
