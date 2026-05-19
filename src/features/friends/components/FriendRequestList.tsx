import { useFriendRequests } from '@/features/friends/hooks/useFriendRequests';
import { FriendRequestCard } from '@/features/friends/components/FriendRequestCard';
import { SentRequestCard } from '@/features/friends/components/SentRequestCard';
import { useAuthStore } from '@/stores/auth.store';
import { useTranslation } from 'react-i18next';

interface FriendRequestListProps {
  type: 'received' | 'sent';
}

export function FriendRequestList({ type }: FriendRequestListProps) {
  const { user: me } = useAuthStore();
  const { data: requests, isLoading } = useFriendRequests();
  const { t } = useTranslation();

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
          </div>
        ))}
      </div>
    );
  }

  const filteredRequests = requests?.filter(req => 
    type === 'received' ? req.receiverId === me?.id : req.senderId === me?.id
  ) || [];

  if (!filteredRequests || filteredRequests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-4 py-12 text-center opacity-80 animate-in fade-in">
        <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center mb-4 border border-outline-variant/30">
          <span className="material-symbols-outlined text-[32px] text-on-surface-variant">
            {type === 'received' ? 'inbox' : 'outbox'}
          </span>
        </div>
        <h3 className="text-sm font-medium text-on-surface mb-1">
          {type === 'received' ? t('friends.noRequests', 'Không có lời mời nào') : t('friends.noSentRequests', 'Không có lời mời đã gửi')}
        </h3>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          {type === 'received' 
            ? t('friends.noRequestsDesc', 'Bạn sẽ thấy các lời mời kết bạn ở đây khi có người gửi cho bạn.') 
            : t('friends.noSentRequestsDesc', 'Các lời mời bạn gửi cho người khác sẽ xuất hiện ở đây.')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {filteredRequests.map(req => (
        type === 'received' 
          ? <FriendRequestCard key={req.id} request={req} />
          : <SentRequestCard key={req.id} request={req} />
      ))}
    </div>
  );
};
