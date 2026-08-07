import { type ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: string;
}

export function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }: ModalProps) {
  // Bắt sự kiện phím Esc để đóng modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Ngăn scroll bên dưới
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div 
        className={`relative bg-surface-container-low w-full ${maxWidth} mx-4 rounded-3xl shadow-elevation-3 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative flex items-center justify-center px-4 py-4 border-b border-outline-variant/50 min-h-[64px]">
          <h2 className="text-[17px] font-semibold text-on-surface text-center px-10 whitespace-nowrap overflow-hidden text-ellipsis">{title}</h2>
          <button 
            onClick={onClose}
            className="absolute right-4 w-8 h-8 flex items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};
