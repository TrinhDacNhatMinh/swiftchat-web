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
        if (!old || !old.data) return old;
        
        const newReceipts = old.data.map((receipt: ReadReceipt) => 
          receipt.accountId === data.accountId 
            ? { ...receipt, lastReadMessageId: data.messageId }
            : receipt
        );

        return { ...old, data: newReceipts };
      });
    };

    socketInstance.on('chat:read_receipt', handleReadReceipt);
    return () => {
      socketInstance.off('chat:read_receipt', handleReadReceipt);
    };
  }, [conversationId, queryClient]);

  return query;
};
