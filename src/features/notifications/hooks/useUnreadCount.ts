import { useQuery } from '@tanstack/react-query';
import { notificationApi } from '@/shared/services/notificationApi';
import { notificationQueryKeys } from '@/features/notifications/hooks/useNotifications';

export const useUnreadCount = () => {
  return useQuery<number>({
    queryKey: notificationQueryKeys.unreadCount(),
    queryFn: async () => {
      const res = await notificationApi.getUnreadCount();
      return res.data?.count ?? 0;
    },
    staleTime: 0, // luôn fresh để badge chính xác
    refetchInterval: 60_000, // fallback poll mỗi 1 phút
  });
};
