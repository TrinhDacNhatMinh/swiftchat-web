import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export interface ContextMenuItem {
  label: string;
  icon: string;
  onClick: () => void;
  variant?: 'default' | 'danger';
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

export function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleScroll = () => {
      onClose();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    // Use a slight delay to avoid closing immediately if triggered by a click
    setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('contextmenu', handleClickOutside); // Close if another context menu opens
      document.addEventListener('keydown', handleKeyDown);
      window.addEventListener('scroll', handleScroll, true);
      
      // Auto focus first button if available
      const firstButton = menuRef.current?.querySelector('button');
      if (firstButton) {
        firstButton.focus();
      }
    }, 10);

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('contextmenu', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [onClose]);

  // Prevent default context menu on the custom context menu itself
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  return createPortal(
    <div
      ref={menuRef}
      onContextMenu={handleContextMenu}
      className="fixed z-[100] min-w-[12rem] max-w-xs py-1 bg-surface-container-high rounded-xl shadow-lg border border-outline-variant shadow-elevation-2 animate-in fade-in zoom-in-95 duration-100 origin-top-left"
      style={{
        top: `${y}px`,
        left: `${x}px`,
        // Basic collision prevention (this can be improved for edge cases)
        maxHeight: `calc(100vh - ${y}px - 10px)`,
      }}
    >
      {items.map((item, idx) => (
        <button
          key={idx}
          onClick={(e) => {
            e.stopPropagation();
            item.onClick();
            onClose();
          }}
          className={`w-full flex items-center px-4 py-2.5 text-sm transition-colors
            ${item.variant === 'danger' 
              ? 'text-error hover:bg-error/10' 
              : 'text-on-surface hover:bg-surface-container-highest'}
          `}
        >
          <span className="material-symbols-outlined text-[20px] mr-3 shrink-0">{item.icon}</span>
          <span className="font-medium whitespace-nowrap">{item.label}</span>
        </button>
      ))}
    </div>,
    document.body
  );
};
