import { useEffect } from 'react';
import { socketInstance } from '@/shared/lib/socket';
import { Message } from '@/shared/types/models';
import { useQueryClient } from '@tanstack/react-query';

export const useReadReceipt = (
  conversationId: string | null,
  messages: Message[],
) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!conversationId || messages.length === 0) return;

    // Ignore optimistic (pending) messages
    const confirmedMessages = messages.filter((m) => !m.isPending);
    if (confirmedMessages.length === 0) return;

    const lastMsg = confirmedMessages[confirmedMessages.length - 1];

    const markRead = () => {
      if (document.hasFocus()) {
        socketInstance.emit('chat:mark_read', {
          conversationId,
          messageId: lastMsg.id,
        });

        // Optimistically update the conversations cache
        queryClient.setQueriesData(
          { queryKey: ['conversations'] },
          (old: any) => {
            if (!old) return old;
            const updateList = (list: any[]) =>
              list.map((c) =>
                c.id === conversationId
                  ? {
                      ...c,
                      currentParticipant: {
                        ...c.currentParticipant,
                        lastReadMessageId: lastMsg.id,
                      },
                    }
                  : c,
              );
            if (Array.isArray(old)) return updateList(old);
            if (old.data && Array.isArray(old.data))
              return { ...old, data: updateList(old.data) };
            if (old.items && Array.isArray(old.items))
              return { ...old, items: updateList(old.items) };
            return old;
          },
        );
      }
    };

    markRead();

    window.addEventListener('focus', markRead);
    return () => {
      window.removeEventListener('focus', markRead);
    };
  }, [conversationId, messages.length, queryClient]);
};
