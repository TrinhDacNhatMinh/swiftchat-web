import { type ReactNode } from 'react';
import { User } from '@/shared/types/models';
import { UserAvatar } from '@/shared/components/common/UserAvatar';

interface UserListItemProps {
  user?: Partial<User> | null;
  subText?: string | ReactNode;
  badges?: ReactNode;
  actions?: ReactNode;
  onClick?: () => void;
  className?: string;
  avatarSize?: 'sm' | 'md' | 'lg' | 'xl';
  avatarClassName?: string;
  alwaysShowActions?: boolean;
}

export function UserListItem({
  user,
  subText,
  badges,
  actions,
  onClick,
  className = '',
  avatarSize = 'md',
  avatarClassName = '',
  alwaysShowActions = false
}: UserListItemProps) {
  const isClickable = !!onClick;
  
  return (
    <div 
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors group ${isClickable ? 'hover:bg-surface-container cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      <UserAvatar user={user} size={avatarSize} className={avatarClassName} />
      
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-on-surface flex items-center gap-2">
          <span className="truncate">{user?.displayName || user?.handle}</span>
          {badges}
        </div>
        <div className="text-[13px] text-on-surface-variant/80 truncate">
          {subText !== undefined ? subText : `@${user?.handle}`}
        </div>
      </div>

      {actions && (
        <div className={`flex items-center gap-1 transition-opacity ${alwaysShowActions ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          {actions}
        </div>
      )}
    </div>
  );
};
