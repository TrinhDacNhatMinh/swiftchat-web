import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { blockApi, BlockedUser } from '@/shared/services/blockApi';

const blockQueryKeys = {
  all: ['block'] as const,
  list: () => [...blockQueryKeys.all, 'list'] as const,
};

export const useBlockList = () => {
  return useQuery<BlockedUser[]>({
    queryKey: blockQueryKeys.list(),
    queryFn: blockApi.getBlockList,
  });
};

export const useBlockStatus = (targetId: string | null) => {
  return useQuery({
    queryKey: [...blockQueryKeys.all, 'status', targetId],
    queryFn: () => blockApi.getBlockStatus(targetId!),
    enabled: !!targetId,
  });
};

export const useBlockUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (targetId: string) => blockApi.blockUser(targetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blockQueryKeys.all });
      // Invalidate conversations & friends to remove the blocked user from views if needed
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'search'] });
    },
  });
};

export const useUnblockUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (targetId: string) => blockApi.unblockUser(targetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blockQueryKeys.all });
      // Invalidate users search in case they search for them again
      queryClient.invalidateQueries({ queryKey: ['users', 'search'] });
    },
  });
};
