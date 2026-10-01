import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'soft';
type Size = 'sm' | 'md';

const variantClass: Record<Variant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-strong shadow-sm',
  secondary:
    'bg-surface text-text-primary border border-border hover:border-border-strong hover:bg-surface-soft',
  soft: 'bg-primary-soft text-primary hover:bg-[#e2edff]',
  ghost: 'text-text-secondary hover:bg-surface-soft hover:text-text-primary',
};

const sizeClass: Record<Size, string> = {
  sm: 'h-9 px-3 text-[13px] gap-1.5 rounded-xl',
  md: 'h-10 px-4 text-sm gap-2 rounded-xl',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
}

export function Button({
  children,
  variant = 'secondary',
  size = 'md',
  icon,
  className,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex select-none items-center justify-center font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        variantClass[variant],
        sizeClass[size],
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
