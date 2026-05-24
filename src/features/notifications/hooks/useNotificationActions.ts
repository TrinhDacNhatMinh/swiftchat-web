import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '@/shared/services/notificationApi';
import { notificationQueryKeys } from '@/features/notifications/hooks/useNotifications';

export const useNotificationActions = () => {
  const queryClient = useQueryClient();

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all });
  };

  const markAsRead = useMutation({
    mutationFn: (id: string) => notificationApi.markAsRead(id),
    // Optimistic update: đánh dấu đọc ngay lập tức trên UI
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: notificationQueryKeys.list() });
      const prev = queryClient.getQueryData(notificationQueryKeys.list());
      queryClient.setQueryData(notificationQueryKeys.list(), (old: any[]) =>
        old?.map(n => n.id === id ? { ...n, isRead: true } : n) ?? []
      );
      // Giảm badge count ngay lập tức
      queryClient.setQueryData(notificationQueryKeys.unreadCount(), (old: number) =>
        Math.max(0, (old ?? 0) - 1)
      );
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      queryClient.setQueryData(notificationQueryKeys.list(), ctx?.prev);
      invalidateAll();
    },
    onSettled: invalidateAll,
  });

  const markAllAsRead = useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: notificationQueryKeys.all });
      const prev = queryClient.getQueryData(notificationQueryKeys.list());
      queryClient.setQueryData(notificationQueryKeys.list(), (old: any[]) =>
        old?.map(n => ({ ...n, isRead: true })) ?? []
      );
      queryClient.setQueryData(notificationQueryKeys.unreadCount(), 0);
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      queryClient.setQueryData(notificationQueryKeys.list(), ctx?.prev);
      invalidateAll();
    },
    onSettled: invalidateAll,
  });

  return { markAsRead, markAllAsRead };
};
