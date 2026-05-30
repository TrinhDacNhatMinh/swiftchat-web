import { useTranslation } from 'react-i18next';
import { Icon } from '@/shared/components/ui/Icon';

interface InfoPanelSettingsProps {
  isGroup: boolean;
  isLeader: boolean;
  isBlocked: boolean;
  isBlocking: boolean;
  isDeleting: boolean;
  isLeaving: boolean;
  participantsCount: number;
  onOpenMembers: () => void;
  onLeave: () => void;
  onDisband: () => void;
  onBlockToggle: () => void;
  onDelete: () => void;
  onMockAction?: (actionName: string) => void;
  partnerName?: string;
  onCreateGroup?: () => void;
}

export function InfoPanelSettings({
  isGroup,
  isLeader,
  isBlocked,
  isBlocking,
  isDeleting,
  isLeaving,
  participantsCount,
  onOpenMembers,
  onLeave,
  onDisband,
  onBlockToggle,
  onDelete,
  onMockAction,
  partnerName,
  onCreateGroup,
}: InfoPanelSettingsProps) {
  const { t } = useTranslation();

  const handleMockAction = (actionName: string) => {
    onMockAction?.(actionName);
  };

  return (
    <div className="pt-4">
      {/* Chung cho cả nhóm và chat 1-1 */}
      <button
        onClick={() => handleMockAction(t('chat.pinnedMessages', 'Tin nhắn đã ghim'))}
        className="w-full flex items-center gap-3 p-3 text-on-surface hover:bg-surface-container transition-colors rounded-xl mb-1"
      >
        <Icon name="push_pin" size={20} className="text-on-surface-variant" />
        <span className="font-medium text-sm flex-1 text-left">{t('chat.pinnedMessages', 'Tin nhắn đã ghim')}</span>
      </button>

      <button
        onClick={() => handleMockAction(t('chat.photosAndVideos', 'Ảnh / Video'))}
        className="w-full flex items-center gap-3 p-3 text-on-surface hover:bg-surface-container transition-colors rounded-xl mb-1"
      >
        <Icon name="photo_library" size={20} className="text-on-surface-variant" />
        <span className="font-medium text-sm flex-1 text-left">{t('chat.photosAndVideos', 'Ảnh / Video')}</span>
      </button>

      {/* Dành riêng cho nhóm */}
      {isGroup ? (
        <>
          <button
            onClick={onOpenMembers}
            className="w-full flex items-center gap-3 p-3 text-on-surface hover:bg-surface-container transition-colors rounded-xl mb-1"
          >
            <Icon name="group" size={20} className="text-on-surface-variant" />
            <span className="flex-1 text-left font-medium text-sm">{t('chat.members', 'Thành viên')}</span>
            <span className="text-on-surface-variant font-medium text-sm">{participantsCount}</span>
          </button>
          
          {isLeader ? (
            <button
              onClick={onDelete}
              disabled={isDeleting}
              className="w-full flex items-center gap-3 p-3 text-error hover:bg-surface-container transition-colors rounded-xl mb-1"
            >
              <Icon name="delete_forever" size={20} />
              <span className="font-medium text-sm flex-1 text-left">{isDeleting ? t('common.loading', 'Đang thực hiện...') : t('chat.deleteConversation', 'Xóa đoạn chat')}</span>
            </button>
          ) : (
            <button
              onClick={onLeave}
              disabled={isLeaving}
              className="w-full flex items-center gap-3 p-3 text-error hover:bg-surface-container transition-colors rounded-xl mb-1"
            >
              <Icon name="logout" size={20} />
              <span className="font-medium text-sm flex-1 text-left">{isLeaving ? t('common.loading', 'Đang thực hiện...') : t('chat.leaveGroup', 'Rời nhóm')}</span>
            </button>
          )}
        </>
      ) : (
        /* Dành riêng cho chat 1-1 */
        <>
          {onCreateGroup && (
            <button
              onClick={onCreateGroup}
              className="w-full flex items-center gap-3 p-3 text-on-surface hover:bg-surface-container transition-colors rounded-xl mb-1"
            >
              <Icon name="group_add" size={20} className="text-on-surface-variant" />
              <span className="font-medium text-sm flex-1 text-left">{t('chat.createGroupWith', { name: partnerName || t('chat.otherPerson', 'Người khác') })}</span>
            </button>
          )}

          <button
            onClick={onBlockToggle}
            disabled={isBlocking}
            className="w-full flex items-center gap-3 p-3 text-error hover:bg-surface-container transition-colors rounded-xl mb-1"
          >
            <Icon name={isBlocked ? 'lock_open' : 'block'} size={20} />
            <span className="font-medium text-sm flex-1 text-left">
              {isBlocking
                ? t('common.loading', 'Đang thực hiện...') 
                : isBlocked 
                  ? t('chat.unblockUser', 'Bỏ chặn') 
                  : t('chat.blockUser', 'Chặn người dùng')}
            </span>
          </button>
          
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="w-full flex items-center gap-3 p-3 text-error hover:bg-surface-container transition-colors rounded-xl mb-1"
          >
            <Icon name="delete" size={20} />
            <span className="font-medium text-sm flex-1 text-left">{isDeleting ? t('common.loading', 'Đang thực hiện...') : t('chat.deleteConversation', 'Xóa đoạn chat')}</span>
          </button>
        </>
      )}
    </div>
  );
};
