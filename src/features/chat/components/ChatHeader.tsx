import { useTranslation } from 'react-i18next';
import { useToast } from '@/contexts/ToastContext';
import { IconButton } from '@/shared/components/ui/IconButton';

interface ChatHeaderProps {
  chatTitle: string;
  avatarUrl?: string | null;
  isGroup: boolean;
  isOnline: boolean;
  onlineLabel: string;
  isInfoOpen: boolean;
  onToggleInfo: () => void;
}

export function ChatHeader({
  chatTitle,
  avatarUrl,
  isGroup,
  isOnline,
  onlineLabel,
  isInfoOpen,
  onToggleInfo,
}: ChatHeaderProps) {
  const { t } = useTranslation();
  const { toast } = useToast();

  const handleMockCall = (type: 'voice' | 'video') => {
    const featureName = type === 'voice' ? t('chat.voiceCall', 'Cuộc gọi thoại') : t('chat.videoCall', 'Cuộc gọi video');
    toast({ message: t('common.featureInDevelopment', { feature: featureName }), type: 'development' });
  };
  return (
    <header className="h-16 w-full flex items-center justify-between px-6 border-b border-outline-variant/30 bg-surface/80 backdrop-blur-xl z-30 shrink-0 sticky top-0">
      <div className="flex items-center gap-3">
        {/* Avatar Header */}
        <div className="w-10 h-10 rounded-full bg-surface-container-highest border border-outline-variant/50 flex items-center justify-center text-on-surface-variant overflow-hidden shrink-0 shadow-sm">
          {avatarUrl ? (
            <img alt={chatTitle} className="w-full h-full object-cover" src={avatarUrl} />
          ) : isGroup ? (
            <span className="material-symbols-outlined text-[20px]">group</span>
          ) : (
            <span className="font-bold text-sm">{chatTitle.charAt(0).toUpperCase()}</span>
          )}
        </div>
        
        <div className="flex flex-col">
          <span className="font-headline-sm text-[16px] font-semibold text-on-surface leading-tight">{chatTitle}</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-surface-container-high'}`}></span>
            <span className="font-mono-label text-[12px] text-on-surface-variant">{onlineLabel}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <IconButton
          icon="call"
          variant="ghost"
          title={t('chat.voiceCall', 'Cuộc gọi thoại')}
          onClick={() => handleMockCall('voice')}
          className="text-on-surface-variant hover:text-on-surface"
        />
        <IconButton
          icon="videocam"
          variant="ghost"
          title={t('chat.videoCall', 'Cuộc gọi video')}
          onClick={() => handleMockCall('video')}
          className="text-on-surface-variant hover:text-on-surface"
        />
        
        <div className="w-[1px] h-5 bg-outline-variant/50 mx-1"></div>
        
        <IconButton
          icon="info"
          variant="ghost"
          onClick={onToggleInfo}
          className={isInfoOpen ? 'bg-surface-container-highest text-on-surface' : 'text-on-surface-variant hover:text-on-surface'}
        />
      </div>
    </header>
  );
};
