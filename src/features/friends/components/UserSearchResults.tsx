import { useQuery } from '@tanstack/react-query';
import { userApi } from '@/shared/services/userApi';
import { FriendProfile } from '@/shared/services/friendApi';
import { AddFriendButton } from '@/features/friends/components/AddFriendButton';
import { useFriendActions } from '@/features/friends/hooks/useFriendActions';
import { useFriendshipStatus } from '@/features/friends/hooks/useFriendshipStatus';
import { UserListItem } from '@/shared/components/common/UserListItem';
import { useAuthStore } from '@/stores/auth.store';
import { useDialog } from '@/contexts/DialogContext';
import { useTranslation } from 'react-i18next';
import { useBlockList, useBlockUser, useUnblockUser } from '@/features/settings/hooks/useBlock';
import { useProfilePanelStore } from '@/stores/profilePanel.store';


interface UserSearchResultsProps {
  query: string;
  onStartChat?: (conversationId: string) => void;
}

export function UserSearchResults({ query, onStartChat }: UserSearchResultsProps) {
  const { user: me } = useAuthStore();
  const { openProfile } = useProfilePanelStore();
  const { getFriendshipStatus } = useFriendshipStatus();
  const { sendRequest, cancelRequest, respondRequest, startDirectChat } = useFriendActions();
  const { confirm } = useDialog();
  const { t } = useTranslation();
  
  const { data: blockList } = useBlockList();
  const { mutate: blockUser, isPending: isBlocking } = useBlockUser();
  const { mutate: unblockUser, isPending: isUnblocking } = useUnblockUser();

  const normalizedQuery = query.startsWith('@') ? query.slice(1) : query;

  const { data: results, isLoading } = useQuery<FriendProfile[]>({
    queryKey: ['users', 'search', normalizedQuery],
    queryFn: async () => {
      const res: any = await userApi.searchUsers(normalizedQuery);
      if (Array.isArray(res)) return res;
      if (res?.data && Array.isArray(res.data)) return res.data;
      if (res?.data?.data && Array.isArray(res.data.data)) return res.data.data;
      return [];
    },
    enabled: normalizedQuery.trim().length >= 2,
  });


  const handleChat = (user: FriendProfile) => {
    startDirectChat.mutate(user.id, {
      onSuccess: (res: any) => {
        const convoId = res?.data?.id || res?.id;
        if (convoId && onStartChat) onStartChat(convoId);
      },
    });
  };

  if (query.trim().length < 2) return null;

  if (isLoading) {
    return (
      <div className="px-4 py-3 space-y-3">
        {[1, 2].map(i => (
          <div key={i} className="flex items-center gap-3 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-surface-container-high flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-surface-container-high rounded w-32" />
              <div className="h-2 bg-surface-container-high rounded w-20" />
            </div>
            <div className="h-7 w-24 bg-surface-container-high rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="px-4 py-6 text-center">
        <span className="material-symbols-outlined text-3xl text-on-surface-variant/40 block mb-2">search_off</span>
        <p className="text-sm text-on-surface-variant">No users found for "{query}"</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {results
        .filter(u => u.id !== me?.id)
        .map(u => {
          const { status, requestId } = getFriendshipStatus(u.id);
          const isBlocked = blockList?.some(b => b.id === u.id);

          const handleBlockToggle = async (e: React.MouseEvent) => {
            e.stopPropagation();
            if (isBlocked) {
              if (await confirm({ title: t('common.confirmTitle', 'Xác nhận'), message: t('chat.unblockConfirm', 'Bạn có chắc chắn muốn bỏ chặn người dùng này?'), type: 'warning' })) {
                unblockUser(u.id);
              }
            } else {
              if (await confirm({ title: t('common.confirmTitle', 'Xác nhận'), message: t('chat.blockConfirm', 'Bạn có chắc chắn muốn chặn người dùng này? Họ sẽ không thể gửi tin nhắn cho bạn nữa.'), type: 'danger' })) {
                blockUser(u.id);
              }
            }
          };

          return (
            <UserListItem
              key={u.id}
              user={u}
              subText={`@${u.handle}`}
              className={`!px-4 !py-3 hover:bg-surface-container-high/50 ${isBlocked ? 'opacity-50 grayscale' : ''}`}
              onClick={() => !isBlocked && openProfile(u.handle)}
              actions={
                <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                  {!isBlocked && status === 'friends' && (
                    <button
                      onClick={() => handleChat(u)}
                      disabled={startDirectChat.isPending}
                      className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary hover:bg-primary/30 transition-colors disabled:opacity-50"
                      title="Message"
                    >
                      <span className="material-symbols-outlined text-[16px]">chat_bubble</span>
                    </button>
                  )}
                  
                  {!isBlocked && (
                    <AddFriendButton
                      targetUser={u}
                      status={status}
                      requestId={requestId}
                      onSend={(id) => sendRequest.mutate(id)}
                      onCancel={(id) => cancelRequest.mutate(id)}
                      onAccept={(id) => respondRequest.mutate({ id, action: 'accepted' })}
                      onReject={(id) => respondRequest.mutate({ id, action: 'rejected' })}
                      isLoading={sendRequest.isPending || cancelRequest.isPending || respondRequest.isPending}
                    />
                  )}
                  
                  <button
                    onClick={handleBlockToggle}
                    disabled={isBlocking || isUnblocking}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors disabled:opacity-50 ${isBlocked ? 'bg-secondary/20 text-secondary hover:bg-secondary/30' : 'text-on-surface-variant hover:bg-error/10 hover:text-error'}`}
                    title={isBlocked ? t('chat.unblockUser', 'Bỏ chặn') : t('chat.blockUser', 'Chặn')}
                  >
                    <span className="material-symbols-outlined text-[16px]">{isBlocked ? 'lock_open' : 'block'}</span>
                  </button>
                </div>
              }
            />
          );
        })}
    </div>
  );
};
