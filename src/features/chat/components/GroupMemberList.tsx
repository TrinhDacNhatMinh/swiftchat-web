import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Modal } from '@/shared/components/common/Modal';
import { Conversation } from '@/shared/types/models';
import { conversationApi } from '@/shared/services/conversationApi';
import { useAuthStore } from '@/stores/auth.store';
import { useDialog } from '@/contexts/DialogContext';
import { useTranslation } from 'react-i18next';
import { queryKeys } from '@/features/chat/hooks/useConversations';
import { UserListItem } from '@/shared/components/common/UserListItem';
import { getRoleLabel } from '@/shared/utils/conversationUtils';

interface GroupMemberListProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: Conversation;
}

export function GroupMemberList({ isOpen, onClose, conversation }: GroupMemberListProps) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const { confirm } = useDialog();
  const { t } = useTranslation();

  // Fetch members
  const { data: membersRes, isLoading } = useQuery({
    queryKey: queryKeys.members(conversation.id),
    queryFn: () => conversationApi.getMembers(conversation.id),
    enabled: isOpen,
  });
  
  // Handle both flat array or { data: array } structures from API
  const rawData = Array.isArray(membersRes) ? membersRes : (membersRes?.data || []);
  
  // Map the flat response from getMembers to the Participant shape
  const participants = rawData.map((p: any) => ({
    id: p.id,
    accountId: p.accountId,
    role: p.role,
    joinAt: p.joinAt,
    user: {
      id: p.accountId,
      handle: p.handle,
      displayName: p.displayName,
      avatarUrl: p.avatarUrl
    }
  }));

  // Find current user's participant info to check permissions
  const me = participants.find((p: any) => p.accountId === user?.id);
  const myRole = me?.role || 'member';
  const isLeader = myRole === 'leader';
  const isDeputy = myRole === 'deputy' || isLeader;

  const filteredParticipants = participants.filter((p: any) => {
    const name = (p.user.displayName || p.user.handle || '').toLowerCase();
    const matchesSearch = name.includes(search.toLowerCase());
    return matchesSearch;
  });

  // Mutations
  const { mutate: kickMember } = useMutation({
    mutationFn: (userId: string) => conversationApi.removeMember(conversation.id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations() });
      queryClient.invalidateQueries({ queryKey: queryKeys.members(conversation.id) });
    },
  });

  const { mutate: changeRole } = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: 'deputy' | 'member' }) =>
      conversationApi.updateRole(conversation.id, userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations() });
      queryClient.invalidateQueries({ queryKey: queryKeys.members(conversation.id) });
    },
  });

  const { mutate: transferLeader } = useMutation({
    mutationFn: (userId: string) => conversationApi.transferLeadership(conversation.id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations() });
      queryClient.invalidateQueries({ queryKey: queryKeys.members(conversation.id) });
    },
  });

  const handleRoleChange = async (p: any) => {
    const newRole = p.role === 'deputy' ? t('chat.member') : t('chat.deputy');
    if (await confirm({ title: t('common.confirmTitle', 'Xác nhận'), message: t('chat.changeRoleConfirm', 'Bạn muốn đổi vai trò của người này thành {{role}}?', { role: newRole }), type: 'warning' })) {
      changeRole({ userId: p.accountId, role: p.role === 'deputy' ? 'member' : 'deputy' });
    }
  };

  const handleTransfer = async (p: any) => {
    if (await confirm({ title: t('common.confirmTitle', 'Xác nhận'), message: t('chat.transferLeaderConfirm', 'Bạn chắc chắn muốn chuyển quyền Trưởng nhóm cho người này? Bạn sẽ trở thành Thành viên.'), type: 'danger' })) {
      transferLeader(p.accountId);
    }
  };

  const handleKick = async (p: any) => {
    if (await confirm({ title: t('common.confirmTitle', 'Xác nhận'), message: t('chat.kickMemberConfirm', 'Mời người này ra khỏi nhóm?'), type: 'danger' })) {
      kickMember(p.accountId);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'leader': return 'bg-error/15 text-error';
      case 'deputy': return 'bg-amber-500/15 text-amber-600';
      default: return 'bg-surface-container-high text-on-surface-variant';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('chat.membersCount', 'Thành viên ({{count}})', { count: participants.length || 0 })}>
      <div className="p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">search</span>
          <input
            type="text"
            className="w-full bg-surface-container rounded-xl pl-10 pr-4 py-2.5 text-sm text-on-surface border border-outline-variant focus:outline-none focus:border-primary transition-colors"
            placeholder={t('chat.searchMember', 'Tìm thành viên...')}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="max-h-[60vh] overflow-y-auto space-y-1">
          {isLoading && (
            <div className="flex justify-center py-4">
              <span className="material-symbols-outlined text-[24px] text-primary animate-spin">progress_activity</span>
            </div>
          )}
          {!isLoading && filteredParticipants.length === 0 && (
            <div className="text-center py-8 text-on-surface-variant">
              <span className="material-symbols-outlined text-[48px] opacity-20 mb-2">person_search</span>
              <p className="text-sm">{t('chat.noSearchResults', 'Không tìm thấy kết quả nào cho "{{keyword}}"', { keyword: search })}</p>
            </div>
          )}
          {!isLoading && filteredParticipants.map((p: any) => {
            const isMe = p.accountId === user?.id;

            return (
              <UserListItem
                key={p.accountId}
                user={p.user}
                badges={
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md shrink-0 ${getRoleBadgeColor(p.role)}`}>
                    {getRoleLabel(p.role, t)}
                  </span>
                }
                actions={
                  !isMe && isDeputy && p.role !== 'leader' ? (
                    <>
                      {/* Promote/Demote Deputy */}
                      {isLeader && (
                        <button
                          onClick={() => handleRoleChange(p)}
                          className="w-8 h-8 rounded-full hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant"
                          title={p.role === 'deputy' ? t('chat.demoteToMember', 'Giáng xuống Thành viên') : t('chat.promoteToDeputy', 'Thăng lên Phó nhóm')}
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {p.role === 'deputy' ? 'arrow_downward' : 'shield_person'}
                          </span>
                        </button>
                      )}

                      {isLeader && (
                        <button
                          onClick={() => handleTransfer(p)}
                          className="w-8 h-8 rounded-full hover:bg-amber-500/10 flex items-center justify-center text-amber-600"
                          title={t('chat.transferLeader', 'Chuyển quyền Admin')}
                        >
                          <span className="material-symbols-outlined text-[18px]">stars</span>
                        </button>
                      )}

                      {(isLeader || (isDeputy && p.role === 'member')) && (
                        <button
                          onClick={() => handleKick(p)}
                          className="w-8 h-8 rounded-full hover:bg-error/10 flex items-center justify-center text-error"
                          title={t('chat.kickMember', 'Mời ra khỏi nhóm')}
                        >
                          <span className="material-symbols-outlined text-[18px]">person_remove</span>
                        </button>
                      )}
                    </>
                  ) : undefined
                }
              />
            );
          })}
        </div>
      </div>
    </Modal>
  );
};
