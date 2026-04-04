'use client';
import { useRouter } from 'next/navigation';
import { useNotifications, Notification } from '@/context/NotificationContext';
import {
  CheckCircle,
  XCircle,
  ArrowDownCircle,
  ArrowUpCircle,
  ArrowLeftRight,
  Lock,
  UserCheck,
  UserX,
  Bell,
  CreditCard,
  Key,
  User,
} from 'lucide-react';
import { useToast } from '@/hooks/useToast';

// Maps notification type to icon, color, bg, and href
const NOTIFICATION_CONFIG: Record<
  string,
  {
    icon: React.ElementType;
    color: string;
    bg: string;
    getHref: (role: string, meta: any) => string;
  }
> = {
  ACCOUNT_APPROVED: {
    icon: CheckCircle,
    color: 'var(--success-text)',
    bg: 'var(--success-glass)',
    getHref: (role) => `/${role}/accounts`,
  },
  ACCOUNT_REJECTED: {
    icon: XCircle,
    color: 'var(--error-text)',
    bg: 'var(--error-glass)',
    getHref: (role) => `/${role}/accounts`,
  },
  ACCOUNT_FROZEN: {
    icon: Lock,
    color: 'var(--info-text)',
    bg: 'var(--info-glass)',
    getHref: (role) => `/${role}/accounts`,
  },
  ACCOUNT_DORMANT: {
    icon: Lock,
    color: 'var(--warning-text)',
    bg: 'var(--warning-glass)',
    getHref: (role) => `/${role}/accounts`,
  },
  ACCOUNT_CLOSED: {
    icon: XCircle,
    color: 'var(--error-text)',
    bg: 'var(--error-glass)',
    getHref: (role) => `/${role}/accounts`,
  },
  DEPOSIT_RECEIVED: {
    icon: ArrowDownCircle,
    color: 'var(--success-text)',
    bg: 'var(--success-glass)',
    getHref: (role, meta) =>
      meta?.accountId ? `/${role}/accounts/${meta.accountId}/transactions` : `/${role}/accounts`,
  },
  WITHDRAWAL_CODE_SENT: {
    icon: Key,
    color: 'var(--warning-text)',
    bg: 'var(--warning-glass)',
    getHref: (role, meta) =>
      meta?.accountId ? `/${role}/accounts/${meta.accountId}/transactions` : `/${role}/transactions`,
  },
  WITHDRAWAL_PROCESSED: {
    icon: ArrowUpCircle,
    color: 'var(--error-text)',
    bg: 'var(--error-glass)',
    getHref: (role, meta) =>
      meta?.accountId ? `/${role}/accounts/${meta.accountId}/transactions` : `/${role}/accounts`,
  },
  TRANSFER_SENT: {
    icon: ArrowLeftRight,
    color: 'var(--info-text)',
    bg: 'var(--info-glass)',
    getHref: (role, meta) =>
      meta?.fromAccountId
        ? `/${role}/accounts/${meta.fromAccountId}/transactions`
        : `/${role}/accounts`,
  },
  TRANSFER_RECEIVED: {
    icon: ArrowLeftRight,
    color: 'var(--success-text)',
    bg: 'var(--success-glass)',
    getHref: (role, meta) =>
      meta?.toAccountId
        ? `/${role}/accounts/${meta.toAccountId}/transactions`
        : `/${role}/accounts`,
  },
  PASSWORD_CHANGED: {
    icon: Key,
    color: 'var(--warning-text)',
    bg: 'var(--warning-glass)',
    getHref: (role) => `/profile`,
  },
  PROFILE_UPDATED: {
    icon: User,
    color: 'var(--info-text)',
    bg: 'var(--info-glass)',
    getHref: (role) => `/profile`,
  },
  USER_ACTIVATED: {
    icon: UserCheck,
    color: 'var(--success-text)',
    bg: 'var(--success-glass)',
    getHref: (role) => `/${role}/dashboard`,
  },
  USER_DEACTIVATED: {
    icon: UserX,
    color: 'var(--error-text)',
    bg: 'var(--error-glass)',
    getHref: (role) => `/${role}/dashboard`,
  },
  BANK_ACCOUNT_CREATED: {
    icon: CreditCard,
    color: 'var(--gold)',
    bg: 'rgba(212,175,55,0.12)',
    getHref: (role) => `/${role}/accounts`,
  },
  WELCOME: {
    icon: Bell,
    color: 'var(--gold)',
    bg: 'rgba(212,175,55,0.12)',
    getHref: (role) => `/${role}/dashboard`,
  },
};

const DEFAULT_CONFIG = {
  icon: Bell,
  color: 'var(--text-muted)',
  bg: 'var(--glass-bg)',
  getHref: (role: string) => `/${role}/dashboard`,
};

function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

interface Props {
  notification: Notification;
  userRole: string;
  isLast: boolean;
}

export default function NotificationPopupItem({ notification, userRole, isLast }: Props) {
  const router = useRouter();
  const { showToast } = useToast();
  const { markAsRead, closePopup } = useNotifications();
  const config = NOTIFICATION_CONFIG[notification.type] ?? DEFAULT_CONFIG;
  const Icon = config.icon;

  const handleClick = async () => {
    // 1. Mark as read if not already
    if (!notification.isRead) {
      await markAsRead(notification.id);
    } else {
      showToast("info", "Notification already marked as read");
    }

    closePopup();
  };

  return (
    <div
      onClick={handleClick}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: '14px 20px',
        cursor: 'pointer',
        transition: 'var(--transition-fast)',
        borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.04)',
        background: notification.isRead ? 'transparent' : 'rgba(212, 175, 55, 0.04)',
        borderLeft: notification.isRead ? '3px solid transparent' : '3px solid rgba(212,175,55,0.5)',
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = 'var(--glass-bg-hover)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = notification.isRead
          ? 'transparent'
          : 'rgba(212,175,55,0.04)';
      }}
    >
      {/* Icon circle */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: config.bg,
          border: `1px solid ${config.color}33`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={16} color={config.color} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 8,
            marginBottom: 3,
          }}
        >
          <span
            style={{
              fontSize: '0.875rem',
              fontWeight: notification.isRead ? 500 : 700,
              color: notification.isRead ? 'var(--text-secondary)' : 'var(--text-primary)',
              lineHeight: 1.3,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1,
            }}
          >
            {notification.title}
          </span>

          {/* Unread dot */}
          {!notification.isRead && (
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: 'var(--gold)',
                flexShrink: 0,
                marginTop: 3,
                boxShadow: '0 0 6px rgba(212,175,55,0.6)',
              }}
            />
          )}
        </div>

        {/* Message — 2 lines max */}
        <p
          style={{
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            lineHeight: 1.5,
            margin: 0,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {notification.message}
        </p>

        {/* Timestamp */}
        <span
          style={{
            fontSize: '0.72rem',
            color: 'var(--text-muted)',
            marginTop: 5,
            display: 'block',
            opacity: 0.7,
          }}
        >
          {formatDateTime(notification.createdAt)}
        </span>
      </div>
    </div>
  );
}
