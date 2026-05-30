import { Conversation } from '@/shared/types/models';
import { useAuthStore } from '@/stores/auth.store';
import { getConversationDetails } from '@/shared/utils/conversationUtils';
import { formatConversationTime } from '@/shared/utils/formatDate';
import { usePresenceStore } from '@/stores/presence.store';
import { useTranslation } from 'react-i18next';

interface ConversationItemProps {
  conversation: Conversation;
  isActive?: boolean;
  onClick: () => void;
  onContextMenu?: (e: React.MouseEvent, conversation: Conversation) => void;
}

export function ConversationItem({ conversation, isActive, onClick, onContextMenu }: ConversationItemProps) {
  const { user } = useAuthStore();
  const { t, i18n } = useTranslation();
  
  // Xử lý tên nhóm / tên người dùng
  const { title: displayName, avatarUrl } = getConversationDetails(conversation, user?.id);

  const otherParticipantPreview = conversation.type === 'direct'
    ? conversation.participantPreview?.find(p => p.accountId !== user?.id)
    : null;
  const isOnline = usePresenceStore((s) => s.onlineUsers.has(otherParticipantPreview?.accountId ?? ''));
  
  const isUnread = 
    conversation.lastMessage && 
    conversation.lastMessage.senderId !== user?.id && 
    conversation.currentParticipant?.lastReadMessageId !== conversation.lastMessage.id;
  
  // Avatar xử lý fallback
  const renderAvatar = () => {
    if (avatarUrl) {
      return <img alt={displayName} className="w-full h-full object-cover" src={avatarUrl} />;
    }
    if (conversation.type === 'group') {
      return <span className="material-symbols-outlined">group</span>;
    }
    return <span className="font-bold text-lg">{displayName.charAt(0).toUpperCase()}</span>;
  };

  return (
    <button 
      onClick={onClick}
      onContextMenu={onContextMenu ? (e) => { e.preventDefault(); onContextMenu(e, conversation); } : undefined}
      className={`w-full flex items-center px-4 py-3.5 gap-3 transition-colors text-left relative group ${
        isActive ? 'bg-surface-container' : 'hover:bg-surface-container/50'
      }`}
    >
      <div className="relative shrink-0 w-12 h-12">
        <div className="w-full h-full rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant overflow-hidden">
          {renderAvatar()}
        </div>
        {/* Online indicator */}
        {conversation.type === 'direct' && isOnline && (
          <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-secondary border-2 border-surface"></div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between mb-0.5">
          <span className="text-[15px] font-semibold text-on-surface truncate pr-2 flex items-center gap-1.5">
            {displayName}
            {conversation.currentParticipant?.isMuted && (
              <span className="material-symbols-outlined text-[13px] text-on-surface-variant/50">notifications_off</span>
            )}
          </span>
          <span className={`text-[12px] shrink-0 ${isUnread ? 'text-primary font-bold' : 'text-on-surface-variant/60 font-normal'}`}>
            {conversation.lastMessage ? formatConversationTime(conversation.lastMessage.createdAt || conversation.updatedAt || new Date(), i18n.language) : ''}
          </span>
        </div>
        <p className={`text-[14px] truncate leading-snug ${isUnread ? 'text-on-surface font-bold' : 'text-on-surface-variant/70 font-normal'}`}>
          {conversation.lastMessage ? (
            conversation.lastMessage.isUnsent ? t('chat.messageUnsentItem', '✕ Đã thu hồi') :
            conversation.lastMessage.attachments?.length ? t('chat.attachmentItem', '📎 Đính kèm') :
            conversation.lastMessage.content
          ) : (
            t('chat.noMessagesYet', 'Chưa có tin nhắn')
          )}
        </p>
      </div>
      
      {/* 3-dots on hover */}
      {onContextMenu && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onContextMenu(e, conversation); }}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-surface border border-outline/50 shadow-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high hover:border-outline transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">more_horiz</span>
          </button>
        </div>
      )}
    </button>
  );
};
