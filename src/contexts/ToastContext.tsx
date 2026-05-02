import { createContext, useContext, useState, ReactNode, FC, useCallback } from 'react';
import { GlobalToast } from '@/shared/components/common/GlobalToast';

export interface ToastOptions {
  message: string;
  title?: string;
  type?: 'success' | 'error' | 'info' | 'development';
  duration?: number;
}

interface ToastContextValue {
  toast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [toastData, setToastData] = useState<(ToastOptions & { id: number }) | null>(null);

  const toast = useCallback((options: ToastOptions) => {
    setToastData({ ...options, id: Date.now() });
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {toastData && (
        <GlobalToast
          key={toastData.id}
          message={toastData.message}
          type={toastData.type || 'info'}
          duration={toastData.duration || 3000}
          onClose={() => setToastData(null)}
        />
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
