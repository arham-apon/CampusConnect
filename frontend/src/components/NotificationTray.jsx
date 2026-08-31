import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { API_BASE_URL } from '../config/api';

const POLL_INTERVAL = 15000;
const API_BASE = `${API_BASE_URL}`;

// ── Type metadata ──────────────────────────────────────────────────────────────
const TYPE_META = {
    marketplace: {
        label: "Marketplace",
        bg: "bg-rose-100",
        text: "text-rose-600",
        ring: "ring-rose-200",
        dot: "bg-rose-500",
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
        ),
    },
    pre_order: {
        label: "Pre-Order",
        bg: "bg-orange-100",
        text: "text-orange-600",
        ring: "ring-orange-200",
        dot: "bg-orange-500",
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
        ),
    },
    event: {
        label: "Event",
        bg: "bg-blue-100",
        text: "text-blue-600",
        ring: "ring-blue-200",
        dot: "bg-blue-500",
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        ),
    },
    society: {
        label: "Society",
        bg: "bg-purple-100",
        text: "text-purple-600",
        ring: "ring-purple-200",
        dot: "bg-purple-500",
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
    },
    lost_found: {
        label: "Lost & Found",
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        ring: "ring-yellow-200",
        dot: "bg-yellow-500",
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
        ),
    },
    roommate: {
        label: "Roommate",
        bg: "bg-green-100",
        text: "text-green-600",
        ring: "ring-green-200",
        dot: "bg-green-500",
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
        ),
    },
    feedback: {
        label: "Feedback",
        bg: "bg-gray-100",
        text: "text-gray-600",
        ring: "ring-gray-200",
        dot: "bg-gray-500",
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
        ),
    },
    blood: {
        label: "Blood",
        bg: "bg-red-100",
        text: "text-red-700",
        ring: "ring-red-200",
        dot: "bg-red-600",
        icon: (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C12 2 5 10.5 5 15a7 7 0 0014 0c0-4.5-7-13-7-13z" />
            </svg>
        ),
    },
};

const FILTER_TABS = [
    { key: "all", label: "All" },
    { key: "unread", label: "Unread" },
    { key: "pre_order", label: "Orders" },
    { key: "event", label: "Events" },
    { key: "society", label: "Society" },
    { key: "blood", label: "Blood" },
    { key: "feedback", label: "Feedback" },
];

// ── Helpers ────────────────────────────────────────────────────────────────────
function timeAgo(dateStr) {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

// ── Skeleton ───────────────────────────────────────────────────────────────────
function Skeleton() {
    return (
        <div className="px-4 py-3 border-b border-gray-100 animate-pulse">
            <div className="flex gap-3 items-start">
                <div className="w-9 h-9 rounded-xl bg-gray-200 flex-shrink-0" />
                <div className="flex-1 space-y-2 pt-1">
                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                    <div className="h-2.5 bg-gray-200 rounded w-full" />
                    <div className="h-2 bg-gray-200 rounded w-1/4" />
                </div>
            </div>
        </div>
    );
}

// ── Single notification row ────────────────────────────────────────────────────
function NotificationItem({ n, onMarkRead, onClickItem }) {
    const meta = TYPE_META[n.type] || TYPE_META.feedback;

    return (
        <div
            onClick={() => {
                if (!n.isRead) onMarkRead(n._id);
                if (onClickItem) onClickItem(n);
            }}
            className={`group relative px-4 py-3.5 border-b border-gray-100 cursor-pointer
        transition-all duration-200 hover:bg-gray-50
        ${!n.isRead
                    ? "bg-gradient-to-r from-red-50/40 to-transparent border-l-[3px] border-l-red-500"
                    : "opacity-75"
                }`}
        >
            <div className="flex gap-3 items-start">
                {/* Type icon bubble */}
                <div className={`flex-shrink-0 w-9 h-9 rounded-xl ${meta.bg} ${meta.text}
          flex items-center justify-center ring-1 ${meta.ring} shadow-sm
          transition-transform duration-200 group-hover:scale-105`}>
                    {meta.icon}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <p className="text-[13px] font-semibold text-gray-900 leading-snug">
                            {n.title}
                        </p>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                            {!n.isRead && (
                                <span className={`w-2 h-2 rounded-full ${meta.dot} animate-pulse`} />
                            )}
                        </div>
                    </div>

                    <p className="text-[12px] text-gray-500 mt-0.5 leading-relaxed line-clamp-2">
                        {n.message}
                    </p>

                    <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] text-gray-400">{timeAgo(n.createdAt)}</span>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-medium
              px-1.5 py-0.5 rounded-md ${meta.bg} ${meta.text}`}>
                            {meta.label}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Empty state ────────────────────────────────────────────────────────────────
function EmptyState({ filter }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
            </div>
            <p className="text-sm font-semibold text-gray-400">
                {filter === "unread" ? "All caught up!" : "No notifications"}
            </p>
            <p className="text-xs text-gray-300 mt-1">
                {filter === "unread" ? "You've read everything." : "Activity will appear here."}
            </p>
        </div>
    );
}

// ── Main NotificationTray ──────────────────────────────────────────────────────
export default function NotificationTray({ isOpen, onClose, onUnreadCountChange, sharedReadIdsRef }) {
    const { User } = AuthContext();
    const trayRef = useRef(null);
    const navigate = useNavigate();

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState("all");
    const [markingAll, setMarkingAll] = useState(false);

    // Use shared readIdsRef from Header if provided, otherwise use local
    const readIdsRef = sharedReadIdsRef || useRef(new Set());

    // ── Fetch ──────────────────────────────────────────────────────────────────
    const fetchNotifications = useCallback(async () => {
        const token = sessionStorage.getItem("authToken");
        if (!token || !User) return;

        try {
            const res = await fetch(`${API_BASE}/api/notifications`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("failed");
            const data = await res.json();
            if (data.success) {
                const merged = data.notifications
                    .map((n) => (readIdsRef.current.has(n._id) ? { ...n, isRead: true } : n))
                    .sort((a, b) => {
                        // Unread first, then read. If both are same, sort by date (newest first).
                        if (a.isRead === b.isRead) {
                            return new Date(b.createdAt) - new Date(a.createdAt);
                        }
                        return a.isRead ? 1 : -1;
                    });
                setNotifications(merged);
                const newUnreadCount = merged.filter((n) => !n.isRead).length;
                setUnreadCount(newUnreadCount);
                // Notify parent (Header) of unread count change
                if (onUnreadCountChange) {
                    onUnreadCountChange(newUnreadCount);
                }
                setError(null);
            }
        } catch {
            setError("Could not load notifications");
        } finally {
            setLoading(false);
        }
    }, [User]);

    useEffect(() => {
        if (!isOpen) return;
        fetchNotifications();
        const interval = setInterval(fetchNotifications, POLL_INTERVAL);
        return () => clearInterval(interval);
    }, [isOpen, fetchNotifications]);

    // Click-outside close
    useEffect(() => {
        if (!isOpen) return;
        function handler(e) {
            if (trayRef.current && !trayRef.current.contains(e.target)) {
                onClose();
            }
        }
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [isOpen, onClose]);

    // ── Actions ────────────────────────────────────────────────────────────────
    const handleMarkRead = async (id) => {
        const token = sessionStorage.getItem("authToken");

        try {
            // Send request to backend first
            const response = await fetch(`${API_BASE}/api/notifications/${id}/read`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                throw new Error('Failed to mark as read');
            }

            const data = await response.json();

            // Only update local state if backend succeeded
            if (data.success) {
                readIdsRef.current.add(id);
                setNotifications((prev) =>
                    prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
                );
                const newCount = Math.max(0, unreadCount - 1);
                setUnreadCount(newCount);
                // Notify parent (Header) of unread count change
                if (onUnreadCountChange) {
                    onUnreadCountChange(newCount);
                }
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleMarkAllRead = async () => {
        setMarkingAll(true);
        const token = sessionStorage.getItem("authToken");

        if (!token) {
            console.error('No auth token found');
            alert('Please login again to mark notifications as read.');
            setMarkingAll(false);
            return;
        }

        console.log('Attempting to mark all as read...');
        console.log('Request URL:', `${API_BASE}/api/notifications/read-all`);

        try {
            // First, send request to backend
            const response = await fetch(`${API_BASE}/api/notifications/read-all`, {
                method: "PATCH",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });

            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);

            const data = await response.json();
            console.log('Response data:', data);

            if (!response.ok) {
                throw new Error(data.message || `Server error: ${response.status}`);
            }

            // Only update local state if backend succeeded
            if (data.success) {
                notifications.forEach((n) => readIdsRef.current.add(n._id));
                setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
                setUnreadCount(0);
                // Notify parent (Header) of unread count change
                if (onUnreadCountChange) {
                    onUnreadCountChange(0);
                }
                console.log('Successfully marked all as read');
            } else {
                throw new Error(data.message || 'Failed to mark notifications as read');
            }
        } catch (error) {
            console.error('Error marking all as read:', error);
            console.error('Error details:', error.message);
            // Show error to user
            alert(`Failed to mark all as read: ${error.message}`);
        } finally {
            setMarkingAll(false);
        }
    };

    const handleNotificationClick = (n) => {
        let link = '/dashboard';
        switch (n.type) {
            case 'marketplace':
            case 'pre_order':
                link = n.metadata?.postId ? `/marketplace/${n.metadata.postId}` : '/marketplace';
                break;
            case 'lost_found':
                link = '/lost-found';
                break;
            case 'roommate':
                link = '/accommodation';
                break;
            case 'event':
            case 'society':
                link = n.metadata?.societyId ? `/societies/${n.metadata.societyId}` : '/societies';
                break;
            case 'blood':
                link = '/medical-support';
                break;
            case 'feedback':
                link = '/home'; // Anonymous feedback page
                break;
        }
        navigate(link);
        if (onClose) onClose();
    };

    // ── Filtered list ──────────────────────────────────────────────────────────
    const filtered = notifications.filter((n) => {
        if (filter === "all") return true;
        if (filter === "unread") return !n.isRead;
        return n.type === filter;
    });

    if (!isOpen) return null;

    return (
        <div
            ref={trayRef}
            className="absolute right-0 top-full mt-2 w-[380px] max-w-[calc(100vw-1rem)]
        rounded-2xl bg-white shadow-2xl shadow-black/15 border border-gray-200/80
        overflow-hidden z-[9999]
        animate-[tray-in_180ms_cubic-bezier(0.22,1,0.36,1)_both]"
            style={{ transformOrigin: "top right" }}
        >
            <style>{`
        @keyframes tray-in {
          from { opacity: 0; transform: scale(0.94) translateY(-6px); }
          to   { opacity: 1; transform: scale(1)   translateY(0); }
        }
      `}</style>

            {/* ── Header ──────────────────────────────────────────────────────── */}
            <div className="px-4 pt-4 pb-3 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50/50">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                        </span>
                        <h2 className="text-sm font-bold text-gray-900">Notifications</h2>
                        {unreadCount > 0 && (
                            <span className="flex items-center justify-center rounded-full bg-red-500
                text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1">
                                {unreadCount > 99 ? "99+" : unreadCount}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                disabled={markingAll}
                                className="text-[11px] font-semibold text-[#b00020] hover:text-red-700
                  disabled:opacity-50 transition-colors"
                            >
                                {markingAll ? "Marking…" : "Mark all read"}
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100
                transition-colors"
                            aria-label="Close"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Filter tabs */}
                <div className="flex gap-1 overflow-x-auto scrollbar-none -mx-1 px-1">
                    {FILTER_TABS.map((tab) => {
                        const isActive = filter === tab.key;
                        const tabUnread =
                            tab.key === "unread"
                                ? unreadCount
                                : tab.key === "all"
                                    ? 0
                                    : notifications.filter((n) => n.type === tab.key && !n.isRead).length;

                        return (
                            <button
                                key={tab.key}
                                onClick={() => setFilter(tab.key)}
                                className={`flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg
                  text-[11px] font-semibold transition-all duration-150
                  ${isActive
                                        ? "bg-[#b00020] text-white shadow-sm"
                                        : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                                    }`}
                            >
                                {tab.label}
                                {tabUnread > 0 && (
                                    <span className={`rounded-full min-w-[14px] h-[14px] flex items-center
                    justify-center text-[9px] font-bold px-0.5
                    ${isActive ? "bg-white/30 text-white" : "bg-red-500 text-white"}`}>
                                        {tabUnread}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Notification list ─────────────────────────────────────────────── */}
            <div className="overflow-y-auto max-h-[420px] scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                {loading ? (
                    <>
                        <Skeleton />
                        <Skeleton />
                        <Skeleton />
                        <Skeleton />
                    </>
                ) : error ? (
                    <div className="flex flex-col items-center py-10 gap-3">
                        <p className="text-xs text-red-400">{error}</p>
                        <button
                            onClick={fetchNotifications}
                            className="text-xs font-semibold text-red-500 underline hover:text-red-700"
                        >
                            Retry
                        </button>
                    </div>
                ) : filtered.length === 0 ? (
                    <EmptyState filter={filter} />
                ) : (
                    filtered.map((n) => (
                        <NotificationItem key={n._id} n={n} onMarkRead={handleMarkRead} onClickItem={handleNotificationClick} />
                    ))
                )}
            </div>

            {/* ── Footer ──────────────────────────────────────────────────────── */}
            <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100
        flex items-center justify-between text-[11px] text-gray-400">
                <span>Refreshes every 15s</span>
                <button
                    onClick={fetchNotifications}
                    className="font-semibold text-[#b00020] hover:text-red-700 transition-colors"
                >
                    Refresh now
                </button>
            </div>
        </div>
    );
}

// ── Bell button (exported separately for Header use) ──────────────────────────
export function NotificationBell({ unreadCount, onClick }) {
    return (
        <button
            id="notification-bell-btn"
            onClick={onClick}
            className="relative rounded-lg p-2 text-white transition-all hover:bg-white/20
        focus:outline-none focus:ring-2 focus:ring-white/40"
            aria-label="Notifications"
        >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>

            {/* Badge */}
            {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center
          min-w-[18px] h-[18px] rounded-full bg-yellow-400 text-gray-900
          text-[10px] font-extrabold shadow px-0.5 ring-2 ring-[#b00020]
          animate-[badge-pop_300ms_cubic-bezier(0.22,1,0.36,1)]">
                    {unreadCount > 99 ? "99+" : unreadCount}
                </span>
            )}
            <style>{`
        @keyframes badge-pop {
          from { transform: scale(0.4); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
      `}</style>
        </button>
    );
}
