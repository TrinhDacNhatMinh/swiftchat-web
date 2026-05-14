import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { socketInstance } from '@/shared/lib/socket';
import { usePresenceStore } from '@/stores/presence.store';

/**
 * Hook độc lập, lắng nghe sự kiện presence:status từ Socket.
 * Được gắn ở ChatPage để hoạt động bất kể người dùng có đang mở
 * cuộc trò chuyện nào hay không.
 */
export const usePresenceStream = () => {
  const queryClient = useQueryClient();
  const setOnline = usePresenceStore((s) => s.setOnline);
  const setOffline = usePresenceStore((s) => s.setOffline);

  useEffect(() => {
    const handlePresenceStatus = (data: {
      userId?: string;
      accountId?: string;
      status: 'online' | 'offline';
      timestamp: string;
    }) => {
      // Hỗ trợ cả hai trường để tương thích ngược
      const id = data.userId ?? data.accountId;
      if (!id) return;

      // 1. Cập nhật presence store (single source of truth)
      if (data.status === 'online') setOnline(id);
      else setOffline(id);

      // 2. Cập nhật lastSeen trong conversations cache
      queryClient.setQueriesData({ queryKey: ['conversations'] }, (old: any) => {
        if (!old) return old;

        const updateParticipants = (items: any[]) =>
          items.map((conv) => ({
            ...conv,
            participants: conv.participants?.map((p: any) =>
              p.userId === id || p.accountId === id
                ? {
                    ...p,
                    user: {
                      ...p.user,
                      lastSeen:
                        data.status === 'online'
                          ? new Date().toISOString()
                          : data.timestamp,
                    },
                  }
                : p
            ),
          }));

        if (Array.isArray(old)) return updateParticipants(old);
        if (old.data && Array.isArray(old.data))
          return { ...old, data: updateParticipants(old.data) };
        if (old.items) return { ...old, items: updateParticipants(old.items) };
        return old;
      });
    };

    socketInstance.on('presence:status', handlePresenceStatus);
    return () => {
      socketInstance.off('presence:status', handlePresenceStatus);
    };
  }, [queryClient, setOnline, setOffline]);
};
