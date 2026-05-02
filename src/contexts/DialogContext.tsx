import { createContext, useContext, useState, ReactNode, FC, useEffect } from 'react';
import { GlobalDialog } from '@/shared/components/common/GlobalDialog';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/auth.store';

export interface DialogOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'danger' | 'warning';
}

interface DialogContextValue {
  confirm: (options: DialogOptions) => Promise<boolean>;
  alert: (options: Omit<DialogOptions, 'cancelText'>) => Promise<void>;
}

const DialogContext = createContext<DialogContextValue | null>(null);

export const DialogProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<DialogOptions | null>(null);
  const [resolveFn, setResolveFn] = useState<((value: boolean) => void) | null>(null);
  const [isAlert, setIsAlert] = useState(false);

  useEffect(() => {
    const handleSessionExpired = async () => {
      await alert({
        title: t('common.sessionExpiredTitle', 'Phiên đăng nhập hết hạn'),
        message: t('common.sessionExpiredMessage', 'Vui lòng đăng nhập lại để tiếp tục sử dụng.'),
        type: 'warning',
      });
      useAuthStore.getState().logout();
    };
    window.addEventListener('session_expired', handleSessionExpired);
    return () => window.removeEventListener('session_expired', handleSessionExpired);
  }, [t]);

  const confirm = (opts: DialogOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setOptions(opts);
      setResolveFn(() => resolve);
      setIsAlert(false);
      setIsOpen(true);
    });
  };

  const alert = (opts: Omit<DialogOptions, 'cancelText'>): Promise<void> => {
    return new Promise((resolve) => {
      setOptions(opts);
      setResolveFn(() => (_val: boolean) => resolve());
      setIsAlert(true);
      setIsOpen(true);
    });
  };

  const handleConfirm = () => {
    setIsOpen(false);
    if (resolveFn) resolveFn(true);
  };

  const handleCancel = () => {
    setIsOpen(false);
    if (resolveFn) resolveFn(false);
  };

  return (
    <DialogContext.Provider value={{ confirm, alert }}>
      {children}
      {options && (
        <GlobalDialog
          isOpen={isOpen}
          title={options.title}
          message={options.message}
          confirmText={options.confirmText}
          cancelText={options.cancelText}
          type={options.type || 'info'}
          isAlert={isAlert}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </DialogContext.Provider>
  );
};

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
};
