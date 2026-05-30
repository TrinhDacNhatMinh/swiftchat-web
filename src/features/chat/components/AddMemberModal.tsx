import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useFriends } from '@/features/friends/hooks/useFriends';
import { Modal } from '@/shared/components/common/Modal';
import { UserListItem } from '@/shared/components/common/UserListItem';
import { conversationApi } from '@/shared/services/conversationApi';
import { Conversation } from '@/shared/types/models';
import { useToast } from '@/contexts/ToastContext';
import { queryKeys } from '@/features/chat/hooks/useConversations';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: Conversation;
}

export function AddMemberModal({ isOpen, onClose, conversation }: AddMemberModalProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Fetch current members to exclude them
  const { data: membersRes } = useQuery({
    queryKey: queryKeys.members(conversation.id),
    queryFn: () => conversationApi.getMembers(conversation.id),
    enabled: isOpen,
  });
  const currentMembers = Array.isArray(membersRes) ? membersRes : (membersRes?.data || []);
  const currentMemberIds = new Set(currentMembers.map((p: any) => p.accountId));

  // Fetch all friends using the unified hook
  const { data: friendsData, isLoading: isLoadingFriends } = useFriends();
  const friends = friendsData || [];

  // Filter friends: not in group and matches search
  const availableFriends = useMemo(() => {
    return friends.filter((item: any) => {
      const profile = item.friend || item;
      if (currentMemberIds.has(profile.id)) return false;
      const name = (profile.displayName || profile.handle || '').toLowerCase();
      return name.includes(search.toLowerCase());
    }).map((item: any) => item.friend || item);
  }, [friends, currentMemberIds, search]);

  const toggleSelection = (userId: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedIds(newSelected);
  };

  const { mutate: addMembers, isPending } = useMutation({
    mutationFn: (userIds: string[]) => conversationApi.addMembers(conversation.id, userIds),
    onSuccess: () => {
      toast({ message: t('common.success', 'Thành công'), type: 'success' });
      queryClient.invalidateQueries({ queryKey: queryKeys.members(conversation.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations() });
      onClose();
      setSearch('');
      setSelectedIds(new Set());
    },
    onError: () => {
      toast({ message: t('common.error', 'Đã có lỗi xảy ra'), type: 'error' });
    }
  });

  const handleAdd = () => {
    if (selectedIds.size === 0) return;
    addMembers(Array.from(selectedIds));
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={() => {
        onClose();
        setSearch('');
        setSelectedIds(new Set());
      }} 
      title={t('chat.addMembers', 'Thêm thành viên')}
    >
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

        <div className="max-h-[50vh] overflow-y-auto space-y-1 min-h-[200px]">
          {isLoadingFriends ? (
            <div className="flex justify-center py-8">
              <span className="material-symbols-outlined text-[24px] text-primary animate-spin">progress_activity</span>
            </div>
          ) : availableFriends.length === 0 ? (
            <div className="text-center py-12 text-on-surface-variant">
              <span className="material-symbols-outlined text-[48px] opacity-20 mb-3 block">person_add_disabled</span>
              <p className="text-sm font-medium">{t('chat.noFriendsAvailable', 'Không có bạn bè nào khả dụng để thêm')}</p>
            </div>
          ) : (
            availableFriends.map((friend: any) => {
              const isSelected = selectedIds.has(friend.id);
              return (
                <UserListItem
                  key={friend.id}
                  user={friend}
                  alwaysShowActions={true}
                  onClick={() => toggleSelection(friend.id)}
                  actions={
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                      isSelected ? 'bg-primary border-primary text-on-primary' : 'border-outline-variant'
                    }`}>
                      {isSelected && <span className="material-symbols-outlined text-[14px]">check</span>}
                    </div>
                  }
                />
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-outline-variant flex justify-end gap-3 mt-4">
          <button
            onClick={() => {
              onClose();
              setSearch('');
              setSelectedIds(new Set());
            }}
            className="px-4 py-2 rounded-xl text-sm font-medium text-on-surface-variant hover:bg-surface-container transition-colors"
            disabled={isPending}
          >
            {t('common.cancel', 'Hủy')}
          </button>
          <button
            onClick={handleAdd}
            disabled={selectedIds.size === 0 || isPending}
            className="px-5 py-2 rounded-xl text-sm font-semibold bg-primary text-on-primary hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isPending && <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>}
            {t('chat.addSelected', 'Thêm {{count}} người', { count: selectedIds.size })}
          </button>
        </div>
      </div>
    </Modal>
  );
};
