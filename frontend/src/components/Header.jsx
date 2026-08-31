import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router'
import { AuthContext } from '../context/AuthContext'
import NotificationTray, { NotificationBell } from './NotificationTray'
import { API_BASE_URL } from '../config/api';

const POLL_INTERVAL = 15000;
const API_BASE = `${API_BASE_URL}`;

export default function Header({ onMenuToggle, showMenuButton = true, handlelogout, onProfileClick }) {
  const { User } = AuthContext()
  const navigate = useNavigate()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const readIdsRef = useRef(new Set())
  const notifWrapRef = useRef(null)

  // ── Poll unread count every 15s for the badge ──────────────────────────────
  const pollUnread = useCallback(async () => {
    const token = sessionStorage.getItem('authToken')
    if (!token || !User) return
    try {
      const res = await fetch(`${API_BASE}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) return
      const data = await res.json()
      if (data.success) {
        const count = data.notifications.filter(
          n => !readIdsRef.current.has(n._id) && !n.isRead
        ).length
        setUnreadCount(count)
      }
    } catch { /* silent */ }
  }, [User])

  useEffect(() => {
    pollUnread()
    const id = setInterval(pollUnread, POLL_INTERVAL)
    return () => clearInterval(id)
  }, [pollUnread])

  // When the tray closes, re-poll to sync badge
  const handleTrayClose = () => {
    setNotifOpen(false)
    pollUnread()
  }

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-[#e50914] via-[#b00020] to-[#8b0018] shadow-xl">
      <div className="flex w-full items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          {showMenuButton && (
            <button
              onClick={onMenuToggle}
              className="rounded-lg p-2 text-white transition-all hover:bg-white/20 lg:hidden"
              aria-label="Toggle sidebar"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          <button
            onClick={() => navigate('/dashboard')}
            className="text-2xl font-extrabold tracking-wide text-white transition-opacity hover:opacity-90"
          >
            IUTians Portal
          </button>
        </div>

        <div className="flex items-center gap-4">
          {/* ── Notification Bell + Tray ─────────────────────────────────── */}
          <div ref={notifWrapRef} className="relative">
            <NotificationBell
              unreadCount={unreadCount}
              onClick={() => {
                setNotifOpen(prev => !prev)
                setShowProfileMenu(false)
              }}
            />
            <NotificationTray
              isOpen={notifOpen}
              onClose={handleTrayClose}
              onUnreadCountChange={setUnreadCount}
              sharedReadIdsRef={readIdsRef}
            />
          </div>

          {/* ── User Profile ──────────────────────────────────────────────── */}
          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-white">
                  {User?.user_name || User?.user?.user_name}
                </p>
                <p className="text-xs text-white/80">
                  {User?.student_id || User?.user?.student_id}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu)
                  setNotifOpen(false)
                }}
                className="h-10 w-10 overflow-hidden rounded-full border-2 border-white
                  bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-sm
                  transition-all hover:scale-110 hover:shadow-lg"
              >
                {!User?.image ? (
                  <svg className="h-full w-full p-1.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                ) : (
                  <img src={User?.image} alt="Profile" className="h-full w-full object-cover" />
                )}
              </button>
            </div>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white shadow-2xl
                animate-[fade-up_200ms_ease-out] z-[9999]">
                <button
                  onClick={() => {
                    if (onProfileClick) onProfileClick()
                    else navigate('/profile')
                    setShowProfileMenu(false)
                  }}
                  className="flex w-full items-center gap-3 rounded-t-xl px-4 py-3
                    text-left text-gray-700 transition-colors hover:bg-gray-100"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="font-semibold">Profile</span>
                </button>
           
                <button
                  onClick={() => { navigate('/login'); setShowProfileMenu(false) }}
                  className="flex w-full items-center gap-3 rounded-b-xl border-t px-4 py-3
                    text-left text-[#b00020] transition-colors hover:bg-red-50"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span onClick={handlelogout} className="font-semibold">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
