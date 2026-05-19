import { FriendRequestWithProfiles } from '@/shared/services/friendApi';
import { useFriendActions } from '@/features/friends/hooks/useFriendActions';
import { UserListItem } from '@/shared/components/common/UserListItem';

interface FriendRequestCardProps {
  request: FriendRequestWithProfiles;
}

export function FriendRequestCard({ request }: FriendRequestCardProps) {
  const { respondRequest } = useFriendActions();
  const isLoading = respondRequest.isPending;
  const sender = request.sender;

  const handleAccept = () => respondRequest.mutate({ id: request.id, action: 'accepted' });
  const handleReject = () => respondRequest.mutate({ id: request.id, action: 'rejected' });

  return (
    <UserListItem
      user={sender}
      subText={`@${sender?.handle}`}
      className="!px-4 !py-3 hover:bg-surface-container-high/50"
      actions={
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleAccept}
            disabled={isLoading}
            className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary hover:opacity-90 transition-opacity disabled:opacity-50"
            title="Accept"
          >
            <span className="material-symbols-outlined text-[16px]">check</span>
          </button>
          <button
            onClick={handleReject}
            disabled={isLoading}
            className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface hover:bg-surface-variant transition-colors disabled:opacity-50"
            title="Reject"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      }
    />
  );
};
