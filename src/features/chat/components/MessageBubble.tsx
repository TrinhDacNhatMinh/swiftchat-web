import { type FC, useState, useRef, useEffect, useCallback, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Message } from '@/shared/types/models';
import { useAuthStore } from '@/stores/auth.store';
import { MessageActions } from '@/features/chat/components/MessageActions';
import { ReadReceipt } from '@/features/chat/hooks/useReadReceipts';

interface SenderInfo {
  name: string;
  avatarUrl?: string;
}

interface MessageBubbleProps {
  message: Message;
  sender?: SenderInfo;
  conversationId: string;
  onReply: (message: Message) => void;
  hideAvatar?: boolean;
  hideName?: boolean;
  readReceipts?: ReadReceipt[];
}

const isImageUrl = (url: string) => {
  return /\.(jpeg|jpg|gif|png|webp|svg)$/i.test(url);
};

export const MessageBubble: FC<MessageBubbleProps> = memo(({ message, sender, conversationId, onReply, hideAvatar, hideName, readReceipts }) => {
  const user = useAuthStore((s) => s.user);
  const { t } = useTranslation();

  const effectiveSenderId = message.senderId;
  const effectiveCreatedAt = message.createdAt || new Date().toISOString();
  const isMine = effectiveSenderId === user?.id;

  const timeString = new Date(effectiveCreatedAt).toLocaleTimeString(t('common.locale', 'vi-VN'), { hour: '2-digit', minute: '2-digit', hour12: false });

  // Toggle details (time and name) on click
  const [showDetails, setShowDetails] = useState(false);

  // Kiểm tra tin nhắn đang gửi (optimistic): dùng isPending field thay vì hack id.length
  const isSending = message.isPending === true;

  // Long-press support cho mobile (touch device không có hover)
  const [showActions, setShowActions] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePointerDown = useCallback(() => {
    longPressTimer.current = setTimeout(() => {
      setShowActions(true);
    }, 500);
  }, []);

  const handlePointerUp = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  // Dismiss actions khi click ra ngoài (setTimeout tránh race condition với event hiện tại)
  useEffect(() => {
    if (!showActions) return;
    const handler = () => setShowActions(false);
    const timerId = setTimeout(() => {
      document.addEventListener('pointerdown', handler);
    }, 0);
    return () => {
      clearTimeout(timerId);
      document.removeEventListener('pointerdown', handler);
    };
  }, [showActions]);

  // Cleanup timer khi unmount
  useEffect(() => {
    return () => {
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
    };
  }, []);

  // Tin nhắn đã bị thu hồi
  if (message.isUnsent) {
    return (
      <div id={`message-${message.id}`} className={`flex items-end gap-2 max-w-[85%] ${isMine ? 'self-end flex-row-reverse' : 'self-start'}`}>
        {!isMine && (
          <div className="w-8 h-8 rounded-full mb-1 shrink-0 overflow-hidden">
            {!hideAvatar && (
              <div className="w-full h-full bg-surface-container-high flex items-center justify-center overflow-hidden rounded-full">
                {sender?.avatarUrl ? (
                  <img src={sender.avatarUrl} alt={sender.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-bold text-xs text-on-surface-variant">
                    {(sender?.name ?? 'U').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            )}
          </div>
        )}
        <div
          role="button"
          tabIndex={0}
          className={`flex flex-col gap-1 min-w-0 max-w-full ${isMine ? 'items-end' : 'items-start'} cursor-pointer outline-none`}
          onClick={() => setShowDetails(!showDetails)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowDetails(!showDetails); } }}
        >
          {!isMine && (!hideName || showDetails) && <span className="text-[11px] ml-1 text-on-surface-variant/70 font-medium">{sender?.name}</span>}
          <div className={`px-4 py-2.5 rounded-2xl text-[14px] italic text-on-surface-variant/60 border border-outline-variant/30 bg-surface-container/30 ${isMine ? 'rounded-br-lg' : 'rounded-bl-lg'}`}>
            <span className="material-symbols-outlined text-[14px] mr-1 align-middle">block</span>
            {t('chat.messageUnsent', 'Tin nhắn đã được thu hồi')}
          </div>
          {(!hideAvatar || showDetails) && (
            <span className="text-[10px] opacity-40 px-1">{timeString}</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      id={`message-${message.id}`}
      className={`group flex items-end gap-2 max-w-[75%] ${isMine ? 'self-end flex-row-reverse' : 'self-start'} cursor-pointer`}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onClick={() => setShowDetails(!showDetails)}
    >

      {/* Bubble Content */}
      <div className={`flex flex-col gap-1 min-w-0 flex-1 ${isMine ? 'items-end' : 'items-start'}`}>

        {/* Pinned Indicator */}
        {message.isPinned && (
          <div className={`flex items-center gap-1 text-on-surface-variant/70 text-[11px] font-medium mb-0.5 ${isMine ? 'pr-2' : 'pl-2'}`}>
            <span className="material-symbols-outlined text-[12px] text-amber-500">push_pin</span>
            <span>{t('chat.pinnedMessage', 'Đã ghim')}</span>
          </div>
        )}

        {/* Reply Preview */}
        {message.replyTo && (
          <div className={`px-3 py-1.5 text-[13px] border-l-2 mb-1 opacity-60 max-w-full truncate rounded-r-lg ${isMine ? 'border-on-surface-variant text-on-surface/70' : 'border-outline-variant text-on-surface-variant'}`}>
            <span className="font-semibold block text-[11px] mb-0.5">{t('chat.reply', 'Trả lời')}</span>
            {message.replyTo.content === '' || (message.replyTo as any).isUnsent ? (
              <span className="italic flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">block</span>
                {t('chat.messageUnsent', 'Tin nhắn đã được thu hồi')}
              </span>
            ) : (
              message.replyTo.content
            )}
          </div>
        )}

        {/* Content & Actions Container */}
        <div className={`flex items-end gap-1.5 min-w-0 ${isMine ? 'flex-row-reverse justify-start' : ''} ${message.reactions?.length ? 'mb-3' : ''}`}>
          
          {/* Avatar người gửi (chỉ hiện nếu không phải của mình) */}
          {!isMine && (
            <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center overflow-hidden">
              {!hideAvatar && (
                <div className="w-full h-full bg-surface-container-high border border-outline-variant flex items-center justify-center overflow-hidden rounded-full">
                  {sender?.avatarUrl ? (
                    <img src={sender.avatarUrl} alt={sender.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-bold text-xs text-on-surface-variant">
                      {(sender?.name ?? 'U').charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* Bubble Column */}
          <div className={`flex flex-col gap-1 relative min-w-0 ${isMine ? 'items-end' : 'items-start'}`}>
            
            {/* Text Box — Threads: both sides gray */}
            {message.content && (
              <div
                className={`px-4 py-3 rounded-2xl text-[15px] leading-relaxed relative break-words [word-break:break-word] whitespace-pre-wrap ${
                  isMine
                    ? 'bg-surface-container-highest text-on-surface'
                    : 'bg-surface-container-high text-on-surface'
                } ${isSending ? 'opacity-50' : ''}`}
              >
                {message.content}
                {isSending && (
                  <span className="absolute bottom-1 right-2 text-[10px] opacity-50">{t('chat.sending', 'Đang gửi...')}</span>
                )}
              </div>
            )}

            {/* Attachments */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="flex flex-col gap-2">
                {message.attachments.map((url) => {
                  const isImage = isImageUrl(url);
                  return (
                    <div key={url} className={`rounded-2xl overflow-hidden max-w-sm ${isMine ? 'bg-inverse-primary rounded-tr-sm text-on-primary' : 'bg-surface-container rounded-tl-sm text-on-surface'} ${isImage ? 'p-1' : 'p-3'}`}>
                      {isImage ? (
                        <img alt="attachment" className="w-full max-h-[300px] object-contain rounded-xl" src={url} />
                      ) : (
                        <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 w-full hover:opacity-80 transition-opacity">
                          <div className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[20px]">insert_drive_file</span>
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-[14px] font-medium truncate">
                              {url.split('/').pop() || 'Tệp đính kèm'}
                            </span>
                            <span className="text-[11px] opacity-70 uppercase">
                              {url.split('.').pop() || 'FILE'}
                            </span>
                          </div>
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Reactions */}
            {message.reactions && message.reactions.length > 0 && (() => {
              // Note: Backend limits 1 reaction per user is planned. For now, frontend just groups them.
              const uniqueEmojis = Array.from(new Set(message.reactions.map((r: any) => r.emoji)));
              const displayEmojis = uniqueEmojis.slice(0, 2);
              const totalCount = message.reactions.length;
              
              return (
                <div 
                  className="flex items-center absolute -bottom-3 right-2 z-10 bg-surface-container-high border border-outline-variant shadow-sm rounded-full px-1.5 py-0.5 cursor-pointer hover:bg-surface-container-highest transition-colors"
                  title={t('chat.viewReactions', 'Xem danh sách người thả cảm xúc')}
                >
                  <div className="flex -space-x-1 items-center">
                    {displayEmojis.map((emoji: string, idx: number) => (
                      <div 
                        key={idx} 
                        className="text-[12px] w-4 h-4 leading-none rounded-full bg-surface-container-high ring-1 ring-surface-container flex items-center justify-center relative"
                        style={{ zIndex: 10 - idx }}
                      >
                        {emoji}
                      </div>
                    ))}
                  </div>
                  {totalCount > 1 && <span className="text-[10px] font-medium text-on-surface-variant ml-1 mr-0.5">{totalCount}</span>}
                </div>
              );
            })()}
          </div>

          {/* Actions: hiển thị khi hover (desktop) hoặc long-press (mobile) */}
          {!isSending && (
            <MessageActions
              message={message}
              conversationId={conversationId}
              isMine={isMine}
              onReply={() => onReply(message)}
              forceVisible={showActions}
              onDismiss={() => setShowActions(false)}
            />
          )}
        </div>

        {/* Read Receipts */}
        {isMine && readReceipts && readReceipts.length > 0 && (
          <div className="flex items-center gap-1 mt-0.5 justify-end">
            <div className="flex -space-x-1.5">
              {readReceipts.map(receipt => (
                <div key={receipt.accountId} className="w-3.5 h-3.5 rounded-full border border-background bg-surface-container-high overflow-hidden z-10" title={receipt.account?.profile?.displayName || 'Đã xem'}>
                  {receipt.account?.profile?.avatarUrl ? (
                    <img src={receipt.account.profile.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[7px] font-bold">
                      {(receipt.account?.profile?.displayName || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <span className="text-[10px] text-on-surface-variant opacity-60 ml-0.5">{t('status.seen', 'Đã xem')}</span>
          </div>
        )}

        {/* Time and Status (Hiển thị ngay dưới bong bóng tin nhắn) */}
        {(showDetails || message.isEdited) && (
          <div className={`flex items-center gap-2 mt-0.5 px-1 ${isMine ? 'justify-end' : 'justify-start ml-[38px]'}`}>
            {showDetails && (
              <span className="text-[10px] opacity-50">{timeString}</span>
            )}
            {message.isEdited && <span className="text-[10px] opacity-40 italic">· đã sửa</span>}
          </div>
        )}

      </div>
    </div>
  );
});
