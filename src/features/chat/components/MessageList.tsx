import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageBubble } from '@/features/chat/components/MessageBubble';
import { TypingIndicator } from '@/features/chat/components/TypingIndicator';
import { Message } from '@/shared/types/models';
import { useAuthStore } from '@/stores/auth.store';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { useToast } from '@/contexts/ToastContext';
import { formatMessageTime } from '@/shared/utils/formatDate';

import { ReadReceipt } from '@/features/chat/hooks/useReadReceipts';
import { TypingUser } from '@/features/chat/hooks/useTypingIndicator';

const VIRTUOSO_INITIAL_INDEX = 1_000_000;


interface SenderInfo {
  name: string;
  avatarUrl?: string;
}

interface MessageListProps {
  messages: Message[];
  senderMap: Map<string, SenderInfo>;
  conversationId: string;
  isLoading: boolean;
  isError: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  typingUsers: TypingUser[];
  setReplyTo: (msg: Message) => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  readReceipts: ReadReceipt[];
  targetMessageId?: string | null;
}

export function MessageList({
  messages,
  senderMap,
  conversationId,
  isLoading,
  isError,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
  typingUsers,
  setReplyTo,
  scrollRef, // Keep this prop for compatibility, though Virtuoso uses its own ref
  readReceipts,
  targetMessageId,
}: MessageListProps) {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const { toast } = useToast();
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const [fetchingForMessageId, setFetchingForMessageId] = useState<string | null>(null);

  // Sync external scrollRef (used by useChatScroll) to Virtuoso if needed
  // Alternatively, we let Virtuoso handle auto-scrolling via followOutput
  
  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  useEffect(() => {
    if (targetMessageId) {
      const index = messages.findIndex(m => m.id === targetMessageId);
      if (index !== -1) {
        setFetchingForMessageId(null);
        // Since we use firstItemIndex, we must provide the absolute index to scrollToIndex
        const absoluteIndex = (VIRTUOSO_INITIAL_INDEX - messages.length) + index;
        
        if (virtuosoRef.current) {
          virtuosoRef.current.scrollToIndex({ index: absoluteIndex, align: 'center', behavior: 'smooth' });
        }
        
        // Highlight logic requires DOM element which might render after scroll, so we use a small delay
        setTimeout(() => {
          const el = document.getElementById(`message-${targetMessageId}`);
          if (el) {
            el.classList.add('bg-primary/20', 'transition-colors', 'duration-500', 'rounded-2xl');
            setTimeout(() => el.classList.remove('bg-primary/20', 'rounded-2xl'), 2000);
          }
        }, 500);
      } else {
        // Message not found in the current loaded data, start fetching
        if (fetchingForMessageId !== targetMessageId) {
          toast({
            message: t('chat.fetchingOldMessage', 'Đang tải tin nhắn cũ...'),
            type: 'info'
          });
          setFetchingForMessageId(targetMessageId);
        }
      }
    } else {
      setFetchingForMessageId(null);
    }
  }, [targetMessageId, messages, t, toast, fetchingForMessageId]);

  useEffect(() => {
    if (fetchingForMessageId && hasNextPage && !isFetchingNextPage) {
      const timer = setTimeout(() => {
        fetchNextPage();
      }, 50);
      return () => clearTimeout(timer);
    } else if (fetchingForMessageId && !hasNextPage && !isFetchingNextPage) {
      setFetchingForMessageId(null);
      toast({
        message: t('chat.messageNotFound', 'Không tìm thấy tin nhắn này.'),
        type: 'error'
      });
    }
  }, [fetchingForMessageId, hasNextPage, isFetchingNextPage, fetchNextPage, t, toast]);

  return (
    <div className="flex-1 flex flex-col min-h-0 relative bg-background">
      {isLoading && (
        <div className="flex justify-center py-4 absolute top-0 left-0 right-0 z-10">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      {isError && <div className="text-center text-error py-4 absolute top-0 w-full z-10">{t('common.errorLoadingMessages')}</div>}
      
      <Virtuoso
        ref={virtuosoRef}
        data={messages}
        firstItemIndex={VIRTUOSO_INITIAL_INDEX - messages.length} // Trick to keep scroll position when prepending items
        initialTopMostItemIndex={messages.length - 1}
        startReached={loadMore}
        className="flex-1 w-full"
        style={{ height: '100%', overflowX: 'hidden' }}
        followOutput={(isAtBottom) => {
          if (messages.length > 0) {
            const lastMsg = messages[messages.length - 1];
            // Luôn tự động cuộn xuống dưới cùng nếu tin nhắn cuối cùng là do bản thân gửi
            if (lastMsg.senderId === user?.id) {
              return 'smooth';
            }
          }
          return isAtBottom ? 'auto' : false;
        }}
        alignToBottom={true}
        components={{
          Header: () => (
            <div className="py-4 px-6 flex justify-center">
              {isFetchingNextPage && (
                <div className="w-5 h-5 border-2 border-primary/60 border-t-transparent rounded-full animate-spin"></div>
              )}
            </div>
          ),
          Footer: () => (
            <div className="py-2 px-6">
              {/* Typing Indicator */}
              {typingUsers.length > 0 && <TypingIndicator users={typingUsers} />}
            </div>
          )
        }}
        itemContent={(index, msg) => {
          const senderId = msg.senderId;
          const sender = senderId ? senderMap.get(senderId) : undefined;
          
          // Original index in the messages array (adjusting for firstItemIndex offset)
          const actualIndex = messages.indexOf(msg);
          
          const nextMsg = messages[actualIndex + 1];
          const nextSenderId = nextMsg ? nextMsg.senderId : null;
          
          let nextMsgHasTimeSeparator = false;
          if (nextMsg) {
            const nextTime = new Date(nextMsg.createdAt || nextMsg.updatedAt || new Date()).getTime();
            const currTime = new Date(msg.createdAt || msg.updatedAt || new Date()).getTime();
            if (nextTime - currTime > 60 * 60 * 1000) {
              nextMsgHasTimeSeparator = true;
            }
          }
          
          const hideAvatar = nextSenderId === senderId && !nextMsgHasTimeSeparator;

          const prevMsg = messages[actualIndex - 1];
          const prevSenderId = prevMsg ? prevMsg.senderId : null;
          
          // Calculate if we need to show a time separator
          const msgTime = new Date(msg.createdAt || msg.updatedAt || new Date()).getTime();
          let showTimeSeparator = false;
          if (!prevMsg) {
            showTimeSeparator = true;
          } else {
            const prevTime = new Date(prevMsg.createdAt || prevMsg.updatedAt || new Date()).getTime();
            // Show separator if > 1 hour gap
            if (msgTime - prevTime > 60 * 60 * 1000) {
              showTimeSeparator = true;
            }
          }
          
          const hideName = prevSenderId === senderId && !showTimeSeparator;

          const msgReceipts = readReceipts.filter(r => r.lastReadMessageId === msg.id && r.accountId !== msg.senderId);

          return (
            <div className="flex flex-col px-6">
              {showTimeSeparator && (
                <div className="flex justify-center my-5">
                  <span className="text-xs font-semibold text-on-surface-variant/80">
                    {formatMessageTime(msg.createdAt || msg.updatedAt || new Date(), t)}
                  </span>
                </div>
              )}
              <div className="py-0.5 flex flex-col w-full">
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  sender={sender}
                  conversationId={conversationId}
                  onReply={setReplyTo}
                  hideAvatar={hideAvatar}
                  hideName={hideName}
                  readReceipts={msgReceipts}
                />
              </div>
            </div>
          );
        }}
      />
    </div>
  );
};
