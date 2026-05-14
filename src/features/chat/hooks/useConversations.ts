import { useQuery } from '@tanstack/react-query';
import { conversationApi } from '@/shared/services/conversationApi';
import { PaginatedResponse } from '@/shared/types/api';
import { Conversation } from '@/shared/types/models';

import { UseQueryResult } from '@tanstack/react-query';

export const queryKeys = {
  conversations: (q?: string) => q ? ['conversations', q] as const : ['conversations'] as const,
  messages: (conversationId: string) => ['messages', conversationId] as const,
  members: (conversationId: string) => ['members', conversationId] as const,
};

export function useConversations(limit: number = 20, q?: string): UseQueryResult<PaginatedResponse<Conversation>> {
  return useQuery({
    queryKey: queryKeys.conversations(q),
    queryFn: () => conversationApi.getList({ limit, q }),
    staleTime: 5 * 60 * 1000, // Cache 5 phút
  });
};
