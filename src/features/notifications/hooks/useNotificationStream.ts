import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { socketInstance } from '@/shared/lib/socket';
import { notificationQueryKeys } from '@/features/notifications/hooks/useNotifications';
import { useToast } from '@/contexts/ToastContext';
import { Notification } from '@/shared/types/models';

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

export const useNotificationStream = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    const handleNewNotification = (notification: Notification) => {
      // Invalidate queries to update badge and list
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.list() });
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.unreadCount() });

      // Show toast
      const actorName = notification.actor?.displayName || notification.actor?.handle || 'Someone';
      const displayText = notification.body || getDefaultText(notification.type, actorName);
      
      toast({
        title: 'New Notification',
        message: displayText,
        type: 'success'
      });
    };

    socketInstance.on('notification:new', handleNewNotification);
    return () => {
      socketInstance.off('notification:new', handleNewNotification);
    };
  }, [queryClient, toast]);
};
