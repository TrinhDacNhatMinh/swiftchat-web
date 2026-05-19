import { useTranslation } from 'react-i18next';
import { FriendProfile } from '@/shared/services/friendApi';
import { Button } from '@/shared/components/ui/Button';
import { Icon } from '@/shared/components/ui/Icon';

type FriendshipStatus = 'none' | 'sent' | 'received' | 'friends';

interface AddFriendButtonProps {
  targetUser: FriendProfile;
  status: FriendshipStatus;
  requestId?: string;
  onSend: (userId: string) => void;
  onCancel: (requestId: string) => void;
  onAccept: (requestId: string) => void;
  onReject: (requestId: string) => void;
  isLoading?: boolean;
}

export function AddFriendButton({
  targetUser,
  status,
  requestId,
  onSend,
  onCancel,
  onAccept,
  onReject,
  isLoading,
}: AddFriendButtonProps) {
  const { t } = useTranslation();

  if (status === 'friends') {
    return (
      <span className="flex items-center gap-1 px-3 py-1.5 rounded-full text-secondary border border-secondary/30 bg-secondary/10 text-sm font-medium">
        <Icon name="check" size={16} />
        {t('friends.friends')}
      </span>
    );
  }

  if (status === 'sent') {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          requestId && onCancel(requestId);
        }}
        disabled={isLoading}
        className="hover:bg-error/10 hover:text-error hover:border-error/30"
      >
        <Icon name="close" size={16} className="mr-1" />
        {t('friends.cancelRequest')}
      </Button>
    );
  }

  if (status === 'received') {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="primary"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            requestId && onAccept(requestId);
          }}
          disabled={isLoading}
        >
          <Icon name="check" size={16} className="mr-1" />
          {t('friends.accept')}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            requestId && onReject(requestId);
          }}
          disabled={isLoading}
          className="hover:bg-error/10 hover:text-error"
        >
          <Icon name="close" size={16} className="mr-1" />
          {t('friends.reject')}
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={(e) => {
        e.stopPropagation();
        onSend(targetUser.id);
      }}
      disabled={isLoading}
    >
      <Icon name="person_add" size={16} className="mr-1" />
      {t('friends.addFriend')}
    </Button>
  );
};
