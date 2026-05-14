import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { socketInstance } from '@/shared/lib/socket';
import { queryKeys } from '@/features/chat/hooks/useConversations';
import {
  updateMessageInCache,
  updateMultipleMessagesInCache,
  filterMessagesFromCache,
} from '@/shared/utils/queryCacheUtils';
import { useAuthStore } from '@/stores/auth.store';
import { Message } from '@/shared/types/models';
import { InfiniteData } from '@/shared/types/api';

interface MessageActionParams {
  conversationId: string;
  messageId: string;
}

export const useMessageActions = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  // ─── React / Emoji ────────────────────────────────────────────────────────
  const reactMessage = useCallback((params: MessageActionParams & { emoji: string }) => {
    socketInstance.emit('chat:react_message', params);

    // Optimistic update — toggle reaction cho current user
    const currentUserId = user?.id;
    if (!currentUserId) return;

    queryClient.setQueryData<InfiniteData<Message>>(queryKeys.messages(params.conversationId), (old) =>
      updateMessageInCache(old, params.messageId, (msg: any) => {
        const prevReactions: any[] = msg.reactions || [];
        const alreadyReacted = prevReactions.some(
          (r) => r.accountId === currentUserId && r.emoji === params.emoji,
        );

        if (alreadyReacted) {
          // Xóa reaction nếu user click lại cùng emoji (toggle off)
          const newReactions = prevReactions.filter(r => !(r.accountId === currentUserId && r.emoji === params.emoji));
          return { ...msg, reactions: newReactions };
        }

        // Nếu user click emoji khác, xóa cái cũ của user đó đi và thêm cái mới vào (replace)
        const filteredReactions = prevReactions.filter(r => r.accountId !== currentUserId);
        const newReactions = [...filteredReactions, { accountId: currentUserId, emoji: params.emoji, account: { profile: { displayName: user?.displayName || user?.handle } } }];
        return { ...msg, reactions: newReactions };
      }),
    );
  }, [queryClient, user?.id]);

  // ─── Edit ─────────────────────────────────────────────────────────────────
  const editMessage = useCallback((params: MessageActionParams & { content: string }) => {
    socketInstance.emit('chat:edit_message', params);

    // Optimistic update — dùng utility để tránh inline page manipulation
    queryClient.setQueryData<InfiniteData<Message>>(
      queryKeys.messages(params.conversationId),
      (old) => updateMessageInCache(old, params.messageId, (msg) => ({
        ...msg,
        content: params.content,
        isEdited: true,
      })),
    );
  }, [queryClient]);

  // ─── Unsend (thu hồi với mọi người) ──────────────────────────────────────
  const unsendMessage = useCallback((params: MessageActionParams) => {
    socketInstance.emit('chat:unsend_message', params);

    // Optimistic update — áp dụng cho cả message bị thu hồi lẫn các reply tới nó
    queryClient.setQueryData<InfiniteData<Message>>(
      queryKeys.messages(params.conversationId),
      (old) => updateMultipleMessagesInCache(
        old,
        (msg) => msg.id === params.messageId || msg.replyTo?.messageId === params.messageId,
        (msg) => {
          let updated: Message = { ...msg };
          if (msg.id === params.messageId) {
            updated = { ...updated, isUnsent: true, content: '' };
          }
          if (msg.replyTo?.messageId === params.messageId) {
            updated = { ...updated, replyTo: msg.replyTo ? { ...msg.replyTo, content: '' } : undefined };
          }
          return updated;
        },
      ),
    );
  }, [queryClient]);

  // ─── Delete for me (xóa phía mình) ───────────────────────────────────────
  const deleteForMe = useCallback((params: MessageActionParams) => {
    socketInstance.emit('chat:delete_for_me', params);

    // Optimistic: filter out the deleted message from cache
    queryClient.setQueryData<InfiniteData<Message>>(
      queryKeys.messages(params.conversationId),
      (old) => filterMessagesFromCache(old, (msg) => msg.id === params.messageId),
    );
  }, [queryClient]);

  // ─── Pin / Unpin ──────────────────────────────────────────────────────────
  const pinMessage = useCallback((params: MessageActionParams) => {
    socketInstance.emit('chat:pin_message', params);

    // Optimistic update
    queryClient.setQueryData<InfiniteData<Message>>(
      queryKeys.messages(params.conversationId),
      (old) => updateMessageInCache(old, params.messageId, (msg) => ({ ...msg, isPinned: true })),
    );
  }, [queryClient]);

  const unpinMessage = useCallback((params: MessageActionParams) => {
    socketInstance.emit('chat:unpin_message', params);

    // Optimistic update
    queryClient.setQueryData<InfiniteData<Message>>(
      queryKeys.messages(params.conversationId),
      (old) => updateMessageInCache(old, params.messageId, (msg) => ({ ...msg, isPinned: false })),
    );
  }, [queryClient]);

  return { reactMessage, editMessage, unsendMessage, deleteForMe, pinMessage, unpinMessage };
};
