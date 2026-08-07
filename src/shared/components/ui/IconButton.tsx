import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Icon } from '@/shared/components/ui/Icon';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const variantStyles: Record<string, string> = {
  primary: 'bg-primary text-on-primary hover:bg-primary/90 border-transparent',
  secondary: 'bg-secondary text-on-secondary hover:bg-secondary/90 border-transparent',
  danger: 'bg-error text-on-error hover:bg-error/90 border-transparent',
  ghost: 'bg-transparent text-on-surface hover:bg-surface-variant border-transparent shadow-none',
  outline: 'bg-surface border-outline-variant text-on-surface hover:bg-surface-variant',
};

const sizeStyles: Record<string, string> = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
};

const iconSizeMap: Record<string, number> = {
  sm: 18,
  md: 20,
  lg: 24,
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      icon,
      className = '',
      variant = 'ghost',
      size = 'md',
      isLoading = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-surface disabled:opacity-50 disabled:pointer-events-none border shadow-sm shrink-0';
    
    const combinedClasses = [
      baseStyles,
      variantStyles[variant],
      sizeStyles[size],
      className,
    ].filter(Boolean).join(' ');

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={combinedClasses}
        {...props}
      >
        {isLoading ? (
          <Icon name="progress_activity" className="animate-spin" size={iconSizeMap[size]} />
        ) : (
          <Icon name={icon} size={iconSizeMap[size]} />
        )}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';
