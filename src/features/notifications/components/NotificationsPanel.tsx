import { useTranslation } from 'react-i18next';
import { useNotifications } from '@/features/notifications/hooks/useNotifications';
import { useNotificationActions } from '@/features/notifications/hooks/useNotificationActions';
import { NotificationItem } from '@/features/notifications/components/NotificationItem';

interface NotificationsPanelProps {
  onOpenConversation?: (conversationId: string) => void;
  onSwitchTab?: (tab: 'chats' | 'people') => void;
}

export function NotificationsPanel({ onOpenConversation, onSwitchTab }: NotificationsPanelProps) {
  const { t } = useTranslation();
  const { data: notifications, isLoading } = useNotifications();
  const { markAllAsRead } = useNotificationActions();

  const unreadCount = notifications?.filter(n => !n.isRead).length ?? 0;

  const handleNavigate = (notification: any) => {
    if (!notification.referenceId) return;

    const type = notification.type.toUpperCase();
    if (type === 'NEW_MESSAGE' || type === 'GROUP_INVITE' || type === 'MESSAGE') {
      if (onOpenConversation) onOpenConversation(notification.referenceId);
    } else if (type === 'FRIEND_REQUEST_RECEIVED' || type === 'FRIEND_REQUEST_ACCEPTED') {
      if (onSwitchTab) onSwitchTab('people');
    }
  };

  return (
    <aside className="fixed left-[72px] top-0 h-screen w-[360px] bg-surface-container-low border-r border-outline-variant flex flex-col z-40">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-[22px] font-bold text-on-surface tracking-tight">
            {t('nav.notifications', 'Thông báo')}
          </h2>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead.mutate()}
              disabled={markAllAsRead.isPending}
              className="flex items-center gap-1 text-xs text-primary hover:opacity-80 transition-opacity font-medium disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[14px]">done_all</span>
              {t('common.markAllRead', 'Đánh dấu tất cả đã đọc')}
            </button>
          )}
        </div>
        {unreadCount > 0 && (
          <p className="text-xs text-on-surface-variant">
            {unreadCount} {t('common.unreadNotifications', 'thông báo chưa đọc')}
          </p>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {isLoading ? (
          /* Skeleton Loading */
          <div className="space-y-2 px-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-start gap-3 p-3 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-surface-container-high flex-shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-3 bg-surface-container-high rounded w-3/4" />
                  <div className="h-2 bg-surface-container-high rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : !notifications || notifications.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center h-full px-6 py-12 text-center opacity-80 animate-in fade-in">
            <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center mb-4 border border-outline-variant/30">
              <span className="material-symbols-outlined text-[32px] text-on-surface-variant">
                notifications_off
              </span>
            </div>
            <h3 className="text-sm font-medium text-on-surface mb-1">{t('common.noNotifications', 'Không có thông báo')}</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              {t('common.noNotificationsDesc', 'Bạn đã xem hết tất cả thông báo.')}
            </p>
          </div>
        ) : (
          /* Notification List */
          <div className="space-y-0.5">
            {/* Unread section */}
            {notifications.some(n => !n.isRead) && (
              <>
                <p className="px-4 py-2 text-xs font-bold text-on-surface-variant/60 uppercase tracking-widest">
                  {t('common.new', 'Mới')}
                </p>
                {notifications
                  .filter(n => !n.isRead)
                  .map(n => <NotificationItem key={n.id} notification={n} onNavigate={handleNavigate} />)}
              </>
            )}

            {/* Read section */}
            {notifications.some(n => n.isRead) && (
              <>
                <div className="mx-4 my-2 border-t border-outline-variant/50" />
                <p className="px-4 py-2 text-xs font-bold text-on-surface-variant/60 uppercase tracking-widest mt-2">
                  {t('common.earlier', 'Trước đó')}
                </p>
                {notifications
                  .filter(n => n.isRead)
                  .map(n => <NotificationItem key={n.id} notification={n} onNavigate={handleNavigate} />)}
              </>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
