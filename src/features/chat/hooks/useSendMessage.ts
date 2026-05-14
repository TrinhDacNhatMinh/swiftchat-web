import { useMutation, useQueryClient } from '@tanstack/react-query';
import { socketInstance } from '@/shared/lib/socket';
import { queryKeys } from '@/features/chat/hooks/useConversations';
import { useAuthStore } from '@/stores/auth.store';
import { Message } from '@/shared/types/models';
import { InfiniteData } from '@/shared/types/api';

export interface SendMessagePayload {
  conversationId: string;
  content: string;
  clientTempId?: string;
  attachments?: string[];
  replyToMessageId?: string;
  type?: string;
}

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (payload: SendMessagePayload) => {
      socketInstance.emit('chat:send_message', payload);
      return payload;
    },
    onMutate: async (newMsg) => {
      const { conversationId } = newMsg;

      await queryClient.cancelQueries({ queryKey: queryKeys.messages(conversationId) });
      const previousMessages = queryClient.getQueryData(queryKeys.messages(conversationId));

      if (user) {
        const optimisticMsg: Message = {
          id: newMsg.clientTempId || `temp_${Date.now()}`,
          conversationId,
          senderId: user.id,
          content: newMsg.content,
          type: newMsg.attachments?.length ? 'file' : 'text',
          createdAt: new Date().toISOString(),
          isUnsent: false,
          isEdited: false,
          isDeleted: false,
          isPending: true,
          attachments: newMsg.attachments || [],
          replyTo: newMsg.replyToMessageId ? { messageId: newMsg.replyToMessageId, content: '', senderId: '', type: 'text' } : undefined,
        };

        queryClient.setQueryData<InfiniteData<Message>>(queryKeys.messages(conversationId), (old) => {
          if (!old || !old.pages) return old;
          const newPages = [...old.pages];
          if (newPages[0]) {
            // Handle both array pages and object pages
            if (Array.isArray(newPages[0])) {
              newPages[0] = [optimisticMsg, ...newPages[0]];
            } else if (newPages[0].data && Array.isArray(newPages[0].data)) {
              newPages[0] = { ...newPages[0], data: [optimisticMsg, ...newPages[0].data] };
            } else if ((newPages[0] as any).items) {
              newPages[0] = { ...newPages[0], items: [optimisticMsg, ...(newPages[0] as any).items] };
            }
          }
          return { ...old, pages: newPages, pageParams: old.pageParams || [] };

        });
      }

      return { previousMessages, conversationId };
    },
    onError: (_err, _newMsg, context) => {
      if (context?.conversationId) {
        queryClient.setQueryData(queryKeys.messages(context.conversationId), context?.previousMessages);
      }
    },
  });
};
