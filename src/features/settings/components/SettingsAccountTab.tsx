import { type FC } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSettings } from '@/features/settings/hooks/useSettings';
import { useUpdateProfile } from '@/features/settings/hooks/useUpdateProfile';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/auth.store';
import { useToast } from '@/contexts/ToastContext';
import { AvatarUpload } from '@/shared/components/common/AvatarUpload';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

const profileSchema = z.object({
  displayName: z.string().min(2, 'Display name is too short').max(50, 'Display name is too long'),
  handle: z.string().min(3, 'Handle is too short').max(30, 'Handle is too long').regex(/^[a-zA-Z0-9_]+$/, 'Handle can only contain letters, numbers, and underscores'),
  bio: z.string().max(160, 'Bio is too long').optional(),
  location: z.string().max(30, 'Location is too long').optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
});

type ProfileFormData = z.infer<typeof profileSchema>;

// Reusable form input component
const FormField: FC<{
  label: string;
  error?: string;
  children: React.ReactNode;
  hint?: string;
}> = ({ label, error, children, hint }) => (
  <div className="space-y-1.5">
    <label className="block text-[13px] font-semibold text-on-surface-variant">
      {label}
    </label>
    {children}
    {hint && !error && <p className="text-[12px] text-on-surface-variant/60">{hint}</p>}
    {error && <p className="text-[12px] text-error font-medium">{error}</p>}
  </div>
);

// Reusable input style
const inputCls = "w-full bg-surface-container-highest border border-outline-variant/70 rounded-2xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary focus:bg-surface-container focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant/40";

const SectionTitle: FC<{ children: React.ReactNode; danger?: boolean }> = ({ children, danger }) => (
  <h4 className={`text-[11px] font-bold uppercase tracking-widest mb-4 ${danger ? 'text-error/70' : 'text-on-surface-variant/50'}`}>
    {children}
  </h4>
);

export function SettingsAccountTab() {
  const { t } = useTranslation();
  const { changePassword } = useSettings();
  const { mutate: updateProfile, isPending: isUpdatingProfile } = useUpdateProfile();
  const { user, logout } = useAuthStore();
  const { toast } = useToast();

  const { register: registerPwd, handleSubmit: handlePwdSubmit, reset: resetPwd, formState: { errors: pwdErrors } } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const { register: registerProfile, handleSubmit: handleProfileSubmit, formState: { errors: profileErrors } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: user?.displayName || '',
      handle: user?.handle || '',
      bio: user?.bio || '',
      location: user?.location || '',
      website: user?.website || '',
    }
  });

  const onPwdSubmit = (data: PasswordFormData) => {
    changePassword.mutate(
      { currentPassword: data.currentPassword, newPassword: data.newPassword },
      {
        onSuccess: () => {
          resetPwd();
          toast({ message: t('settings.passwordChanged', 'Thay đổi mật khẩu thành công'), type: 'success' });
        },
        onError: () => {
          toast({ message: t('settings.passwordChangeFailed', 'Không thể thay đổi mật khẩu'), type: 'error' });
        }
      }
    );
  };

  const onProfileSubmit = (data: ProfileFormData) => {
    const payload: Record<string, string | undefined> = {};
    if (data.displayName !== user?.displayName) payload.displayName = data.displayName;
    if (data.handle !== user?.handle) payload.handle = data.handle;
    if (data.bio !== (user?.bio || '')) payload.bio = data.bio || undefined;
    if (data.location !== (user?.location || '')) payload.location = data.location || undefined;
    if (data.website !== (user?.website || '')) payload.website = data.website || undefined;

    if (Object.keys(payload).length === 0) {
      toast({ message: t('settings.profileUpdated', 'Cập nhật hồ sơ thành công'), type: 'success' });
      return;
    }

    updateProfile(
      payload,
      {
        onSuccess: () => {
          toast({ message: t('settings.profileUpdated', 'Cập nhật hồ sơ thành công'), type: 'success' });
        },
        onError: (error: any) => {
          const backendMsg = error?.response?.data?.message || error?.message;
          const msg = Array.isArray(backendMsg) ? backendMsg[0] : backendMsg;
          toast({ message: msg || t('settings.profileUpdateFailed', 'Không thể cập nhật hồ sơ.'), type: 'error' });
        }
      }
    );
  };

  const handleAvatarUpload = (url: string) => {
    updateProfile(
      { avatarUrl: url },
      {
        onSuccess: () => {
          toast({ message: t('settings.profileUpdated', 'Cập nhật hồ sơ thành công'), type: 'success' });
        },
        onError: () => {
          toast({ message: t('settings.profileUpdateFailed', 'Không thể cập nhật hồ sơ.'), type: 'error' });
        }
      }
    );
  };

  return (
    <div className="space-y-8">
      {/* Profile Section */}
      <section>
        <SectionTitle>{t('settings.profile', 'Hồ sơ')}</SectionTitle>

        {/* Avatar */}
        <div className="flex items-center gap-4 p-4 bg-surface-container rounded-2xl border border-outline-variant/30 mb-6">
          <AvatarUpload
            currentUrl={user?.avatarUrl}
            nameFallback={user?.displayName || user?.handle}
            onUploadSuccess={handleAvatarUpload}
          />
          <div>
            <p className="text-sm font-semibold text-on-surface">{user?.displayName || user?.handle}</p>
            <p className="text-[13px] text-on-surface-variant/70">@{user?.handle}</p>
          </div>
        </div>

        <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label={t('settings.displayName', 'Tên hiển thị')}
              error={profileErrors.displayName?.message}
            >
              <input {...registerProfile('displayName')} className={inputCls} />
            </FormField>
            <FormField
              label={t('settings.handle', 'Tên người dùng')}
              error={profileErrors.handle?.message}
            >
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-sm select-none">@</span>
                <input {...registerProfile('handle')} className={`${inputCls} pl-7`} />
              </div>
            </FormField>
          </div>

          <FormField
            label={t('settings.bio', 'Tiểu sử')}
            error={profileErrors.bio?.message}
          >
            <textarea
              {...registerProfile('bio')}
              rows={3}
              className={`${inputCls} resize-none`}
              placeholder={t('settings.bioPlaceholder', 'Giới thiệu bản thân...')}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label={t('settings.location', 'Vị trí')}
              error={profileErrors.location?.message}
            >
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant/40">location_on</span>
                <input {...registerProfile('location')} className={`${inputCls} pl-10`} placeholder="Hà Nội, Việt Nam" />
              </div>
            </FormField>
            <FormField
              label={t('settings.website', 'Trang web')}
              error={profileErrors.website?.message}
            >
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant/40">link</span>
                <input {...registerProfile('website')} className={`${inputCls} pl-10`} placeholder="https://" />
              </div>
            </FormField>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="flex items-center gap-2 py-2.5 px-6 rounded-2xl bg-on-surface text-surface hover:opacity-80 active:scale-[0.98] transition-all font-semibold text-sm disabled:opacity-40 shadow-sm"
            >
              {isUpdatingProfile ? (
                <>
                  <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                  {t('settings.updating', 'Đang lưu...')}
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px] fill">save</span>
                  {t('settings.saveProfile', 'Lưu hồ sơ')}
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      <div className="border-t border-outline-variant/30" />

      {/* Security Section */}
      <section>
        <SectionTitle>{t('settings.security', 'Bảo mật')}</SectionTitle>
        <form onSubmit={handlePwdSubmit(onPwdSubmit)} className="space-y-4">
          <FormField
            label={t('settings.currentPassword', 'Mật khẩu hiện tại')}
            error={pwdErrors.currentPassword?.message}
          >
            <input
              id="currentPassword"
              type="password"
              {...registerPwd('currentPassword')}
              className={inputCls}
              placeholder="••••••••"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label={t('settings.newPassword', 'Mật khẩu mới')}
              error={pwdErrors.newPassword?.message}
            >
              <input
                id="newPassword"
                type="password"
                {...registerPwd('newPassword')}
                className={inputCls}
                placeholder="••••••••"
              />
            </FormField>
            <FormField
              label={t('settings.confirmPassword', 'Xác nhận mật khẩu')}
              error={pwdErrors.confirmPassword?.message}
            >
              <input
                id="confirmPassword"
                type="password"
                {...registerPwd('confirmPassword')}
                className={inputCls}
                placeholder="••••••••"
              />
            </FormField>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={changePassword.isPending}
              className="flex items-center gap-2 py-2.5 px-6 rounded-2xl bg-surface-container-high text-on-surface hover:bg-surface-container-highest active:scale-[0.98] transition-all font-semibold text-sm border border-outline-variant/50 disabled:opacity-40"
            >
              {changePassword.isPending ? (
                <>
                  <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                  {t('settings.updating', 'Đang cập nhật...')}
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">lock_reset</span>
                  {t('settings.updatePassword', 'Cập nhật mật khẩu')}
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      <div className="border-t border-outline-variant/30" />

      {/* Logout */}
      <section className="flex justify-center pt-4 pb-8">
        <button
          onClick={logout}
          className="flex items-center gap-2 py-2 px-4 rounded-xl bg-error/10 text-error hover:bg-error/20 active:scale-[0.98] transition-all font-semibold text-sm border border-error/20"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          {t('settings.logout', 'Đăng xuất')}
        </button>
      </section>
    </div>
  );
};
