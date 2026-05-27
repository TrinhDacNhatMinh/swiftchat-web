import { type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useThemeStore } from '@/stores/theme.store';

const SectionTitle: FC<{ children: React.ReactNode }> = ({ children }) => (
  <h4 className="text-[11px] font-bold uppercase tracking-widest mb-4 text-on-surface-variant/50">
    {children}
  </h4>
);

export function SettingsAppearanceTab() {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useThemeStore();

  return (
    <div className="space-y-8">

      {/* Theme */}
      <section>
        <SectionTitle>{t('settings.theme', 'Giao diện')}</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          {/* Light Mode Card */}
          <button
            onClick={() => setTheme('light')}
            className={`relative flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all active:scale-[0.98]
              ${theme === 'light'
                ? 'border-on-surface bg-surface-container'
                : 'border-outline-variant/50 bg-surface-container-high hover:bg-surface-container-highest'
              }`}
          >
            {/* Preview mockup */}
            <div className="w-full h-16 rounded-xl bg-white border border-black/10 overflow-hidden flex flex-col">
              <div className="h-3 bg-gray-100 border-b border-gray-200 flex items-center px-1.5 gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                <div className="w-6 h-1 rounded-full bg-gray-200" />
              </div>
              <div className="flex flex-1 p-1 gap-1">
                <div className="w-4 rounded bg-gray-100" />
                <div className="flex-1 space-y-1 pt-0.5">
                  <div className="h-1.5 w-3/4 rounded-full bg-gray-200" />
                  <div className="h-1.5 w-1/2 rounded-full bg-gray-200" />
                </div>
              </div>
            </div>
            <span className="text-sm font-semibold text-on-surface">{t('settings.themeLight', 'Sáng')}</span>
            {theme === 'light' && (
              <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-on-surface flex items-center justify-center">
                <span className="material-symbols-outlined fill text-[13px] text-surface">check</span>
              </div>
            )}
          </button>

          {/* Dark Mode Card */}
          <button
            onClick={() => setTheme('dark')}
            className={`relative flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all active:scale-[0.98]
              ${theme === 'dark'
                ? 'border-on-surface/30 bg-surface-container'
                : 'border-outline-variant/50 bg-surface-container-high hover:bg-surface-container-highest'
              }`}
          >
            {/* Preview mockup */}
            <div className="w-full h-16 rounded-xl bg-black border border-white/10 overflow-hidden flex flex-col">
              <div className="h-3 bg-[#111] border-b border-white/5 flex items-center px-1.5 gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-[#333]" />
                <div className="w-6 h-1 rounded-full bg-[#222]" />
              </div>
              <div className="flex flex-1 p-1 gap-1">
                <div className="w-4 rounded bg-[#111]" />
                <div className="flex-1 space-y-1 pt-0.5">
                  <div className="h-1.5 w-3/4 rounded-full bg-[#222]" />
                  <div className="h-1.5 w-1/2 rounded-full bg-[#222]" />
                </div>
              </div>
            </div>
            <span className="text-sm font-semibold text-on-surface">{t('settings.themeDark', 'Tối')}</span>
            {theme === 'dark' && (
              <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-inverse-surface flex items-center justify-center">
                <span className="material-symbols-outlined fill text-[13px] text-inverse-on-surface">check</span>
              </div>
            )}
          </button>
        </div>
      </section>

      <div className="border-t border-outline-variant/30" />

      {/* Language */}
      <section>
        <SectionTitle>{t('settings.language', 'Ngôn ngữ')}</SectionTitle>
        <div className="space-y-2">
          {[
            { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳', desc: 'Vietnamese' },
            { code: 'en', label: 'English', flag: '🇺🇸', desc: 'English (US)' },
          ].map((lang) => {
            const isActive = i18n.language === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => {
                  i18n.changeLanguage(lang.code);
                  localStorage.setItem('swiftchat_language', lang.code);
                }}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl border transition-all text-left active:scale-[0.99]
                  ${isActive
                    ? 'border-primary/50 bg-primary/5'
                    : 'border-outline-variant/40 bg-surface-container-high hover:bg-surface-container-highest'
                  }`}
              >
                <span className="text-2xl leading-none">{lang.flag}</span>
                <div className="flex-1">
                  <p className={`text-sm font-semibold ${isActive ? 'text-primary' : 'text-on-surface'}`}>{lang.label}</p>
                  <p className="text-[12px] text-on-surface-variant/60">{lang.desc}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center shrink-0
                  ${isActive ? 'border-primary bg-primary' : 'border-outline-variant'}`}>
                  {isActive && <span className="material-symbols-outlined fill text-[13px] text-on-primary">check</span>}
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};
