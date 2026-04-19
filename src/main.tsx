import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/shared/lib/queryClient';
import { router } from '@/router';
import { useThemeStore } from '@/stores/theme.store';
import { DialogProvider } from '@/contexts/DialogContext';
import { ToastProvider } from '@/contexts/ToastContext';
import './i18n';
import './index.css';

// Initialize theme from local storage
useThemeStore.getState();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <DialogProvider>
          <RouterProvider router={router} />
        </DialogProvider>
      </ToastProvider>
    </QueryClientProvider>
  </StrictMode>,
);
