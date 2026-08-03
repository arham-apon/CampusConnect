import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const POLL_INTERVAL = 20000;

const TYPE_META = {
  marketplace: { label: "Marketplace", color: "bg-red-500" },
  pre_order: { label: "Pre-Order", color: "bg-orange-500" },
  event: { label: "Event", color: "bg-blue-500" },
  society: { label: "Society", color: "bg-purple-500" },
  lost_found: { label: "Lost & Found", color: "bg-yellow-500" },
  roommate: { label: "Roommate", color: "bg-green-500" },
  feedback: { label: "Feedback", color: "bg-gray-500" },
  blood: { label: "Blood Request", color: "bg-rose-700" },
};

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function NotificationSkeleton() {
  return (
    <div className="px-4 py-3 border-b border-gray-100 animate-pulse">
      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-full bg-gray-200" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-gray-200 rounded w-2/3" />
          <div className="h-2.5 bg-gray-200 rounded w-full" />
          <div className="h-2 bg-gray-200 rounded w-1/4" />
        </div>
      </div>
    </div>
  );
}

export default function LiveFeed() {
  const { User } = AuthContext();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const readIdsRef = useRef(new Set());

  const fetchNotifications = useCallback(async () => {
    const token = sessionStorage.getItem("authToken");
    if (!token || !User) return;

    try {
      const res = await fetch("http://localhost:4000/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(res);
      if (!res.ok) throw new Error("Fetch failed");

      const data = await res.json();

      if (data.success) {
        const merged = data.notifications
          .map((n) =>
            readIdsRef.current.has(n._id) ? { ...n, isRead: true } : n,
          )
          .filter((n) => {
            if (n.type === "feedback") {
              // Only show feedback notifications in the live feed if they are system broadcasts (new posts), not personal likes/comments
              if (n.metadata?.isNewPostBroadcast !== true) {
                return false;
              }
            }

            // Filter out all personal marketplace pre-order notifications (approvals, verifications, confirmations)
            if (n.type === "pre_order") {
              return false;
            }

            // Filter out admin-related society notifications entirely based on the word 'admin'
            if (n.type === "society") {
              const titleStr = n.title?.toLowerCase() || "";
              const msgStr = n.message?.toLowerCase() || "";
              if (titleStr.includes("admin") || msgStr.includes("admin")) {
                return false; // Hide from LiveFeed
              }
            }
            return true;
          })
          .sort((a, b) => {
            // Unread first, then read. If both are same, sort by date (newest first).
            if (a.isRead === b.isRead) {
              return new Date(b.createdAt) - new Date(a.createdAt);
            }
            return a.isRead ? 1 : -1;
          });

        setNotifications(merged);
        console.log(merged);
        setUnreadCount(merged.filter((n) => !n.isRead).length);
        setError(null);
      }
    } catch (err) {
      setError("Could not load notifications");
    } finally {
      setLoading(false);
    }
  }, [User]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id) => {
    const token = sessionStorage.getItem("authToken");

    try {
      // Send request to backend first
      const response = await fetch(
        `http://localhost:4000/api/notifications/${id}/read`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to mark as read");
      }

      const data = await response.json();

      // Only update local state if backend succeeded
      if (data.success) {
        readIdsRef.current.add(id);
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleNotificationClick = (n) => {
    if (!n.isRead) {
      handleMarkAsRead(n._id);
    }

    let link = "/dashboard";
    switch (n.type) {
      case "marketplace":
      case "pre_order":
        link = n.metadata?.postId
          ? `/marketplace/${n.metadata.postId}`
          : "/marketplace";
        break;
      case "lost_found":
        link = "/lost-found";
        break;
      case "roommate":
        link = "/accommodation";
        break;
      case "event":
      case "society":
        link = n.metadata?.societyId
          ? `/societies/${n.metadata.societyId}`
          : "/societies";
        break;
      case "blood":
        link = "/medical-support";
        break;
      case "feedback":
        link = "/home"; // Anonymous feedback page
        break;
    }
    navigate(link);
  };

  const handleMarkAllRead = async () => {
    const token = sessionStorage.getItem("authToken");

    if (!token) {
      console.error("No auth token found");
      alert("Please login again to mark notifications as read.");
      return;
    }

    console.log("Attempting to mark all as read...");

    try {
      // Send request to backend first
      const response = await fetch(
        "http://localhost:4000/api/notifications/read-all",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      const data = await response.json();
      console.log("Mark all as read response:", data);

      if (!response.ok) {
        throw new Error(data.message || `Server error: ${response.status}`);
      }

      // Only update local state if backend succeeded
      if (data.success) {
        notifications.forEach((n) => readIdsRef.current.add(n._id));
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
        console.log("Successfully marked all as read");
      } else {
        throw new Error(data.message || "Failed to mark notifications as read");
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
      console.error("Error details:", error.message);
      alert(`Failed to mark all as read: ${error.message}`);
    }
  };

  return (
    <div className="rounded-xl bg-white shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 w-full">
      {/* Header */}

      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 flex-1 min-w-0">
          <span className="relative flex h-3 w-3 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />

            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
          </span>

          <span className="truncate">Live Feed</span>

          {unreadCount > 0 && (
            <span className="ml-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex-shrink-0">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </h3>
      </div>

      {/* Notifications */}

      <div className="max-h-96 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {loading ? (
          <>
            <NotificationSkeleton />
            <NotificationSkeleton />
            <NotificationSkeleton />
          </>
        ) : error ? (
          <div className="px-4 py-6 text-center">
            <p className="text-xs text-red-500">{error}</p>

            <button
              onClick={fetchNotifications}
              className="mt-2 text-xs text-red-500 underline"
            >
              Retry
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-400 text-xs">
            No notifications yet
          </div>
        ) : (
          notifications.map((n) => {
            const meta = TYPE_META[n.type] || TYPE_META.marketplace;

            return (
              <div
                key={n._id}
                onClick={() => handleNotificationClick(n)}
                className={`px-4 py-3 border-b border-gray-100 cursor-pointer transition-all duration-200 hover:bg-gray-50 hover:scale-[1.01] ${
                  !n.isRead
                    ? "border-l-4 border-red-500 bg-red-50/30"
                    : "opacity-70"
                }`}
              >
                <div className="flex gap-3 items-start min-w-0 w-full">
                  <div
                    className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center text-white ${meta.color}`}
                  >
                    •
                  </div>

                  <div className="flex-1 min-w-0 overflow-hidden">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-xs font-semibold text-gray-900 break-words">
                        {n.title}
                      </p>

                      {!n.isRead && (
                        <span className="w-2.5 h-2.5 flex-shrink-0 rounded-full bg-red-500 animate-pulse mt-1" />
                      )}
                    </div>

                    <p className="text-xs text-gray-600 mt-1 leading-relaxed line-clamp-2 break-words">
                      {n.message}
                    </p>

                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="text-[10px] text-gray-400 whitespace-nowrap">
                        {timeAgo(n.createdAt)}
                      </span>

                      <span
                        className={`text-[9px] bg-black font-medium px-2 py-0.5 rounded-full text-white ${meta.color} whitespace-nowrap`}
                      >
                        {meta.label}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}

      <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400 flex-wrap gap-2">
        <span className="whitespace-nowrap">Refreshes every 2s</span>

        <button
          onClick={fetchNotifications}
          className="font-semibold text-red-500 hover:text-red-600 whitespace-nowrap"
        >
          Refresh now
        </button>
      </div>
    </div>
  );
}
