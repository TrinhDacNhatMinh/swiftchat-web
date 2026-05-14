import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { socketInstance } from '@/shared/lib/socket';
import { queryKeys } from '@/features/chat/hooks/useConversations';
import { Message } from '@/shared/types/models';
import { InfiniteData } from '@/shared/types/api';
import { useAuthStore } from '@/stores/auth.store';
import {
  updateMessagePages,
  updateConversationList,
  updateMessageInCache,
  updateMultipleMessagesInCache,
} from '@/shared/utils/queryCacheUtils';

export const useMessageStream = (conversationId: string | null) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!conversationId) return;
    // 1. Join room (Conversation ID)
    socketInstance.emit('chat:join_room', { conversationId });
  }, [conversationId]);

  useEffect(() => {
    // 2. Lắng nghe tin nhắn mới (Global)
    const handleReceiveMessage = (
      newMessage: Message & { clientTempId?: string },
    ) => {
      const convId = newMessage.conversationId;
      if (!convId) return;

      queryClient.setQueryData<InfiniteData<Message>>(
        queryKeys.messages(convId),
        (old) => updateMessagePages(old, newMessage, newMessage.clientTempId),
      );

      let foundConv = false;
      queryClient.setQueriesData(
        { queryKey: ['conversations'] },
        (old: any) => {
          const res = updateConversationList(old, convId, newMessage);
          // The utility updateConversationList returns the SAME array reference if it doesn't find the conv
          if (
            old !== res &&
            (Array.isArray(old)
              ? old
              : (old as any)?.data || (old as any)?.items) !==
              (Array.isArray(res)
                ? res
                : (res as any)?.data || (res as any)?.items)
          ) {
            foundConv = true;
          }
          return res;
        },
      );

      if (!foundConv) {
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
      }
    };

    const handleReadReceipt = (data: {
      conversationId: string;
      userId: string;
      messageId: string;
      timestamp: string;
    }) => {
      if (data.userId === useAuthStore.getState().user?.id) return;

      queryClient.setQueryData<InfiniteData<Message>>(
        queryKeys.messages(data.conversationId),
        (old) =>
          updateMultipleMessagesInCache(
            old,
            (msg: Message) =>
              msg.id === data.messageId ||
              new Date(msg.createdAt) <= new Date(data.timestamp),
            (msg: Message) => ({ ...msg, status: 'read' as const }),
          ),
      );
    };

    const handleMessageEdited = (data: {
      conversationId: string;
      messageId: string;
      content: string;
    }) => {
      queryClient.setQueryData<InfiniteData<Message>>(
        queryKeys.messages(data.conversationId),
        (old) =>
          updateMessageInCache(old, data.messageId, (msg: Message) => ({
            ...msg,
            content: data.content,
            isEdited: true,
          })),
      );

      // Update in conversation list if it's the last message
      queryClient.setQueriesData({ queryKey: ['conversations'] }, (old: any) =>
        updateConversationList(old, data.conversationId, null, (c: any) => {
          if (
            c.id === data.conversationId &&
            c.lastMessage?.id === data.messageId
          ) {
            return {
              ...c,
              lastMessage: {
                ...c.lastMessage,
                content: data.content,
                isEdited: true,
              },
            };
          }
          return c;
        }),
      );
    };

    const handleMessageUnsent = (data: {
      conversationId: string;
      messageId: string;
    }) => {
      queryClient.setQueryData<InfiniteData<Message>>(
        queryKeys.messages(data.conversationId),
        (old) =>
          updateMultipleMessagesInCache(
            old,
            (msg: Message) =>
              msg.id === data.messageId ||
              msg.replyTo?.messageId === data.messageId,
            (msg: Message) => {
              let updated = msg;
              if (msg.id === data.messageId) {
                updated = { ...updated, isUnsent: true, content: '' };
              }
              if (msg.replyTo?.messageId === data.messageId) {
                updated = {
                  ...updated,
                  replyTo: { ...msg.replyTo, isUnsent: true, content: '' },
                };
              }
              return updated;
            },
          ),
      );

      // Update in conversation list if it's the last message
      queryClient.setQueriesData({ queryKey: ['conversations'] }, (old: any) =>
        updateConversationList(old, data.conversationId, null, (c: any) => {
          if (
            c.id === data.conversationId &&
            c.lastMessage?.id === data.messageId
          ) {
            return {
              ...c,
              lastMessage: { ...c.lastMessage, isUnsent: true, content: '' },
            };
          }
          return c;
        }),
      );
    };

    const handleReactionUpdated = (data: {
      conversationId: string;
      messageId: string;
      reactions: any[];
    }) => {
      queryClient.setQueryData<InfiniteData<Message>>(
        queryKeys.messages(data.conversationId),
        (old) =>
          updateMessageInCache(old, data.messageId, (msg: Message) => ({
            ...msg,
            reactions: data.reactions,
          })),
      );
    };

    const handleMessagePinned = (data: {
      conversationId: string;
      messageId: string;
    }) => {
      queryClient.setQueryData<InfiniteData<Message>>(
        queryKeys.messages(data.conversationId),
        (old) =>
          updateMessageInCache(old, data.messageId, (msg: Message) => ({
            ...msg,
            isPinned: true,
          })),
      );
    };

    const handleMessageUnpinned = (data: {
      conversationId: string;
      messageId: string;
    }) => {
      queryClient.setQueryData<InfiniteData<Message>>(
        queryKeys.messages(data.conversationId),
        (old) =>
          updateMessageInCache(old, data.messageId, (msg: Message) => ({
            ...msg,
            isPinned: false,
          })),
      );
    };

    socketInstance.on('chat:receive_message', handleReceiveMessage);
    socketInstance.on('chat:read_receipt', handleReadReceipt);
    socketInstance.on('chat:message_edited', handleMessageEdited);
    socketInstance.on('chat:message_unsent', handleMessageUnsent);
    socketInstance.on('chat:reaction_updated', handleReactionUpdated);
    socketInstance.on('chat:message_pinned', handleMessagePinned);
    socketInstance.on('chat:message_unpinned', handleMessageUnpinned);

    return () => {
      socketInstance.off('chat:receive_message', handleReceiveMessage);
      socketInstance.off('chat:read_receipt', handleReadReceipt);
      socketInstance.off('chat:message_edited', handleMessageEdited);
      socketInstance.off('chat:message_unsent', handleMessageUnsent);
      socketInstance.off('chat:reaction_updated', handleReactionUpdated);
      socketInstance.off('chat:message_pinned', handleMessagePinned);
      socketInstance.off('chat:message_unpinned', handleMessageUnpinned);
    };
  }, [queryClient]);
};
