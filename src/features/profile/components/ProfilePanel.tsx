import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import { userApi } from '@/shared/services/userApi';
import { useAuthStore } from '@/stores/auth.store';
import { UserAvatar } from '@/shared/components/common/UserAvatar';
import { useFriendActions } from '@/features/friends/hooks/useFriendActions';
import { useFriendshipStatus } from '@/features/friends/hooks/useFriendshipStatus';
import { useBlockList, useBlockUser, useUnblockUser } from '@/features/settings/hooks/useBlock';
import { useDialog } from '@/contexts/DialogContext';
import { useToast } from '@/contexts/ToastContext';
import { useProfilePanelStore } from '@/stores/profilePanel.store';
import { useTranslation } from 'react-i18next';
import { usePresenceStore } from '@/stores/presence.store';

interface ProfilePanelProps {
  onStartChat?: (conversationId: string) => void;
}

export function ProfilePanel({ onStartChat }: ProfilePanelProps) {
  const { t, i18n } = useTranslation();
  const { isOpen, handle, closeProfile } = useProfilePanelStore();
  
  const normalizedHandle = handle?.startsWith('@') ? handle.slice(1) : handle;
  
  const currentUser = useAuthStore(state => state.user);
  const isMe = currentUser?.handle === normalizedHandle;
  
  const [isEditing, setIsEditing] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsEditing(false);
    setIsMenuOpen(false);
  }, [handle]);

  const { startDirectChat, sendRequest, cancelRequest, respondRequest, unfriend } = useFriendActions();
  const { getFriendshipStatus } = useFriendshipStatus();
  const { data: blockedList } = useBlockList();
  const { mutate: blockUser } = useBlockUser();
  const { mutate: unblockUser } = useUnblockUser();
  const { confirm } = useDialog();
  const { toast } = useToast();

  const { data: userResponse, isLoading, error } = useQuery({
    queryKey: ['profile', normalizedHandle],
    queryFn: () => userApi.getUserByHandle(normalizedHandle!),
    enabled: !!normalizedHandle && isOpen
  });

  const user = userResponse as any;


  const isOnline = usePresenceStore(s => s.onlineUsers.has(user?.id ?? ''));


  const handleMessage = () => {
    if (!user) return;
    startDirectChat.mutate(user.id, {
      onSuccess: (response) => {
        if (response?.data?.id && onStartChat) {
          onStartChat(response.data.id);
        }
        closeProfile();
      }
    });
  };

  if (!isOpen) return null;

  // Render modal content helper
  const renderModal = (content: React.ReactNode) => {
    return createPortal(
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeProfile} />
        <div className="relative w-full max-w-[540px] bg-surface-container-lowest rounded-[32px] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200" style={{ maxHeight: 'min(750px, 90vh)' }}>
          {content}
        </div>
      </div>,
      document.body
    );
  };

  if (isLoading) {
    return renderModal(
      <>
        <div className="h-16 px-4 border-b border-outline-variant flex items-center justify-between shrink-0 bg-surface">
          <h2 className="font-headline-sm font-semibold text-on-surface">{t('profile.title', 'Hồ sơ')}</h2>
          <button onClick={closeProfile} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-container-high transition-colors text-on-surface-variant">
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>
        <div className="p-6 text-on-surface-variant flex flex-1 items-center justify-center">{t('common.loading', 'Đang tải...')}</div>
      </>
    );
  }

  if (error || !user) {
    return renderModal(
      <>
        <div className="h-16 px-4 border-b border-outline-variant flex items-center justify-between shrink-0 bg-surface">
          <h2 className="font-headline-sm font-semibold text-on-surface">{t('profile.title', 'Hồ sơ')}</h2>
          <button onClick={closeProfile} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-container-high transition-colors text-on-surface-variant">
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>
        <div className="p-6 text-error text-center flex-1 flex items-center justify-center">{t('profile.notFound', 'Không tìm thấy người dùng')}</div>
      </>
    );
  }

  const { status, requestId } = getFriendshipStatus(user.id);
  const isBlocked = blockedList?.some(u => u.id === user.id);

  const handleToggleBlock = async () => {
    if (isBlocked) {
      if (await confirm({ title: t('profile.unblockTitle', 'Unblock User'), message: t('profile.unblockConfirm', 'Are you sure you want to unblock this user?', { name: user.displayName || user.handle }) })) {
        unblockUser(user.id, {
          onSuccess: () => toast({ message: t('profile.unblockSuccess', 'User unblocked successfully.'), type: 'success' }),
          onError: () => toast({ message: t('profile.unblockFailed', 'Failed to unblock user.'), type: 'error' })
        });
      }
    } else {
      if (await confirm({ title: t('profile.blockTitle', 'Block User'), message: t('profile.blockConfirm', 'Are you sure you want to block this user?', { name: user.displayName || user.handle }), type: 'warning' })) {
        blockUser(user.id, {
          onSuccess: () => toast({ message: t('profile.blockSuccess', 'User blocked successfully.'), type: 'success' }),
          onError: () => toast({ message: t('profile.blockFailed', 'Failed to block user.'), type: 'error' })
        });
      }
    }
  };

  return renderModal(
    <>
      <div className="h-[68px] px-5 border-b border-outline-variant/30 flex items-center justify-between shrink-0 bg-surface/80 backdrop-blur-md absolute top-0 w-full z-20">
        <h2 className="font-headline-sm font-semibold text-on-surface">
            {isEditing ? t('profile.edit', 'Chỉnh sửa hồ sơ') : t('profile.title', 'Hồ sơ người dùng')}
          </h2>
          <button 
            onClick={closeProfile}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-container-high transition-colors text-on-surface-variant"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto bg-surface-container-lowest pt-[68px]">
          <div className="h-48 w-full relative shrink-0">
            {user.coverUrl ? (
              <img src={user.coverUrl} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-primary/20 via-secondary/20 to-tertiary/20" />
            )}
          </div>

          <div className="relative px-8 flex justify-between items-end mb-5 -mt-16 shrink-0">
            <div className="relative z-10">
              <UserAvatar 
                user={user as any} 
                size="2xl" 
                className="!w-32 !h-32 border-[6px] border-surface-container-lowest bg-surface-container-high shadow-sm" 
              />
              {isOnline && (
                <span className="absolute bottom-2 right-2 w-6 h-6 bg-secondary border-[4px] border-surface-container-lowest rounded-full z-10 shadow-sm" />
              )}
            </div>
            
            <div className="pb-2 flex items-center gap-2">
              {isMe ? (
                <button 
                  onClick={() => setIsEditing(!isEditing)} 
                  className="px-5 py-2 rounded-full border border-outline text-on-surface hover:bg-surface-variant transition-colors text-sm font-semibold shadow-sm"
                >
                  {isEditing ? t('common.cancel', 'Hủy') : t('profile.edit', 'Sửa')}
                </button>
              ) : (
                <>
                  {status === 'friends' && (
                    <button 
                      onClick={handleMessage}
                      className="w-10 h-10 rounded-full bg-surface-container-high text-on-surface hover:bg-surface-variant transition-colors flex items-center justify-center border border-outline-variant shadow-sm"
                      title={t('profile.message', 'Nhắn tin')}
                    >
                      <span className="material-symbols-outlined text-[20px]">chat</span>
                    </button>
                  )}
                  
                  <div className="relative">
                    <button 
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                      className="min-w-[140px] h-10 px-4 rounded-full border border-outline-variant bg-surface text-on-surface hover:bg-surface-variant transition-colors text-sm font-semibold shadow-sm flex items-center justify-between gap-1.5"
                    >
                      <div className="flex items-center gap-1.5 justify-center flex-1">
                        {status === 'friends' && <><span className="material-symbols-outlined text-[16px] text-secondary">check</span> {t('friends.friends', 'Bạn bè')}</>}
                        {status === 'none' && <><span className="material-symbols-outlined text-[16px]">person_add</span> {t('friends.addFriend', 'Kết bạn')}</>}
                        {status === 'sent' && <><span className="material-symbols-outlined text-[16px]">schedule</span> {t('friends.sent', 'Đã gửi')}</>}
                        {status === 'received' && <><span className="material-symbols-outlined text-[16px]">inbox</span> {t('friends.received', 'Đã nhận')}</>}
                      </div>
                      <span className="material-symbols-outlined text-[18px]">expand_more</span>
                    </button>

                    {isMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
                        <div className="absolute right-0 top-12 w-[220px] bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200 p-1.5 flex flex-col gap-0.5">
                          {status === 'friends' && (
                            <button onClick={() => { unfriend.mutate(user.id); setIsMenuOpen(false); }} className="w-full text-left px-3 py-2.5 text-sm font-medium rounded-xl text-error hover:bg-error/10 transition-colors flex items-center gap-3">
                              <span className="material-symbols-outlined text-[20px]">person_remove</span> {t('friends.unfriend', 'Hủy kết bạn')}
                            </button>
                          )}
                          {status === 'none' && (
                            <button onClick={() => { sendRequest.mutate(user.id); setIsMenuOpen(false); }} className="w-full text-left px-3 py-2.5 text-sm font-medium rounded-xl text-on-surface hover:bg-surface-variant transition-colors flex items-center gap-3">
                              <span className="material-symbols-outlined text-[20px]">person_add</span> {t('friends.addFriend', 'Thêm bạn bè')}
                            </button>
                          )}
                          {status === 'sent' && (
                            <button onClick={() => { requestId && cancelRequest.mutate(requestId); setIsMenuOpen(false); }} className="w-full text-left px-3 py-2.5 text-sm font-medium rounded-xl text-on-surface hover:bg-error/10 hover:text-error transition-colors flex items-center gap-3">
                              <span className="material-symbols-outlined text-[20px]">close</span> {t('friends.cancelRequest', 'Hủy lời mời')}
                            </button>
                          )}
                          {status === 'received' && (
                            <>
                              <button onClick={() => { requestId && respondRequest.mutate({ id: requestId, action: 'accepted' }); setIsMenuOpen(false); }} className="w-full text-left px-3 py-2.5 text-sm font-medium rounded-xl text-on-surface hover:bg-surface-variant transition-colors flex items-center gap-3">
                                <span className="material-symbols-outlined text-[20px] text-secondary">check</span> {t('friends.accept', 'Chấp nhận')}
                              </button>
                              <button onClick={() => { requestId && respondRequest.mutate({ id: requestId, action: 'rejected' }); setIsMenuOpen(false); }} className="w-full text-left px-3 py-2.5 text-sm font-medium rounded-xl text-on-surface hover:bg-error/10 hover:text-error transition-colors flex items-center gap-3">
                                <span className="material-symbols-outlined text-[20px]">close</span> {t('friends.reject', 'Từ chối')}
                              </button>
                            </>
                          )}
                          
                          <div className="h-[1px] w-auto bg-outline-variant/30 my-1 mx-2" />
                          
                          <button onClick={() => { handleToggleBlock(); setIsMenuOpen(false); }} className="w-full text-left px-3 py-2.5 text-sm font-medium rounded-xl text-error hover:bg-error/10 transition-colors flex items-center gap-3">
                            <span className="material-symbols-outlined text-[20px]">{isBlocked ? 'no_accounts' : 'block'}</span>
                            {isBlocked ? t('profile.unblockTitle', 'Bỏ chặn người dùng') : t('profile.blockTitle', 'Chặn người dùng')}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="px-8 flex flex-col items-start text-left w-full mb-8">
            <h1 className="text-3xl font-bold text-on-surface leading-tight tracking-tight">
              {user.displayName || user.handle}
            </h1>
            <p className="text-on-surface-variant/80 text-[17px] font-medium mt-1">@{user.handle}</p>

            {user.bio ? (
              <p className="mt-4 text-on-surface text-sm leading-relaxed whitespace-pre-wrap">
                {user.bio}
              </p>
            ) : (
              <p className="mt-4 text-on-surface-variant/60 italic text-sm">
                {t('profile.noBio', 'Chưa có tiểu sử')}
              </p>
            )}

            <div className="flex flex-wrap gap-x-5 gap-y-3 mt-6 text-[13px] text-on-surface-variant w-full">
              {user.location && (
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] opacity-70">location_on</span>
                  <span>{user.location}</span>
                </div>
              )}
              {user.website && (
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] opacity-70">link</span>
                  <a href={user.website} target="_blank" rel="noreferrer" className="text-on-surface hover:underline truncate max-w-[150px]">
                    {user.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] opacity-70">calendar_month</span>
                <span>
                  {t('profile.joined', { date: new Date(user.createdAt || Date.now()).toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US', { month: 'long', year: 'numeric' }) })}
                </span>
              </div>
            </div>
          </div>

          {isEditing && isMe && (
            <div className="px-8 pb-8 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="bg-surface-container rounded-2xl p-5 border border-outline-variant text-sm text-on-surface-variant flex flex-col items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[32px] opacity-50 mb-1">settings</span>
                <p>{t('profile.editProfileHint1', 'Để chỉnh sửa hồ sơ chi tiết')}</p>
                <p dangerouslySetInnerHTML={{ __html: t('profile.editProfileHint2', 'Vui lòng truy cập phần <b>Cài đặt &gt; Tài khoản</b>') }}></p>
              </div>
            </div>
          )}
        </div>
    </>
  );
};
