import { useCallback } from 'react';
import { useFriends } from '@/features/friends/hooks/useFriends';
import { useFriendRequests } from '@/features/friends/hooks/useFriendRequests';
import { useAuthStore } from '@/stores/auth.store';

export type FriendshipStatus = 'friends' | 'sent' | 'received' | 'none';

export interface FriendshipStatusResult {
  status: FriendshipStatus;
  requestId: string | undefined;
}

/**
 * Hook dùng chung để xác định trạng thái quan hệ bạn bè giữa user hiện tại
 * và một user bất kỳ. Thay thế logic getFriendshipStatus trùng lặp ở nhiều component.
 */
export const useFriendshipStatus = () => {
  const { data: friends } = useFriends();
  const { data: requests } = useFriendRequests();
  const currentUserId = useAuthStore((s) => s.user?.id);

  const getFriendshipStatus = useCallback(
    (targetId: string): FriendshipStatusResult => {
      if (!friends || !requests) return { status: 'none', requestId: undefined };

      const isFriend = friends.some((f) => f.id === targetId);
      if (isFriend) return { status: 'friends', requestId: undefined };

      const sentReq = requests.find(
        (r) => r.senderId === currentUserId && r.receiverId === targetId && r.status === 'pending',
      );
      if (sentReq) return { status: 'sent', requestId: sentReq.id };

      const receivedReq = requests.find(
        (r) => r.receiverId === currentUserId && r.senderId === targetId && r.status === 'pending',
      );
      if (receivedReq) return { status: 'received', requestId: receivedReq.id };

      return { status: 'none', requestId: undefined };
    },
    [friends, requests, currentUserId],
  );

  return { getFriendshipStatus };
};
