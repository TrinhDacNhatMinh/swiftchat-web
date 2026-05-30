import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useFriends } from '@/features/friends/hooks/useFriends';
import { Modal } from '@/shared/components/common/Modal';
import { UserListItem } from '@/shared/components/common/UserListItem';
import { AvatarUpload } from '@/shared/components/common/AvatarUpload';
import { conversationApi } from '@/shared/services/conversationApi';
import { queryKeys } from '@/features/chat/hooks/useConversations';

interface CreateGroupWithModalProps {
  isOpen: boolean;
  onClose: () => void;
  partnerId: string;
  partnerName: string;
  onCreated?: (conversationId: string) => void;
}

export function CreateGroupWithModal({ isOpen, onClose, partnerId, partnerName, onCreated }: CreateGroupWithModalProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [groupTitle, setGroupTitle] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string>('');

  // Fetch all friends using the unified hook
  const { data: friendsData, isLoading: isLoadingFriends } = useFriends();
  const friends = friendsData || [];

  // Filter friends: matches search
  const availableFriends = useMemo(() => {
    return friends.filter((item: any) => {
      const profile = item.friend || item;
      const name = (profile.displayName || profile.handle || '').toLowerCase();
      return name.includes(search.toLowerCase());
    }).map((item: any) => item.friend || item);
  }, [friends, search]);

  const toggleSelection = (userId: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedIds(newSelected);
  };

  const { mutate: createGroup, isPending } = useMutation({
    mutationFn: () => {
      // The partner is always included
      const userIds = [partnerId, ...Array.from(selectedIds)];
      return conversationApi.create({
        type: 'group',
        userIds,
        title: groupTitle.trim(),
        avatarUrl: avatarUrl || undefined,
      });
    },
    onSuccess: (res: any) => {
      const conv = res?.data || res;
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations() });
      onCreated?.(conv.id);
      handleClose();
    },
  });

  const handleClose = () => {
    setSearch('');
    setSelectedIds(new Set());
    setGroupTitle('');
    setAvatarUrl('');
    onClose();
  };

  const handleCreate = () => {
    createGroup();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t('chat.createNewGroup', 'Tạo nhóm mới')} maxWidth="max-w-lg">
      <div className="flex flex-col h-[70vh] max-h-[600px] w-full">
        
        {/* Header Section (Title, Avatar & Fixed Member) */}
        <div className="p-4 border-b border-outline-variant shrink-0 space-y-4">
          <div className="flex gap-4 items-center">
            <AvatarUpload
              currentUrl={avatarUrl}
              nameFallback={groupTitle || '?'}
              onUploadSuccess={setAvatarUrl}
              isGroup={true}
              className="w-14 h-14"
            />
            <input
              type="text"
              className="w-full bg-surface-container rounded-xl px-4 py-3 text-sm text-on-surface border border-outline-variant focus:outline-none focus:border-primary transition-colors"
              placeholder={t('chat.groupNamePlaceholder', 'Nhập tên nhóm...')}
              value={groupTitle}
              onChange={(e) => setGroupTitle(e.target.value)}
            />
          </div>
        </div>

        {/* Search */}
        <div className="px-4 py-3 shrink-0 relative">
          <span className="material-symbols-outlined absolute left-7 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
            search
          </span>
          <input
            type="text"
            className="w-full bg-surface-container rounded-full pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-on-surface placeholder:text-on-surface-variant/70"
            placeholder={t('chat.selectFriendsToAdd', 'Chọn bạn bè để thêm')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Friends List */}
        <div className="flex-1 overflow-y-auto px-2 pb-2">
          {isLoadingFriends ? (
            <div className="flex justify-center py-8">
              <span className="material-symbols-outlined animate-spin text-primary text-3xl">progress_activity</span>
            </div>
          ) : availableFriends.length === 0 ? (
            <div className="text-center py-8 text-on-surface-variant text-sm">
              {search ? t('chat.noSearchResults', { keyword: search }) : t('chat.noFriendsAvailable', 'Không có bạn bè nào khả dụng để thêm')}
            </div>
          ) : (
            <div className="space-y-1">
              {availableFriends.map((friend) => {
                const isPartner = friend.id === partnerId;
                const isSelected = selectedIds.has(friend.id) || isPartner;
                return (
                  <UserListItem
                    key={friend.id}
                    user={friend}
                    alwaysShowActions={true}
                    onClick={() => !isPartner && toggleSelection(friend.id)}
                    actions={
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                        isSelected ? 'bg-primary border-primary text-on-primary' : 'border-outline-variant'
                      } ${isPartner ? 'opacity-70 cursor-not-allowed' : ''}`}>
                        {isSelected && <span className="material-symbols-outlined text-[14px]">check</span>}
                      </div>
                    }
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-outline-variant flex justify-between items-center shrink-0">
          <span className="text-sm font-medium text-on-surface-variant">
            {t('chat.selectedCount', 'Đã chọn {{count}} người', { count: selectedIds.size + 1 })}
          </span>
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-on-surface-variant hover:bg-surface-container transition-colors"
              disabled={isPending}
            >
              {t('chat.cancel', 'Hủy')}
            </button>
            <button
              onClick={handleCreate}
              disabled={!groupTitle.trim() || selectedIds.size === 0 || isPending}
              className="px-5 py-2 rounded-xl text-sm font-semibold bg-primary text-on-primary hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isPending && <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>}
              {t('chat.create', 'Tạo nhóm')}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
