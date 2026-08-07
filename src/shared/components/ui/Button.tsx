import { ButtonHTMLAttributes, forwardRef } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-on-primary hover:bg-primary/90 border-transparent',
  secondary: 'bg-secondary text-on-secondary hover:bg-secondary/90 border-transparent',
  danger: 'bg-error text-on-error hover:bg-error/90 border-transparent',
  ghost: 'bg-transparent text-on-surface hover:bg-surface-variant border-transparent',
  outline: 'bg-transparent border-outline-variant text-on-surface hover:bg-surface-variant',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = '',
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center rounded-full font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-surface disabled:opacity-50 disabled:pointer-events-none border shadow-sm';
    
    const combinedClasses = [
      baseStyles,
      variantStyles[variant],
      sizeStyles[size],
      fullWidth ? 'w-full' : '',
      className,
    ].filter(Boolean).join(' ');

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={combinedClasses}
        {...props}
      >
        {isLoading && (
          <span className="material-symbols-outlined animate-spin mr-2 text-[18px]">
            progress_activity
          </span>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
