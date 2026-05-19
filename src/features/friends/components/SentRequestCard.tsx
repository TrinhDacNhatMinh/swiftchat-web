import { FriendRequestWithProfiles } from '@/shared/services/friendApi';
import { useFriendActions } from '@/features/friends/hooks/useFriendActions';

interface SentRequestCardProps {
  request: FriendRequestWithProfiles;
}

export function SentRequestCard({ request }: SentRequestCardProps) {
  const { cancelRequest } = useFriendActions();
  const receiver = request.receiver;

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-container-high transition-colors group">
      {/* Avatar */}
      <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-container-highest border border-outline-variant flex items-center justify-center text-on-surface-variant shrink-0">
        {receiver.avatarUrl ? (
          <img src={receiver.avatarUrl} alt={receiver.displayName || receiver.handle} className="w-full h-full object-cover" />
        ) : (
          <span className="font-bold text-lg">
            {(receiver.displayName || receiver.handle).charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-headline-sm text-sm font-semibold text-on-surface truncate">
          {receiver.displayName || receiver.handle}
        </h4>
        <p className="font-body-sm text-xs text-on-surface-variant truncate">
          @{receiver.handle}
        </p>
      </div>

      {/* Action */}
      <div className="flex gap-2">
        <button
          onClick={() => cancelRequest.mutate(request.id)}
          disabled={cancelRequest.isPending}
          className="px-3 py-1.5 bg-surface-container text-on-surface text-xs font-semibold rounded-full hover:bg-surface-container-highest transition-colors disabled:opacity-50"
        >
          {cancelRequest.isPending ? 'Đang hủy...' : 'Hủy'}
        </button>
      </div>
    </div>
  );
};
