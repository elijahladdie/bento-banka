"use client";

import { useCallback, useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import GlassCard from "@/components/ui/GlassCard";
import GlassButton from "@/components/ui/GlassButton";
import { apiClient, extractErrorMessage } from "@/lib/api-client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { useUiText } from "@/lib/ui-text";
import { useNotifications } from "@/context/NotificationContext";
import { useQuery } from "@tanstack/react-query";

type NotificationDirection = "SENT" | "RECEIVED";
type NotificationFilter = "all" | "read" | "unread" | "sent" | "received";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  userId: string;
  direction: NotificationDirection;
  metadata?: Record<string, unknown> | null;
};

const FILTERS: NotificationFilter[] = ["all", "read", "unread", "sent", "received"];

const formatTimestamp = (input: string) => {
  const date = new Date(input);
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function NotificationsPageContent() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { t } = useUiText();
  const { refetch: refetchNotificationPopup } = useNotifications();
  const [selectedFilter, setSelectedFilter] = useState<NotificationFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const fetchNotifications = useCallback(async () => {
    const response = await apiClient.get("/notifications");
    const items = response.data?.data?.notifications ?? [];
    setNotifications(items);
    return items as NotificationItem[];
  }, []);

  const { isLoading, isFetching, refetch } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: fetchNotifications,
    enabled: Boolean(user?.id),
  });

  const getDirection = useCallback(
    (notification: NotificationItem): NotificationDirection => {
      return notification.direction;
    },
    []
  );

  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      const direction = getDirection(item);

      if (selectedFilter === "read") return item.isRead;
      if (selectedFilter === "unread") return !item.isRead;
      if (selectedFilter === "sent") return direction === "SENT";
      if (selectedFilter === "received") return direction === "RECEIVED";
      return true;
    });
  }, [getDirection, notifications, selectedFilter]);

  const markAsRead = async (id: string) => {
    const previous = notifications;
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id && !notification.isRead
          ? { ...notification, isRead: true, readAt: new Date().toISOString() }
          : notification
      )
    );

    try {
      await apiClient.patch(`/notifications/${id}/read`);
      void refetchNotificationPopup();
    } catch (error) {
      setNotifications(previous);
      showToast("error", extractErrorMessage(error, t("notificationsPage.errors.markRead", "Unable to mark as read")));
    }
  };

  const markAsUnread = async (id: string) => {
    const previous = notifications;
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? { ...notification, isRead: false, readAt: null }
          : notification
      )
    );

    try {
      await apiClient.patch(`/notifications/${id}/unread`);
      void refetchNotificationPopup();
    } catch (error) {
      setNotifications(previous);
      showToast("error", extractErrorMessage(error, t("notificationsPage.errors.markUnread", "Unable to mark as unread")));
    }
  };

  const markAllAsRead = async () => {
    const previous = notifications;
    setNotifications((current) => current.map((item) => ({ ...item, isRead: true, readAt: new Date().toISOString() })));

    try {
      await apiClient.patch("/notifications/read-all");
      void refetchNotificationPopup();
      showToast("success", t("notificationsPage.success.markAllRead", "All notifications marked as read"));
    } catch (error) {
      setNotifications(previous);
      showToast("error", extractErrorMessage(error, t("notificationsPage.errors.markAllRead", "Unable to mark all as read")));
    }
  };

  const onView = async (notification: NotificationItem) => {
    setSelectedId((current) => (current === notification.id ? null : notification.id));
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
  };

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <GlassCard className="space-y-4" heavy>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{t("notificationsPage.title", "Notifications")}</h1>
              <p className="text-sm text-muted-foreground">{t("notificationsPage.subtitle", "Track all updates, alerts, and account activity in one place.")}</p>
            </div>
            <div className="flex items-center gap-2">
              <GlassButton variant="secondary" onClick={() => void refetch()} loading={isFetching}>
                {t("notificationsPage.actions.refresh", "Refresh")}
              </GlassButton>
              <GlassButton onClick={() => void markAllAsRead()} disabled={!unreadCount}>
                {t("notificationsPage.actions.markAllRead", "Mark all as read")}
              </GlassButton>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {FILTERS.map((filter) => {
              const active = selectedFilter === filter;
              return (
                <button
                  key={filter}
                  type="button"
                  className={`btn-secondary rounded-full px-4 py-2 text-xs ${active ? "!border-[var(--gold)] !text-[var(--gold)]" : ""}`}
                  onClick={() => setSelectedFilter(filter)}
                >
                  {t(`notificationsPage.filters.${filter}`, filter)}
                </button>
              );
            })}
          </div>
        </GlassCard>

        {isLoading ? (
          <GlassCard>
            <p className="text-sm text-muted-foreground">{t("notificationsPage.loading", "Loading notifications...")}</p>
          </GlassCard>
        ) : filteredNotifications.length === 0 ? (
          <GlassCard className="text-center">
            <h2 className="text-lg font-semibold text-foreground">{t("notificationsPage.emptyTitle", "No notifications yet")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{t("notificationsPage.emptyDescription", "When activity happens on your account, it will appear here.")}</p>
          </GlassCard>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => {
              const direction = getDirection(notification);
              const selected = selectedId === notification.id;

              return (
                <GlassCard
                  key={notification.id}
                  className={`space-y-3 border ${notification.isRead ? "border-[var(--glass-border)]" : "border-[rgba(212,175,55,0.45)]"}`}
                  nohover
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-1">
                      <h3 className={`text-base ${notification.isRead ? "font-medium text-foreground" : "font-bold text-foreground"}`}>
                        {notification.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                      <p className="text-xs text-muted-foreground">{formatTimestamp(notification.createdAt)}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`badge ${notification.isRead ? "badge-inactive" : "badge-active"}`}>
                        {notification.isRead
                          ? t("notificationsPage.badges.read", "Read")
                          : t("notificationsPage.badges.unread", "Unread")}
                      </span>
                      <span className={`badge ${direction === "SENT" ? "badge-transfer" : "badge-deposit"}`}>
                        {direction === "SENT"
                          ? t("notificationsPage.badges.sent", "Sent")
                          : t("notificationsPage.badges.received", "Received")}
                      </span>
                      <span className="badge badge-pending">{t(`notifications.${notification.type}`, notification.type)}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <GlassButton variant="secondary" onClick={() => void onView(notification)}>
                      {selected
                        ? t("notificationsPage.actions.hideDetails", "Hide details")
                        : t("notificationsPage.actions.view", "View")}
                    </GlassButton>

                    {notification.isRead ? (
                      <GlassButton variant="secondary" onClick={() => void markAsUnread(notification.id)}>
                        {t("notificationsPage.actions.markUnread", "Mark unread")}
                      </GlassButton>
                    ) : (
                      <GlassButton variant="secondary" onClick={() => void markAsRead(notification.id)}>
                        {t("notificationsPage.actions.markRead", "Mark read")}
                      </GlassButton>
                    )}
                  </div>

                  {selected ? (
                    <div className="rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-3 text-sm text-muted-foreground">
                      <p className="mb-1 text-xs uppercase tracking-wide text-foreground/80">
                        {t("notificationsPage.details.title", "Notification details")}
                      </p>
                      <p className="text-xs">
                        {t("notificationsPage.details.id", "ID")}: {notification.id}
                      </p>
                      {notification.metadata ? (
                        <pre className="mt-2 overflow-x-auto rounded-lg bg-black/20 p-2 text-xs text-foreground/80">
                          {JSON.stringify(notification.metadata, null, 2)}
                        </pre>
                      ) : (
                        <p className="mt-2 text-xs">{t("notificationsPage.details.noMetadata", "No additional metadata")}</p>
                      )}
                    </div>
                  ) : null}
                </GlassCard>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
