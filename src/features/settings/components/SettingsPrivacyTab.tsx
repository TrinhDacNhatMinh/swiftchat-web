import { useTranslation } from 'react-i18next';
import { useBlockList, useUnblockUser } from '@/features/settings/hooks/useBlock';
import { UserAvatar } from '@/shared/components/common/UserAvatar';
import { useDialog } from '@/contexts/DialogContext';

export function SettingsPrivacyTab() {
  const { t } = useTranslation();
  const { confirm } = useDialog();
  const { data: blockList, isLoading } = useBlockList();
  const { mutate: unblockUser, isPending: isUnblocking } = useUnblockUser();

  const handleUnblock = async (targetId: string) => {
    if (await confirm({
      title: t('common.confirmTitle', 'Xác nhận'),
      message: t('chat.unblockConfirm', 'Bạn có chắc chắn muốn bỏ chặn người dùng này?'),
      type: 'warning'
    })) {
      unblockUser(targetId);
    }
  };

  return (
    <div className="space-y-6">
      <section>
        <h4 className="text-[11px] font-bold uppercase tracking-widest mb-4 text-on-surface-variant/50">
          {t('settings.blockedUsers', 'Người dùng đã chặn')}
        </h4>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 animate-pulse bg-surface-container rounded-2xl">
                <div className="w-10 h-10 rounded-full bg-surface-container-high flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-surface-container-high rounded-full w-28" />
                  <div className="h-2.5 bg-surface-container-high rounded-full w-20" />
                </div>
                <div className="w-20 h-8 rounded-xl bg-surface-container-high" />
              </div>
            ))}
          </div>
        ) : !blockList || blockList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-on-surface-variant">
            <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[36px] opacity-40">block</span>
            </div>
            <p className="text-sm font-semibold text-on-surface mb-1">{t('settings.emptyList', 'Danh sách trống')}</p>
            <p className="text-[13px] text-on-surface-variant/60 text-center max-w-[200px]">
              {t('settings.noBlockedUsers', 'Chưa có người dùng nào bị chặn.')}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {blockList.map((blocked) => {
              const user = {
                id: blocked.id,
                displayName: blocked.displayName ?? '',
                handle: blocked.handle ?? '',
                avatarUrl: blocked.avatarUrl,
                isOnline: false,
                lastSeen: new Date().toISOString()
              };
              return (
                <div
                  key={blocked.id}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-surface-container transition-colors group"
                >
                  <UserAvatar user={user} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-on-surface truncate">{user.displayName || user.handle}</p>
                    <p className="text-[13px] text-on-surface-variant/70">@{user.handle}</p>
                  </div>
                  <button
                    onClick={() => handleUnblock(blocked.id)}
                    disabled={isUnblocking}
                    className="opacity-0 group-hover:opacity-100 px-3.5 py-1.5 rounded-xl bg-surface-container-highest hover:bg-surface-variant text-on-surface text-[13px] font-semibold transition-all disabled:opacity-50 border border-outline-variant/40"
                  >
                    {t('chat.unblockUser', 'Bỏ chặn')}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
