'use client';
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '@/lib/axios';
import { useAuth } from '@/hooks/useAuth';

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  readAt: string | null;
  metadata: {
    accountId?: string;
    transactionId?: string;
    amount?: number;
    accountNumber?: string;
    fromAccountId?: string;
    toAccountId?: string;
  } | null;
  userId: string;
  direction: "SENT" | "RECEIVED";
  createdAt: string;
}

interface PaginationData {
  page?: number;
  limit?: number;
  total: number;
  totalPages?: number;
  hasNext?: boolean;
  hasPrev?: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isOpen: boolean;
  isLoading: boolean;
  hasMore: boolean;
  togglePopup: () => void;
  closePopup: () => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  loadMore: () => Promise<void>;
  refetch: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const pollRef = useRef<NodeJS.Timeout>();

  const fetchNotifications = useCallback(
    async (pageNum = 1, append = false) => {
      if (!user) return;
      setIsLoading(true);
      try {
        const { data } = await api.get(`/notifications?page=${pageNum}&limit=20`);
        const items: Notification[] = data.data?.notifications || data.data || [];
        const pagination: PaginationData = data.data?.pagination || { total: items.length };

        setNotifications((prev) => (append ? [...prev, ...items] : items));
        setUnreadCount(data.data?.unreadCount ?? 0);
        setHasMore((pageNum * 20 < (pagination.total ?? 0)));
      } catch {
        // silently fail — do not show error toast for background poll
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  // Poll every 30 seconds for new notifications
  useEffect(() => {
    if (!user) return;
    fetchNotifications(1);
    pollRef.current = setInterval(() => fetchNotifications(1), 30000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [user, fetchNotifications]);

  const togglePopup = () => setIsOpen((prev) => !prev);
  const closePopup = () => setIsOpen(false);

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      /* silent */
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch {
      /* silent */
    }
  };

  const loadMore = async () => {
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchNotifications(nextPage, true);
  };

  const refetch = () => fetchNotifications(1);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isOpen,
        isLoading,
        hasMore,
        togglePopup,
        closePopup,
        markAsRead,
        markAllAsRead,
        loadMore,
        refetch,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used inside NotificationProvider');
  return ctx;
}
