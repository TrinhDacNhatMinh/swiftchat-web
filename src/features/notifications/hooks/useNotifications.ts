import { useQuery } from '@tanstack/react-query';
import { notificationApi } from '@/shared/services/notificationApi';
import { Notification } from '@/shared/types/models';

export const notificationQueryKeys = {
  all: ['notifications'] as const,
  list: () => [...notificationQueryKeys.all, 'list'] as const,
  unreadCount: () => [...notificationQueryKeys.all, 'unreadCount'] as const,
};

export const useNotifications = () => {
  return useQuery<Notification[]>({
    queryKey: notificationQueryKeys.list(),
    queryFn: async () => {
      const res = await notificationApi.getNotifications({ limit: 50 });
      return res.data ?? [];
    },
    staleTime: 30_000,
  });
};
