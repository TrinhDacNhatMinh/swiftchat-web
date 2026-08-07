import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/auth.store';
import { useFriendRequests } from '@/features/friends/hooks/useFriendRequests';
import { useUnreadCount } from '@/features/notifications/hooks/useUnreadCount';
import { SettingsModal } from '@/features/settings/components/SettingsModal';
import { useProfilePanelStore } from '@/stores/profilePanel.store';

type NavTab = 'chats' | 'people' | 'notifications';

interface NavRailProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export function NavRail({ activeTab, onTabChange }: NavRailProps) {
  const { user } = useAuthStore();
  const { data: friendRequests } = useFriendRequests();
  const { data: notifUnreadCount } = useUnreadCount();
  const receivedRequests = friendRequests?.filter(req => req.receiverId === user?.id) || [];
  const pendingCount = receivedRequests.length;

  const { openProfile } = useProfilePanelStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { t } = useTranslation();

  const navItems: { id: NavTab; icon: string; label: string; badge?: number }[] = [
    { id: 'chats', icon: 'chat_bubble', label: t('nav.conversations') },
    { id: 'people', icon: 'group', label: t('nav.people'), badge: pendingCount },
    { id: 'notifications', icon: 'notifications', label: t('nav.notifications'), badge: notifUnreadCount ?? 0 },
  ];

  return (
    <nav
      aria-label="Primary Navigation"
      className="fixed left-0 top-0 h-screen z-50 w-[72px] flex flex-col items-center py-3 bg-surface border-r border-outline-variant/20 transition-colors duration-200"
    >
      {/* Brand Logo */}
      <div className="mb-6 mt-1 flex items-center justify-center w-10 h-10">
        <span className="text-on-surface font-black text-[22px] tracking-tighter select-none">S</span>
      </div>

      {/* Nav Items */}
      <div className="flex flex-col gap-1 w-full px-2">
        {navItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => onTabChange(item.id)}
              className={`w-full h-11 flex flex-col items-center justify-center rounded-xl transition-all relative
                ${isActive
                  ? 'bg-surface-container-high text-on-surface'
                  : 'text-on-surface-variant/60 hover:bg-surface-container hover:text-on-surface'
                }`}
            >
              <span className={`material-symbols-outlined text-[22px] ${isActive ? 'fill' : ''}`}>
                {item.icon}
              </span>

              {/* Badge */}
              {item.badge != null && item.badge > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[14px] h-[14px] px-0.5 rounded-full bg-error text-on-error text-[8px] font-bold flex items-center justify-center leading-none">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom */}
      <div className="mt-auto flex flex-col gap-1 w-full px-2 pb-1">
        <button
          id="nav-settings"
          aria-label="Settings"
          onClick={() => setIsSettingsOpen(true)}
          className="w-full h-11 flex flex-col items-center justify-center rounded-xl text-on-surface-variant/60 hover:bg-surface-container hover:text-on-surface transition-all"
        >
          <span className="material-symbols-outlined text-[22px]">settings</span>
        </button>

        <button
          onClick={() => { if (user?.handle) openProfile(user.handle); }}
          className="w-10 h-10 rounded-full overflow-hidden border-2 border-transparent hover:border-outline-variant transition-all cursor-pointer mx-auto flex items-center justify-center font-bold text-sm text-on-surface-variant bg-surface-container-high"
        >
          {user?.avatarUrl ? (
            <img alt={user?.displayName || user?.handle || 'User'} className="w-full h-full object-cover" src={user.avatarUrl} />
          ) : (
            (user?.displayName || user?.handle || '?').charAt(0).toUpperCase()
          )}
        </button>
      </div>

      {/* Settings Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </nav>
  );
};
