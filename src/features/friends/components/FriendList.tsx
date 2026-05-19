import { type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useFriends } from '@/features/friends/hooks/useFriends';
import { useFriendActions } from '@/features/friends/hooks/useFriendActions';
import { useDialog } from '@/contexts/DialogContext';
import { useAuthStore } from '@/stores/auth.store';
import { UserListItem } from '@/shared/components/common/UserListItem';
import { usePresenceStore } from '@/stores/presence.store';

interface FriendListProps {
  onStartChat: (conversationId: string) => void;
}

const FriendRow: FC<{ item: any; currentUserId: string; onStartChat: (id: string) => void }> = ({
  item,
  currentUserId,
  onStartChat,
}) => {
  const { unfriend, startDirectChat } = useFriendActions();
  const { confirm } = useDialog();
  const profile = item.friend || item;
  const isOnline = usePresenceStore((s) => s.onlineUsers.has(profile?.id ?? ''));

  const handleMessage = () => {
    startDirectChat.mutate(profile.id, {
      onSuccess: (res: any) => {
        const convoId = res?.data?.id || res?.id;
        if (convoId) onStartChat(convoId);
      },
    });
  };

  return (
    <UserListItem
      user={profile}
      subText={`@${profile?.handle}`}
      className="!px-4 !py-3 hover:bg-surface-container-high/50"
      avatarClassName={isOnline
        ? "relative after:content-[''] after:absolute after:bottom-0 after:right-0 after:w-2.5 after:h-2.5 after:rounded-full after:bg-green-500 after:border-2 after:border-surface-container-lowest"
        : ""}
      actions={
        <>
          <button
            onClick={handleMessage}
            disabled={startDirectChat.isPending}
            className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary hover:bg-primary/30 transition-colors disabled:opacity-50"
            title="Message"
          >
            <span className="material-symbols-outlined text-[16px]">chat_bubble</span>
          </button>
          <button
            onClick={async (e) => {
              e.stopPropagation();
              if (await confirm({ title: `Unfriend ${profile?.displayName || profile?.handle}?`, message: 'Are you sure you want to remove this person from your friends list?', confirmText: 'Unfriend', type: 'danger' })) {
                unfriend.mutate(profile.id);
              }
            }}
            disabled={unfriend.isPending}
            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-error/20 hover:text-error transition-colors disabled:opacity-50"
            title="Unfriend"
          >
            <span className="material-symbols-outlined text-[16px]">person_remove</span>
          </button>
        </>
      }
    />
  );
};

export function FriendList({ onStartChat }: FriendListProps) {
  const { data: friends, isLoading } = useFriends();
  const { user } = useAuthStore();
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="px-4 py-3 space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-3 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-surface-container-high flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-surface-container-high rounded w-28" />
              <div className="h-2 bg-surface-container-high rounded w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!friends || friends.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-4 py-12 text-center opacity-80 animate-in fade-in">
        <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center mb-4 border border-outline-variant/30">
          <span className="material-symbols-outlined text-[32px] text-on-surface-variant">group</span>
        </div>
        <h3 className="text-sm font-medium text-on-surface mb-1">{t('friends.noFriends', 'Chưa có bạn bè')}</h3>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          {t('friends.noFriendsDesc', 'Tìm kiếm người dùng khác để kết bạn và bắt đầu trò chuyện.')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {friends.map(item => (
        <FriendRow
          key={item.id}
          item={item}
          currentUserId={user?.id ?? ''}
          onStartChat={onStartChat}
        />
      ))}
    </div>
  );
};
