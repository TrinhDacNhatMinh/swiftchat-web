import { useEffect, useState } from 'react';

interface GlobalToastProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'development';
  duration: number;
  onClose: () => void;
}

export function GlobalToast({ message, type, duration, onClose }: GlobalToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Small delay to trigger animation
    const showTimer = setTimeout(() => setIsVisible(true), 10);
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for transition
    }, duration);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [duration, onClose]);

  let bgColor = 'bg-surface-variant';
  let textColor = 'text-on-surface-variant';
  let icon = 'info';

  if (type === 'success') {
    bgColor = 'bg-secondary';
    textColor = 'text-on-secondary';
    icon = 'check_circle';
  } else if (type === 'error') {
    bgColor = 'bg-error';
    textColor = 'text-on-error';
    icon = 'error';
  } else if (type === 'development') {
    bgColor = 'bg-surface-variant';
    textColor = 'text-on-surface-variant';
    icon = 'construction';
  }

  return (
    <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none">
      <div
        className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl shadow-xl transition-all duration-300 ease-out ${bgColor} ${textColor} ${
          isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95'
        }`}
      >
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
        <p className="text-[13px] font-semibold tracking-wide whitespace-nowrap">{message}</p>
      </div>
    </div>
  );
};
