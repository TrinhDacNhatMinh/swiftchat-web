import { Notification } from '@/shared/types/models';
import { useNotificationActions } from '@/features/notifications/hooks/useNotificationActions';
import { formatDistanceToNow } from '@/shared/utils/formatDate';

const NOTIFICATION_ICONS: Record<string, string> = {
  FRIEND_REQUEST_RECEIVED: 'person_add',
  FRIEND_REQUEST_ACCEPTED: 'how_to_reg',
  GROUP_INVITE: 'group_add',
  DEFAULT: 'notifications',
};

const getIcon = (type: string) => NOTIFICATION_ICONS[type] ?? NOTIFICATION_ICONS.DEFAULT;

const getDefaultText = (type: string, actorName: string): string => {
  switch (type.toUpperCase()) {
    case 'FRIEND_REQUEST_RECEIVED':
      return `${actorName} sent you a friend request`;
    case 'FRIEND_REQUEST_ACCEPTED':
      return `${actorName} accepted your friend request`;
    case 'GROUP_INVITE':
      return `${actorName} invited you to a group`;
    default:
      return `You have a new notification`;
  }
};

interface NotificationItemProps {
  notification: Notification;
  onNavigate?: (notification: Notification) => void;
}

export function NotificationItem({ notification, onNavigate }: NotificationItemProps) {
  const { markAsRead } = useNotificationActions();
  const actorName =
    notification.actor?.displayName ||
    notification.actor?.handle ||
    'Someone';

  const normalizedType = notification.type.toUpperCase();
  const displayText = notification.body || getDefaultText(normalizedType, actorName);
  const icon = getIcon(normalizedType);

  const handleClick = () => {
    if (!notification.isRead) {
      markAsRead.mutate(notification.id);
    }
    if (onNavigate) {
      onNavigate(notification);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors rounded-xl group relative
        ${notification.isRead
          ? 'hover:bg-surface-container-high/40'
          : 'bg-surface-container-high hover:bg-surface-container-highest'
        }`}
    >
      {/* Unread dot */}
      {!notification.isRead && (
        <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
      )}

      {/* Actor Avatar or Icon */}
      <div className="w-10 h-10 rounded-full bg-surface-container-highest flex-shrink-0 flex items-center justify-center border border-outline-variant overflow-hidden">
        {notification.actor?.avatarUrl ? (
          <img
            src={notification.actor.avatarUrl}
            alt={actorName}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
            {icon}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-snug ${notification.isRead ? 'text-on-surface-variant' : 'text-on-surface font-medium'}`}>
          {notification.title && (
            <span className="font-semibold">{notification.title} </span>
          )}
          {displayText}
        </p>
        {notification.createdAt && (
          <p className="text-xs text-on-surface-variant/60 mt-0.5">
            {formatDistanceToNow(notification.createdAt)}
          </p>
        )}
      </div>
    </button>
  );
};
