import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AvatarUpload } from '@/shared/components/common/AvatarUpload';

interface InfoPanelHeaderProps {
  title: string;
  avatarUrl?: string;
  isGroup: boolean;
  isLeader: boolean;
  participantsCount: number;
  onUpdateTitle: (title: string) => void;
  onUpdateAvatar: (url: string) => void;
}

export function InfoPanelHeader({
  title,
  avatarUrl,
  isGroup,
  isLeader,
  participantsCount,
  onUpdateTitle,
  onUpdateAvatar,
}: InfoPanelHeaderProps) {
  const { t } = useTranslation();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState(title || '');

  useEffect(() => {
    if (!isEditingTitle) setNewTitle(title);
  }, [title, isEditingTitle]);

  const handleSave = () => {
    const trimmed = newTitle.trim();
    if (!trimmed) {
      setNewTitle(title);
      setIsEditingTitle(false);
      return;
    }
    if (trimmed !== title) {
      onUpdateTitle(trimmed);
    }
    setIsEditingTitle(false);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <AvatarUpload
        currentUrl={avatarUrl}
        nameFallback={title}
        isGroup={isGroup}
        canEdit={isGroup && isLeader}
        onUploadSuccess={onUpdateAvatar}
      />
      <div className="text-center w-full">
        {isEditingTitle && isGroup ? (
          <div className="flex items-center gap-2 mt-2">
            <input
              autoFocus
              className="flex-1 bg-surface-container rounded-xl px-3 py-1.5 text-sm text-on-surface border border-outline-variant focus:outline-none focus:ring-1 focus:ring-on-surface"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Escape') setIsEditingTitle(false);
                if (e.key === 'Enter') handleSave();
              }}
            />
            <button 
              onClick={handleSave} 
              className="px-3 py-1.5 text-xs bg-on-surface text-surface rounded-lg font-medium"
            >
              {t('common.save', 'Lưu')}
            </button>
          </div>
        ) : (
          <div className="relative inline-flex items-center justify-center group max-w-full">
            <h2 className="font-headline-sm font-bold text-on-surface text-center truncate px-2">
              {title}
            </h2>
            {isGroup && isLeader && (
              <button 
                onClick={() => setIsEditingTitle(true)} 
                className="absolute -right-6 opacity-0 group-hover:opacity-100 text-on-surface-variant hover:text-on-surface transition-opacity flex items-center justify-center w-6 h-6"
              >
                <span className="material-symbols-outlined text-[16px]">edit</span>
              </button>
            )}
          </div>
        )}
        {/* Removed member count text */}
      </div>
    </div>
  );
};
