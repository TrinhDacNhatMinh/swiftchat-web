import { useState, useMemo } from 'react';
import { useMessages } from '@/features/chat/hooks/useMessages';
import { useMessageStream } from '@/features/chat/hooks/useMessageStream';
import { useTranslation } from 'react-i18next';
import { MessageInput } from '@/features/chat/components/MessageInput';
import { MessageList } from '@/features/chat/components/MessageList';
import { ChatHeader } from '@/features/chat/components/ChatHeader';
import { ConversationInfoPanel } from '@/features/chat/components/ConversationInfoPanel';
import { MessageSearch } from '@/features/chat/components/MessageSearch';
import { useTypingIndicator } from '@/features/chat/hooks/useTypingIndicator';
import { useChatScroll } from '@/features/chat/hooks/useChatScroll';
import { useReadReceipt } from '@/features/chat/hooks/useReadReceipt';
import { useReadReceipts } from '@/features/chat/hooks/useReadReceipts';
import { useConversations } from '@/features/chat/hooks/useConversations';
import { useAuthStore } from '@/stores/auth.store';
import { getConversationDetails } from '@/shared/utils/conversationUtils';
import { usePresenceStore } from '@/stores/presence.store';
import { useToast } from '@/contexts/ToastContext';
import { useBlockStatus, useUnblockUser } from '@/features/settings/hooks/useBlock';
import { conversationApi } from '@/shared/services/conversationApi';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDialog } from '@/contexts/DialogContext';
import { Message } from '@/shared/types/models';

interface MessageThreadProps {
  conversationId: string | null;
}

export function MessageThread({ conversationId }: MessageThreadProps) {
  const { toast } = useToast();
  // Lắng nghe socket
  useMessageStream(conversationId);
  
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } = useMessages(conversationId);
  const { data: readReceiptsData } = useReadReceipts(conversationId);
  const typingUsers = useTypingIndicator(conversationId || '');
  const { data: convData } = useConversations();
  const { user } = useAuthStore();
  const { t } = useTranslation();
  
  const activeConversation = convData?.data?.find(c => c.id === conversationId);
  const { title: chatTitle, avatarUrl } = getConversationDetails(activeConversation, user?.id);
  
  // Build map userId → { name, avatarUrl } từ participantPreview
  const senderMap = useMemo(() => {
    const map = new Map<string, { name: string; avatarUrl?: string }>();
    activeConversation?.participantPreview?.forEach(p => {
      map.set(p.accountId, {
        name: p.displayName || p.handle,
        avatarUrl: p.avatarUrl || undefined,
      });
    });
    return map;
  }, [activeConversation?.participantPreview]);
  
  // Tính toán online status cho direct chat
  const otherParticipantPreview = activeConversation?.type === 'direct'
    ? activeConversation?.participantPreview?.find(p => p.accountId !== user?.id)
    : null;
  const isOnline = usePresenceStore((s) => s.onlineUsers.has(otherParticipantPreview?.accountId ?? ''));
  const onlineLabel = activeConversation?.type === 'group'
    ? t('chat.memberCountText', '{{count}} thành viên', { count: activeConversation.totalParticipants || activeConversation.participantPreview?.length || 0 })
    : isOnline ? t('status.online') : t('status.offline');

  const { data: blockStatus } = useBlockStatus(otherParticipantPreview?.accountId || null);
  const { mutate: unblockUser, isPending: isUnblocking } = useUnblockUser();
  const queryClient = useQueryClient();
  const { confirm } = useDialog();
  const { mutate: deleteConv, isPending: isDeleting } = useMutation({
    mutationFn: () => {
      if (!conversationId) throw new Error('No conversation selected');
      return conversationApi.deleteConversation(conversationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
  
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [jumpToMessageId] = useState<string | null>(null);

  const reversedMessages = useMemo(() => {
    const allMessages = data?.pages.flatMap((p: any) => Array.isArray(p) ? p : p.data || p.items || []) || [];
    return [...allMessages].reverse();
  }, [data?.pages]);

  const scrollRef = useChatScroll([
    Array.isArray(data?.pages?.[0]) ? (data?.pages?.[0] as any[]).length : ((data?.pages?.[0] as any)?.data?.length || (data?.pages?.[0] as any)?.items?.length), 
    conversationId, 
    typingUsers.length
  ]);

  useReadReceipt(conversationId, reversedMessages);

  if (!conversationId) {
    return (
      <main aria-label="Main Chat Area" className="flex-1 h-screen ml-[432px] bg-background flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        <div className="flex flex-col items-center justify-center text-center max-w-md px-6 z-10 animate-fade-in-up">
          <div className="w-24 h-24 mb-8 rounded-2xl bg-surface-container-high/50 flex items-center justify-center border border-outline-variant/30 backdrop-blur-sm shadow-[0_0_40px_rgba(0,0,0,0.5)]">
            <span className="material-symbols-outlined fill-icon text-6xl text-on-surface-variant/40">bolt</span>
          </div>
          <h2 className="font-display-lg text-[32px] font-bold text-on-surface mb-3 tracking-tight">{t('chat.emptyStateTitle', 'Your Messages')}</h2>
          <p className="font-body-md text-on-surface-variant leading-relaxed max-w-[280px]">
            {t('chat.emptyStateDesc', 'Select a conversation from the sidebar to start chatting.')}
          </p>
        </div>
      </main>
    );
  }



  return (
    <main className="ml-[432px] w-[calc(100%-432px)] h-screen flex flex-col relative bg-surface-container-lowest">
      {/* TopNavBar */}
      {/* TopNavBar */}
      <ChatHeader
        chatTitle={chatTitle}
        avatarUrl={avatarUrl}
        isGroup={activeConversation?.type === 'group'}
        isOnline={isOnline}
        onlineLabel={onlineLabel}
        isInfoOpen={isInfoOpen}
        onToggleInfo={() => {
          setIsInfoOpen(!isInfoOpen);
          setIsSearchOpen(false);
        }}
      />

      {/* Dynamic Content Splitter */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Canvas */}
        <section className="flex-1 flex flex-col relative min-w-0 bg-background">
          
          {/* Scrollable Messages Area */}
          <MessageList
            messages={reversedMessages as any[]} // type cast to any[] temporarily since type is missing in MessageThread
            senderMap={senderMap}
            conversationId={conversationId}
            isLoading={isLoading}
            isError={isError}
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={!!hasNextPage}
            fetchNextPage={fetchNextPage}
            typingUsers={typingUsers}
            setReplyTo={setReplyTo}
            scrollRef={scrollRef}
            readReceipts={readReceiptsData || []}
            targetMessageId={jumpToMessageId}
          />
          
          {/* Sticky Input Area */}
          {blockStatus?.isBlocker ? (
            <div className="border-t border-outline-variant/30 bg-surface/90 backdrop-blur-xl p-4 w-full flex justify-center gap-4">
              <button
                onClick={async () => {
                  if (await confirm({ title: t('common.confirmTitle', 'Xác nhận'), message: t('chat.unblockConfirm', 'Bạn có chắc chắn muốn bỏ chặn người dùng này?'), type: 'warning' })) {
                    unblockUser(otherParticipantPreview!.accountId);
                  }
                }}
                disabled={isUnblocking}
                className="px-6 py-2.5 rounded-full bg-surface-container-high hover:bg-surface-variant text-on-surface font-semibold text-[14px] transition-colors"
              >
                {t('chat.unblockUser', 'Bỏ chặn')}
              </button>
              <button
                onClick={async () => {
                  if (await confirm({ title: t('common.confirmTitle', 'Xác nhận'), message: t('chat.deleteConversationConfirm', 'Bạn có chắc chắn muốn xóa đoạn chat này?'), type: 'danger' })) {
                    deleteConv();
                  }
                }}
                disabled={isDeleting}
                className="px-6 py-2.5 rounded-full bg-error/10 hover:bg-error/20 text-error font-semibold text-[14px] transition-colors"
              >
                {t('chat.deleteConversation', 'Xóa đoạn chat')}
              </button>
            </div>
          ) : blockStatus?.isBlocked ? (
            <div className="border-t border-outline-variant/30 bg-surface/90 backdrop-blur-xl p-5 w-full flex justify-center text-center">
              <span className="text-on-surface-variant font-medium">
                {t('chat.userUnavailable', 'Người dùng không thể liên hệ')}
              </span>
            </div>
          ) : (
            <MessageInput conversationId={conversationId} replyTo={replyTo} onCancelReply={() => setReplyTo(null)} />
          )}
        </section>

        {/* Info Panel Sidebar */}
        {isInfoOpen && activeConversation && (
          <ConversationInfoPanel
            conversation={activeConversation}
            onClose={() => setIsInfoOpen(false)}
            onLeave={() => {
              setIsInfoOpen(false);
            }}
            onOpenSearch={() => {
              setIsInfoOpen(false);
              setIsSearchOpen(true);
            }}
          />
        )}

        {/* Search Panel Sidebar */}
        {isSearchOpen && (
          <MessageSearch
            conversationId={conversationId}
            senderMap={senderMap}
            onClose={() => setIsSearchOpen(false)}
            onSelectMessage={(msgId) => {
              toast({
                message: t('common.featureInDevelopment', { feature: 'Jump to message' }),
                type: 'development'
              });
            }}
          />
        )}
      </div>
    </main>
  );
};
