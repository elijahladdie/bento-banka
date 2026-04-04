'use client';
import { useEffect, useRef } from 'react';
import { useNotifications } from '@/context/NotificationContext';
import { useAuth } from '@/hooks/useAuth';
import NotificationPopupItem from './NotificationPopupItem';
import Spinner from './Spinner';
import { CheckCheck, Bell } from 'lucide-react';
import Link from 'next/link';
import { useUiText } from '@/lib/ui-text';

export default function NotificationPopup() {
  const { notifications, isLoading, hasMore, unreadCount, isOpen, markAllAsRead, loadMore, closePopup } =
    useNotifications();
  const { t } = useUiText();
  const { role } = useAuth();
  const popupRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        // Don't close if clicking the bell button itself
        const bell = document.getElementById('notification-bell');
        if (bell?.contains(e.target as Node)) return;
        closePopup();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [closePopup]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePopup();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [closePopup]);

  // Infinite scroll inside popup
  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el || isLoading || !hasMore) return;
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 60;
    if (nearBottom) loadMore();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      ref={popupRef}
      style={{
        position: 'absolute',
        top: 'calc(100% + 12px)',
        right: 0,
        width: 400,
        maxWidth: 'calc(100vw - 32px)',
        zIndex: 150,
        background: '#0a0f1ef2',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--glass-radius-lg)',
        boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(212,175,55,0.1)',
        animation: 'slideDown 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid var(--glass-border)',
          background: 'rgba(212,175,55,0.06)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Bell size={16} color="var(--gold)" />
          <span
            style={{
              fontWeight: 700,
              fontSize: '0.95rem',
              color: 'var(--text-primary)',
            }}
          >
            {t('notifications.title')}
          </span>
          {unreadCount > 0 && (
            <span
              style={{
                background: 'var(--gold-gradient)',
                color: '#0a0f1e',
                borderRadius: 50,
                fontSize: '0.7rem',
                fontWeight: 800,
                padding: '2px 8px',
              }}
            >
              {unreadCount} {t('notifications.unread')}
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            className="btn-icon"
            style={{
              gap: 6,
              fontSize: '0.78rem',
              padding: '6px 12px',
              borderRadius: 20,
            }}
            onClick={markAllAsRead}
          >
            <CheckCheck size={14} />
            {t('notifications.markAllRead')}
          </button>
        )}
      </div>

      {/* ── Scrollable List ── */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        style={{
          maxHeight: '50vh',
          overflowY: 'auto',
          overflowX: 'hidden',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(212,175,55,0.3) transparent',
        }}
      >
        <style>{`
          div::-webkit-scrollbar { width: 4px; }
          div::-webkit-scrollbar-track { background: transparent; }
          div::-webkit-scrollbar-thumb { 
            background: rgba(212,175,55,0.3); 
            border-radius: 4px; 
          }
          div::-webkit-scrollbar-thumb:hover { 
            background: rgba(212,175,55,0.5); 
          }
        `}</style>

        {isLoading && notifications.length === 0 ? (
          // Loading state — skeleton items
          <div style={{ padding: '12px 0' }}>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  padding: '16px 20px',
                  display: 'flex',
                  gap: 12,
                  alignItems: 'flex-start',
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'var(--glass-bg)',
                    animation: 'pulse 1.5s ease-in-out infinite',
                    flexShrink: 0,
                  }}
                />
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      height: 12,
                      borderRadius: 6,
                      background: 'var(--glass-bg)',
                      width: '60%',
                      animation: 'pulse 1.5s ease-in-out infinite',
                    }}
                  />
                  <div
                    style={{
                      height: 10,
                      borderRadius: 6,
                      background: 'var(--glass-bg)',
                      width: '90%',
                      animation: 'pulse 1.5s ease-in-out infinite',
                    }}
                  />
                  <div
                    style={{
                      height: 9,
                      borderRadius: 6,
                      background: 'var(--glass-bg)',
                      width: '30%',
                      animation: 'pulse 1.5s ease-in-out infinite',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          // Empty state
          <div
            style={{
              padding: '48px 20px',
              textAlign: 'center',
              color: 'var(--text-muted)',
            }}
          >
            <Bell size={32} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
            <p style={{ fontSize: '0.9rem' }}>{t('notifications.empty')}</p>
          </div>
        ) : (
          // Notification items
          <>
            {notifications.map((notification, index) => (
              <NotificationPopupItem
                key={notification.id}
                notification={notification}
                userRole={role ?? 'client'}
                isLast={index === notifications.length - 1}
              />
            ))}

            {/* Load more indicator */}
            {isLoading && notifications.length > 0 && (
              <div style={{ padding: '12px', textAlign: 'center' }}>
                <Spinner size={16} />
              </div>
            )}

            {!hasMore && notifications.length > 0 && (
              <div
                style={{
                  padding: '12px 20px',
                  textAlign: 'center',
                  fontSize: '0.78rem',
                  color: 'var(--text-muted)',
                  borderTop: '1px solid var(--glass-border)',
                }}
              >
                {t('notifications.allCaughtUp')}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Footer link ── */}
      {notifications.length > 0 && (
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid var(--glass-border)',
            background: 'rgba(212,175,55,0.04)',
            textAlign: 'center',
          }}
        >
          <Link
            href="/notifications"
            onClick={closePopup}
            style={{
              fontSize: '0.82rem',
              color: 'var(--gold)',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            {t('notifications.viewAll')} →
          </Link>
        </div>
      )}
    </div>
  );
}
