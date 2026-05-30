import { useTranslation } from 'react-i18next';
import { Icon } from '@/shared/components/ui/Icon';

interface InfoPanelActionsProps {
  isGroup?: boolean;
  isMuted: boolean;
  isMuting: boolean;
  onMute: () => void;
  onUnmute: () => void;
  onOpenSearch: () => void;
  onViewProfile?: () => void;
  onAddMember?: () => void;
}

export function InfoPanelActions({
  isGroup = false,
  isMuted,
  isMuting,
  onMute,
  onUnmute,
  onOpenSearch,
  onViewProfile,
  onAddMember,
}: InfoPanelActionsProps) {
  const { t } = useTranslation();

  return (
    <div className="flex gap-2 justify-center">
      {!isGroup && (
        <button
          onClick={onViewProfile}
          className="flex flex-col items-center gap-1.5 p-2 group text-on-surface-variant w-16"
        >
          <div className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center group-hover:bg-surface-container-high transition-colors">
            <Icon name="person" size={20} />
          </div>
          <span className="text-[11px] font-medium">{t('chat.profile', 'Hồ sơ')}</span>
        </button>
      )}

      <button
        onClick={() => isMuted ? onUnmute() : onMute()}
        disabled={isMuting}
        className={`flex flex-col items-center gap-1.5 p-2 group w-16 ${isMuted ? 'text-on-surface' : 'text-on-surface-variant'}`}
        aria-label={isMuted ? t('chat.unmuteNotifications', 'Bỏ tắt thông báo') : t('chat.muteNotifications', 'Tắt thông báo')}
        title={isMuted ? t('chat.unmuteNotifications', 'Bỏ tắt thông báo') : t('chat.muteNotifications', 'Tắt thông báo')}
      >
        <div className={`w-9 h-9 rounded-full bg-surface-container flex items-center justify-center group-hover:bg-surface-container-high transition-colors ${isMuted ? 'bg-surface-container-highest' : ''}`}>
          <Icon name={isMuted ? 'notifications_off' : 'notifications'} size={20} />
        </div>
        <span className="text-[11px] font-medium">{isMuted ? t('chat.unmuteShort', 'Bỏ tắt') : t('chat.muteShort', 'Tắt TB')}</span>
      </button>

      {isGroup && (
        <button
          onClick={onAddMember}
          className="flex flex-col items-center gap-1.5 p-2 group text-on-surface-variant w-16"
        >
          <div className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center group-hover:bg-surface-container-high transition-colors">
            <Icon name="person_add" size={20} />
          </div>
          <span className="text-[11px] font-medium">{t('chat.addMemberShort', 'Thêm')}</span>
        </button>
      )}

      <button
        onClick={onOpenSearch}
        className="flex flex-col items-center gap-1.5 p-2 group text-on-surface-variant w-16"
      >
        <div className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center group-hover:bg-surface-container-high transition-colors">
          <Icon name="search" size={20} />
        </div>
        <span className="text-[11px] font-medium">{t('chat.search', 'Tìm kiếm')}</span>
      </button>
    </div>
  );
};
