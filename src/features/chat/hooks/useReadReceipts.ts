import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { conversationApi } from '@/shared/services/conversationApi';
import { socketInstance } from '@/shared/lib/socket';

export interface ReadReceipt {
  accountId: string;
  lastReadMessageId: string | null;
  account: {
    id: string;
    lastSeen: string | null;
    profile: {
      displayName: string | null;
      avatarUrl: string | null;
      handle: string | null;
    } | null;
  };
}

export const useReadReceipts = (conversationId: string | null) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['readReceipts', conversationId],
    queryFn: () => conversationApi.getReadReceipts(conversationId!),
    enabled: !!conversationId,
  });

  useEffect(() => {
    if (!conversationId) return;

    const handleReadReceipt = (data: { conversationId: string; accountId: string; messageId: string; timestamp: string }) => {
      if (data.conversationId !== conversationId) return;
      
      queryClient.setQueryData(['readReceipts', conversationId], (old: any) => {
        if (!old || !Array.isArray(old)) return old;
        
        let found = false;
        const newReceipts = old.map((receipt: ReadReceipt) => {
          if (receipt.accountId === data.accountId) {
            found = true;
            return { ...receipt, lastReadMessageId: data.messageId };
          }
          return receipt;
        });

        if (!found) {
          newReceipts.push({
            accountId: data.accountId,
            lastReadMessageId: data.messageId,
            account: { id: data.accountId, lastSeen: null, profile: null }
          });
        }

        return newReceipts;
      });
    };

    socketInstance.on('chat:read_receipt', handleReadReceipt);
    return () => {
      socketInstance.off('chat:read_receipt', handleReadReceipt);
    };
  }, [conversationId, queryClient]);

  return query;
};
