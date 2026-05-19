import { useMutation, useQueryClient } from '@tanstack/react-query';
import { friendApi } from '@/shared/services/friendApi';
import { friendQueryKeys } from '@/features/friends/hooks/useFriends';
import { conversationApi } from '@/shared/services/conversationApi';

export const useFriendActions = () => {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: friendQueryKeys.all });
    queryClient.invalidateQueries({ queryKey: ['users', 'search'] });
  };

  const sendRequest = useMutation({
    mutationFn: (receiverId: string) => friendApi.sendRequest(receiverId),
    onSuccess: invalidate,
  });

  const respondRequest = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'accepted' | 'rejected' }) =>
      friendApi.respondRequest(id, action),
    onSuccess: invalidate,
  });

  const cancelRequest = useMutation({
    mutationFn: (id: string) => friendApi.cancelRequest(id),
    onSuccess: invalidate,
  });

  const unfriend = useMutation({
    mutationFn: (userId: string) => friendApi.unfriend(userId),
    onSuccess: invalidate,
  });

  // Tạo hoặc mở Direct Conversation với bạn bè
  const startDirectChat = useMutation({
    mutationFn: (userId: string) =>
      conversationApi.create({ type: 'direct', partnerId: userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    }
  });

  return { sendRequest, respondRequest, cancelRequest, unfriend, startDirectChat };
};
