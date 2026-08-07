import { User } from '@/shared/types/models';

interface UserAvatarProps {
  user?: Partial<User> | null;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  fallbackText?: string;
}

export function UserAvatar({ 
  user, 
  size = 'md', 
  className = '',
  fallbackText = 'U' 
}: UserAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-[10px]',
    md: 'w-10 h-10 text-xs',
    lg: 'w-12 h-12 text-sm',
    xl: 'w-16 h-16 text-base',
    '2xl': 'w-24 h-24 text-3xl'
  };

  const currentSizeClass = sizeClasses[size];
  const initial = user?.displayName?.charAt(0) || user?.handle?.charAt(0) || fallbackText.charAt(0);

  return (
    <div className={`${currentSizeClass} relative shrink-0 rounded-full ${className}`}>
      <div className={`w-full h-full rounded-full bg-surface-container-high overflow-hidden flex items-center justify-center font-bold text-on-surface-variant border border-outline-variant`}>
        {user?.avatarUrl ? (
          <img src={user.avatarUrl} alt={user.handle || 'User'} className="w-full h-full object-cover" />
        ) : (
          <span>{initial.toUpperCase()}</span>
        )}
      </div>
    </div>
  );
};
