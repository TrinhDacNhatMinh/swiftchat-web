import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { SettingsAccountTab } from '@/features/settings/components/SettingsAccountTab';
import { SettingsAppearanceTab } from '@/features/settings/components/SettingsAppearanceTab';
import { SettingsPrivacyTab } from '@/features/settings/components/SettingsPrivacyTab';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'account' | 'appearance' | 'privacy';

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabId>('account');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const navItems: { id: TabId; icon: string; label: string }[] = [
    { id: 'account', icon: 'person', label: t('settings.account', 'Tài khoản') },
    { id: 'appearance', icon: 'palette', label: t('settings.appearance', 'Giao diện') },
    { id: 'privacy', icon: 'shield', label: t('settings.privacy', 'Quyền riêng tư') },
  ];

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Panel Container */}
      <div
        className="relative w-full max-w-3xl bg-surface rounded-3xl shadow-2xl overflow-hidden flex animate-in fade-in zoom-in-95 duration-200"
        style={{ height: 'min(600px, 90vh)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Sidebar */}
        <aside className="w-56 bg-surface-container-low flex flex-col shrink-0 border-r border-outline-variant/30">
          {/* Header */}
          <div className="px-5 pt-6 pb-4">
            <h2 className="text-lg font-bold text-on-surface tracking-tight">
              {t('settings.title', 'Cài đặt')}
            </h2>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 px-3 space-y-0.5">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`settings-tab-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left
                    ${isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                    }`}
                >
                  <span className={`material-symbols-outlined text-[20px] ${isActive ? 'fill' : ''}`}>
                    {item.icon}
                  </span>
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Version Footer */}
          <div className="px-5 py-4">
            <p className="text-[11px] text-on-surface-variant/40 font-mono">SwiftChat v1.0.0</p>
          </div>
        </aside>

        {/* Right Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Content Header */}
          <div className="flex items-center justify-between px-7 py-5 border-b border-outline-variant/30 shrink-0">
            <h3 className="text-base font-semibold text-on-surface">
              {navItems.find((n) => n.id === activeTab)?.label}
            </h3>
            <button
              id="settings-close-btn"
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-7 py-6 custom-scrollbar">
            {activeTab === 'account' && <SettingsAccountTab />}
            {activeTab === 'appearance' && <SettingsAppearanceTab />}
            {activeTab === 'privacy' && <SettingsPrivacyTab />}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
