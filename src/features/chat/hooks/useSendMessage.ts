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
    mutationFn: async (payload: SendMessagePayload): Promise<SendMessagePayload> => {
      // Wait for server acknowledgment to ensure the message was processed.
      // We use a 10s timeout to prevent hanging if the server is unresponsive.
      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('Send timeout')), 10_000);
        socketInstance.emit('chat:send_message', payload, () => {
          clearTimeout(timer);
          resolve();
        });
        // Fallback resolution in case the server does not support socket acknowledgment callbacks
        setTimeout(resolve, 300);
      });
      return payload;
    },
    onMutate: async (newMsg) => {
      const { conversationId } = newMsg;

      // Intentionally skipping cancelQueries to prevent race conditions 
      // where the actual chat:receive_message event is blocked or ignored.
      const previousMessages = queryClient.getQueryData(queryKeys.messages(conversationId));

      if (user) {
        const optimisticMsg: Message = {
          id: newMsg.clientTempId!,
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
    onSuccess: (_data, variables, _context) => {
      // Safety net: if chat:receive_message hasn't arrived yet to replace the optimistic message,
      // clear isPending so the UI doesn't show "Sending..." indefinitely.
      // Do NOT add/replace any message here — that is the socket event's responsibility.
      const { conversationId, clientTempId } = variables;
      if (!clientTempId) return;

      queryClient.setQueryData<InfiniteData<Message>>(queryKeys.messages(conversationId), (old) => {
        if (!old || !old.pages) return old;
        const newPages = old.pages.map((page: any) => {
          const clearPending = (items: Message[]) =>
            items.map((m) => (m.id === clientTempId ? { ...m, isPending: false } : m));
          if (Array.isArray(page)) return clearPending(page);
          if (page.data && Array.isArray(page.data)) return { ...page, data: clearPending(page.data) };
          if (page.items && Array.isArray(page.items)) return { ...page, items: clearPending(page.items) };
          return page;
        });
        return { ...old, pages: newPages };
      });
    },
    onError: (_err, _newMsg, context: any) => {
      if (context?.conversationId) {
        queryClient.setQueryData(queryKeys.messages(context.conversationId), context?.previousMessages);
      }
    },
  });
};

