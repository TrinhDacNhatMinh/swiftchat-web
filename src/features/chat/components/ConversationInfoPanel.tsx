import { useState } from 'react';
import { Conversation } from '@/shared/types/models';
import { useAuthStore } from '@/stores/auth.store';
import { useDialog } from '@/contexts/DialogContext';
import { useTranslation } from 'react-i18next';
import { getConversationDetails } from '@/shared/utils/conversationUtils';
import { conversationApi } from '@/shared/services/conversationApi';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/features/chat/hooks/useConversations';
import { updateConversationList } from '@/shared/utils/queryCacheUtils';
import { GroupMemberList } from '@/features/chat/components/GroupMemberList';
import { AddMemberModal } from '@/features/chat/components/AddMemberModal';
import { CreateGroupWithModal } from '@/features/chat/components/CreateGroupWithModal';
import { useBlockList, useBlockUser, useUnblockUser } from '@/features/settings/hooks/useBlock';
import { useProfilePanelStore } from '@/stores/profilePanel.store';
import { useToast } from '@/contexts/ToastContext';
import { useFriends } from '@/features/friends/hooks/useFriends';

// Subcomponents
import { InfoPanelHeader } from '@/features/chat/components/info-panel/InfoPanelHeader';
import { InfoPanelActions } from '@/features/chat/components/info-panel/InfoPanelActions';
import { InfoPanelSettings } from '@/features/chat/components/info-panel/InfoPanelSettings';

interface ConversationInfoPanelProps {
  conversation: Conversation;
  onClose: () => void;
  onLeave: () => void;
  onOpenSearch: () => void;
}

export function ConversationInfoPanel({ conversation, onClose, onLeave, onOpenSearch }: ConversationInfoPanelProps) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const { confirm } = useDialog();
  const { t } = useTranslation();
  const { openProfile } = useProfilePanelStore();
  const { toast } = useToast();
  
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const { title, avatarUrl } = getConversationDetails(conversation, user?.id, t);

  const isGroup = conversation.type === 'group';
  const isLeader = conversation.currentParticipant?.role === 'leader';
  const partner = conversation.participantPreview?.find(p => p.accountId !== user?.id);
  const { accountId: partnerId, handle: partnerHandle } = partner || {};

  const { data: friendsData } = useFriends();
  const isPartnerFriend = friendsData?.some((f: any) => {
    const friendId = f.friend?.id || f.id;
    return friendId === partnerId;
  });

  const { mutate: updateGroup } = useMutation({
    mutationFn: (params: { title?: string; avatarUrl?: string }) => conversationApi.updateGroup(conversation.id, params),
    onSuccess: (_, variables) => {
      queryClient.setQueryData(queryKeys.conversations(), (old: any) => 
        updateConversationList(old, conversation.id, null, (c: any) => 
          c.id === conversation.id
            ? { ...c, displayInfo: { ...c.displayInfo, ...variables } }
            : c
        )
      );
    },
  });

  const { mutate: deleteConv, isPending: isDeleting } = useMutation({
    mutationFn: () => conversationApi.deleteConversation(conversation.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations() });
      onClose();
      onLeave();
    },
  });

  const { data: blockList } = useBlockList();
  const { mutate: blockUser, isPending: isBlockingReq } = useBlockUser();
  const { mutate: unblockUser, isPending: isUnblockingReq } = useUnblockUser();
  const isBlocked = partnerId && blockList?.some(b => b.id === partnerId);
  const isBlocking = isBlockingReq || isUnblockingReq;

  const { mutate: leaveGroup, isPending: isLeaving } = useMutation({
    mutationFn: () => conversationApi.removeMember(conversation.id, 'me'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations() });
      onLeave();
    },
  });

  const { mutate: muteConv, isPending: isMutingReq } = useMutation({
    mutationFn: () => conversationApi.muteConversation(conversation.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.conversations() })
  });

  const { mutate: unmuteConv, isPending: isUnmutingReq } = useMutation({
    mutationFn: () => conversationApi.unmuteConversation(conversation.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.conversations() })
  });

  const handleDelete = async () => {
    const confirmMessage = isGroup 
      ? t('chat.disbandGroupConfirm', 'Bạn có chắc chắn muốn giải tán nhóm này? Tất cả thành viên sẽ bị xóa và toàn bộ tin nhắn sẽ bị xóa vĩnh viễn.')
      : t('chat.deleteConversationConfirm', 'Bạn có chắc chắn muốn xóa đoạn chat này?');
      
    if (await confirm({ title: t('common.confirmTitle', 'Xác nhận'), message: confirmMessage, type: 'danger' })) {
      deleteConv();
    }
  };

  const handleBlockToggle = async () => {
    if (!partnerId) return;
    if (isBlocked) {
      if (await confirm({ title: t('common.confirmTitle', 'Xác nhận'), message: t('chat.unblockConfirm', 'Bạn có chắc chắn muốn bỏ chặn người dùng này?'), type: 'warning' })) unblockUser(partnerId);
    } else {
      if (await confirm({ title: t('common.confirmTitle', 'Xác nhận'), message: t('chat.blockConfirm', 'Bạn có chắc chắn muốn chặn người dùng này? Họ sẽ không thể gửi tin nhắn cho bạn nữa.'), type: 'danger' })) blockUser(partnerId);
    }
  };

  const handleLeave = async () => {
    if (await confirm({ title: t('common.confirmTitle', 'Xác nhận'), message: t('chat.leaveGroupConfirm', 'Bạn có chắc chắn muốn rời khỏi nhóm này?'), type: 'warning' })) {
      leaveGroup();
    }
  };

  return (
    <aside className="w-[320px] h-full bg-surface border-l border-outline-variant/20 flex flex-col shrink-0">
      {/* Header */}
      <div className="h-16 flex items-center justify-center px-4 border-b border-outline-variant/30 shrink-0 relative">
        <h3 className="font-headline-sm font-semibold text-on-surface text-center">
          {t('chat.conversationInfo', 'Thông tin đoạn chat')}
        </h3>
        <button
          onClick={onClose}
          className="absolute right-4 w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <InfoPanelHeader
          title={title}
          avatarUrl={avatarUrl || undefined}
          isGroup={isGroup}
          isLeader={isLeader}
          participantsCount={conversation.totalParticipants || conversation.participantPreview?.length || 0}
          onUpdateTitle={(newTitle) => updateGroup({ title: newTitle })}
          onUpdateAvatar={(url) => updateGroup({ avatarUrl: url })}
        />

        <InfoPanelActions
          isGroup={isGroup}
          isMuted={!!conversation.currentParticipant?.isMuted}
          isMuting={isMutingReq || isUnmutingReq}
          onMute={muteConv}
          onUnmute={unmuteConv}
          onOpenSearch={onOpenSearch}
          onViewProfile={() => {
            if (partnerHandle) {
              openProfile(partnerHandle);
            }
          }}
          onAddMember={() => setIsAddMemberModalOpen(true)}
        />

        <hr className="border-outline-variant/30" />

        {/* Removed Preview Members List */}

        <InfoPanelSettings
          isGroup={isGroup}
          isLeader={isLeader}
          isBlocked={!!isBlocked}
          isBlocking={isBlocking}
          isDeleting={isDeleting}
          isLeaving={isLeaving}
          participantsCount={conversation.totalParticipants || conversation.participantPreview?.length || 0}
          onOpenMembers={() => setIsMemberModalOpen(true)}
          onLeave={handleLeave}
          onDisband={handleDelete}
          onBlockToggle={handleBlockToggle}
          onDelete={handleDelete}
          onMockAction={(actionName) => toast({ message: t('common.featureInDevelopment', { feature: actionName }), type: 'development' })}
          partnerName={title}
          onCreateGroup={isPartnerFriend ? () => setIsCreateGroupModalOpen(true) : undefined}
        />
      </div>

      <GroupMemberList
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        conversation={conversation}
      />
      
      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        conversation={conversation}
      />
      
      {partnerId && (
        <CreateGroupWithModal
          isOpen={isCreateGroupModalOpen}
          onClose={() => setIsCreateGroupModalOpen(false)}
          partnerId={partnerId}
          partnerName={title}
          onCreated={(convId) => {
            // Usually we'd navigate to the new conversation here
            // The ConversationList handles it via query invalidation if we are using React Router,
            // but for now, just closing is fine.
          }}
        />
      )}
    </aside>
  );
};
