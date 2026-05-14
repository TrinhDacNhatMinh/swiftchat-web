import { useInfiniteQuery } from '@tanstack/react-query';
import { messageApi } from '@/shared/services/messageApi';
import { queryKeys } from '@/features/chat/hooks/useConversations';

export const useMessages = (conversationId: string | null) => {
  return useInfiniteQuery({
    queryKey: queryKeys.messages(conversationId!),
    queryFn: ({ pageParam }) =>
      messageApi.getHistory(conversationId!, { cursor: pageParam as string | undefined, limit: 30 }),
    getNextPageParam: (lastPage: any) => lastPage.nextCursor ?? lastPage.data?.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
    enabled: !!conversationId, // Chỉ chạy Query khi đang chọn 1 đoạn hội thoại cụ thể
    staleTime: 5 * 60 * 1000,
  });
};
