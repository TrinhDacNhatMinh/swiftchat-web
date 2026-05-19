import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { socketInstance } from '@/shared/lib/socket';
import { friendQueryKeys } from '@/features/friends/hooks/useFriends';

export const useFriendStream = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleFriendUpdated = () => {
      // Invalidate both friend list, friend requests list, and search results
      queryClient.invalidateQueries({ queryKey: friendQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: friendQueryKeys.requests() });
      queryClient.invalidateQueries({ queryKey: ['users', 'search'] });
    };

    socketInstance.on('friend:updated', handleFriendUpdated);
    return () => {
      socketInstance.off('friend:updated', handleFriendUpdated);
    };
  }, [queryClient]);
};
