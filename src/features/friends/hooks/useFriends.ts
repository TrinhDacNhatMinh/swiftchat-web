import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { friendApi, FriendProfile } from '@/shared/services/friendApi';
import { usePresenceStore } from '@/stores/presence.store';

export const friendQueryKeys = {
  all: ['friends'] as const,
  list: () => [...friendQueryKeys.all, 'list'] as const,
  requests: () => [...friendQueryKeys.all, 'requests'] as const,
};

export const useFriends = () => {
  const seedFromFriends = usePresenceStore((s) => s.seedFromFriends);

  const query = useQuery<FriendProfile[]>({
    queryKey: friendQueryKeys.list(),
    queryFn: async () => {
      const res: any = await friendApi.getFriends({ limit: 100 });
      let data: FriendProfile[] = [];
      if (Array.isArray(res)) data = res;
      else if (res?.data && Array.isArray(res.data)) data = res.data;
      else if (res?.data?.data && Array.isArray(res.data.data)) data = res.data.data;
      return data; // pure: chỉ fetch + transform, không có side effect
    },
  });

  // Seed presence store sau khi data thay đổi, tách biệt khỏi queryFn
  useEffect(() => {
    if (query.data) {
      seedFromFriends(query.data);
    }
  }, [query.data, seedFromFriends]);

  return query;
};

