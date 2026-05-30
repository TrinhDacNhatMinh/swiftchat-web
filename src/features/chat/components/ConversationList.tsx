import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useConversations, queryKeys } from '@/features/chat/hooks/useConversations';
import { ConversationItem } from '@/features/chat/components/ConversationItem';
import { useToast } from '@/contexts/ToastContext';
import { ContextMenu, ContextMenuItem } from '@/shared/components/common/ContextMenu';
import { conversationApi } from '@/shared/services/conversationApi';
import { Conversation } from '@/shared/types/models';

import { useDialog } from '@/contexts/DialogContext';

interface ConversationListProps {
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
}

export function ConversationList({ activeConversationId, onSelectConversation }: ConversationListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const queryClient = useQueryClient();
  const { confirm } = useDialog();

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; conversation: Conversation | null }>({ x: 0, y: 0, conversation: null });

  const { mutate: muteConv } = useMutation({
    mutationFn: (id: string) => conversationApi.muteConversation(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.conversations() })
  });

  const { mutate: unmuteConv } = useMutation({
    mutationFn: (id: string) => conversationApi.unmuteConversation(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.conversations() })
  });

  const { mutate: leaveGroup } = useMutation({
    mutationFn: (id: string) => conversationApi.removeMember(id, 'me'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.conversations() })
  });

  const { mutate: deleteConv } = useMutation({
    mutationFn: (id: string) => conversationApi.deleteConversation(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.conversations() })
  });

  const handleDeleteDirect = async (id: string) => {
    if (await confirm({ title: t('common.confirmTitle', 'Xác nhận'), message: t('chat.deleteConversationConfirm', 'Bạn có chắc chắn muốn xóa đoạn chat này?'), type: 'danger' })) {
      deleteConv(id);
    }
  };

  const handleDisbandGroup = async (id: string) => {
    if (await confirm({ title: t('common.confirmTitle', 'Xác nhận'), message: t('chat.disbandGroupConfirm', 'Bạn có chắc chắn muốn giải tán nhóm này? Tất cả thành viên sẽ bị xóa và toàn bộ tin nhắn sẽ bị xóa vĩnh viễn.'), type: 'danger' })) {
      deleteConv(id);
    }
  };

  const handleLeaveGroup = async (id: string) => {
    if (await confirm({ title: t('common.confirmTitle', 'Xác nhận'), message: t('chat.leaveGroupConfirm', 'Bạn có chắc chắn muốn rời khỏi nhóm này?'), type: 'warning' })) {
      leaveGroup(id);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, isLoading, isError, refetch } = useConversations(20, debouncedSearch);
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleContextMenu = (e: React.MouseEvent, conversation: Conversation) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, conversation });
  };

  const getContextMenuItems = (conv: Conversation): ContextMenuItem[] => {
    const items: ContextMenuItem[] = [];
    
    // Mute/Unmute
    const isMuted = conv.currentParticipant?.isMuted;
    if (isMuted) {
      items.push({ label: t('chat.unmuteNotifications', 'Bỏ tắt thông báo'), icon: 'notifications', onClick: () => unmuteConv(conv.id) });
    } else {
      items.push({ label: t('chat.muteNotifications', 'Tắt thông báo'), icon: 'notifications_off', onClick: () => muteConv(conv.id) });
    }

    if (conv.type === 'direct') {
      items.push({ label: t('chat.deleteConversation', 'Xóa đoạn chat'), icon: 'delete', onClick: () => handleDeleteDirect(conv.id), variant: 'danger' });
    } else if (conv.type === 'group') {
      const isLeader = conv.currentParticipant?.role === 'leader';
      if (isLeader) {
        items.push({ label: t('chat.disbandGroup', 'Giải tán nhóm'), icon: 'delete_forever', onClick: () => handleDisbandGroup(conv.id), variant: 'danger' });
      } else {
        items.push({ label: t('chat.leaveGroup', 'Rời nhóm'), icon: 'logout', onClick: () => handleLeaveGroup(conv.id), variant: 'danger' });
      }
    }
    return items;
  };

  return (
    <aside aria-label="Conversation List" className="fixed top-0 h-screen z-40 w-[360px] ml-[72px] bg-surface border-r border-outline-variant/20 flex flex-col">
      {/* Sidebar Header */}
      <div className="px-5 pt-6 pb-4 flex flex-col gap-3 shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-[22px] font-bold text-on-surface tracking-tight">Swiftchat</h2>
          <button
            onClick={() => toast({ message: t('common.featureInDevelopment', { feature: t('chat.newConversation', 'Tạo tin nhắn mới') }), type: 'info' })}
            className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">edit_square</span>
          </button>
        </div>
        
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-[18px] pointer-events-none">search</span>
          <input
            className="w-full bg-surface-container rounded-full py-2.5 pl-10 pr-4 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-outline-variant transition-all placeholder:text-on-surface-variant/50"
            placeholder="Search"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>



      {/* List Items */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="p-4 text-center text-on-surface-variant">{t('common.loadingConversations')}</div>
        )}
        
        {isError && (
          <div className="flex flex-col items-center justify-center p-6 h-full text-center animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-on-surface/5 flex items-center justify-center mb-4 text-on-surface">
              <span className="material-symbols-outlined text-[32px]">wifi_off</span>
            </div>
            <h3 className="text-sm font-semibold text-on-surface mb-2">
              {t('errors.loadConversations', 'Không thể tải danh sách chat')}
            </h3>
            <p className="text-xs text-on-surface-variant mb-6 leading-relaxed">
              {t('errors.checkConnection', 'Vui lòng kiểm tra lại kết nối mạng và thử lại sau.')}
            </p>
            <button 
              onClick={() => refetch()} 
              className="px-6 py-2 bg-primary text-on-primary rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
            >
              {t('common.retry', 'Thử lại')}
            </button>
          </div>
        )}

        {data?.data?.map(conv => (
          <ConversationItem 
            key={conv.id} 
            conversation={conv} 
            isActive={activeConversationId === conv.id}
            onClick={() => onSelectConversation(conv.id)}
            onContextMenu={handleContextMenu}
          />
        ))}

        {!isLoading && !isError && (!data?.data || data.data.length === 0) && (
          <div className="flex flex-col items-center justify-center h-full px-6 py-10 text-center opacity-80 animate-in fade-in">
            <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center mb-4 border border-outline-variant/30">
              <span className="material-symbols-outlined text-[32px] text-on-surface-variant">chat_bubble</span>
            </div>
            <h3 className="text-sm font-medium text-on-surface mb-1">{t('chat.noConversations', 'Không có cuộc trò chuyện nào')}</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              {searchTerm 
                ? t('chat.noConversationsFound', 'Không tìm thấy cuộc trò chuyện nào phù hợp với tìm kiếm của bạn.')
                : t('chat.noConversationsDesc', 'Bắt đầu một cuộc trò chuyện mới để kết nối với bạn bè.')}
            </p>
          </div>
        )}
      </div>
      



      {contextMenu.conversation && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={getContextMenuItems(contextMenu.conversation)}
          onClose={() => setContextMenu({ ...contextMenu, conversation: null })}
        />
      )}
    </aside>
  );
};
