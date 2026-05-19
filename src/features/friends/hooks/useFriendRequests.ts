import { useQuery } from '@tanstack/react-query';
import { friendApi, FriendRequestWithProfiles } from '@/shared/services/friendApi';
import { friendQueryKeys } from '@/features/friends/hooks/useFriends';

export const useFriendRequests = () => {
  return useQuery<FriendRequestWithProfiles[]>({
    queryKey: friendQueryKeys.requests(),
    queryFn: async () => {
      const res: any = await friendApi.getPendingRequests();
      if (Array.isArray(res)) return res;
      if (res?.data && Array.isArray(res.data)) return res.data;
      if (res?.data?.data && Array.isArray(res.data.data)) return res.data.data;
      return [];
    },
    refetchInterval: 30_000, // poll mỗi 30s như một fallback
  });
};
