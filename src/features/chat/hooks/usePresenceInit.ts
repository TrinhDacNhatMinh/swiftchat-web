import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { friendApi } from '@/shared/services/friendApi';
import { usePresenceStore } from '@/stores/presence.store';
import { friendQueryKeys } from '@/features/friends/hooks/useFriends';

/**
 * Hook này được gọi 1 lần ở ChatPage để seed presence store
 * từ dữ liệu API ngay khi user vào app, bất kể tab nào đang active.
 * Nếu FriendList cũng đang mount, React Query sẽ tự deduplicate request.
 */
export const usePresenceInit = () => {
  const seedFromFriends = usePresenceStore((s) => s.seedFromFriends);

  const { data } = useQuery({
    queryKey: friendQueryKeys.list(),
    queryFn: async () => {
      const res: any = await friendApi.getFriends({ limit: 100 });
      let friends: any[] = [];
      if (Array.isArray(res)) friends = res;
      else if (res?.data && Array.isArray(res.data)) friends = res.data;
      else if (res?.data?.data && Array.isArray(res.data.data)) friends = res.data.data;
      return friends;
    },
    staleTime: 15_000,       // stale sau 15s
    refetchInterval: 30_000, // refetch mỗi 30s để cập nhật trạng thái online mới nhất
  });

  useEffect(() => {
    if (data && data.length > 0) {
      seedFromFriends(data);
    }
  }, [data, seedFromFriends]);
};
