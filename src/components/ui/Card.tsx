import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface CardProps {
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  as?: 'div' | 'section' | 'article';
}

const radius = {
  sm: 'rounded-card-sm',
  default: 'rounded-card',
  lg: 'rounded-card-lg',
};

export function Card({ children, className, size = 'default', as = 'section' }: CardProps) {
  const Tag = as;
  return (
    <Tag
      className={cn(
        'border border-border bg-surface shadow-card',
        radius[size],
        className,
      )}
    >
      {children}
    </Tag>
  );
}

interface CardHeaderProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function CardHeader({ title, subtitle, action, className }: CardHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4', className)}>
      <div className="min-w-0">
        {title && (
          <h3 className="text-[15px] font-semibold text-text-primary">{title}</h3>
        )}
        {subtitle && (
          <p className="mt-0.5 text-[13px] text-text-secondary">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
