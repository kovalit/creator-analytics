import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type Tone = 'success' | 'warning' | 'danger' | 'neutral' | 'info' | 'primary';

const toneClass: Record<Tone, string> = {
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
  info: 'bg-primary-soft text-primary',
  primary: 'bg-primary-soft text-primary',
  neutral: 'bg-[#F0F2F6] text-text-secondary',
};

const dotColor: Record<Tone, string> = {
  success: '#1F9D70',
  warning: '#D79527',
  danger: '#D75B66',
  info: '#356DF3',
  primary: '#356DF3',
  neutral: '#9AA1AC',
};

export function Badge({
  children,
  tone = 'neutral',
  dot = false,
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-[12.5px] font-medium',
        toneClass[tone],
        className,
      )}
    >
      {dot && (
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: dotColor[tone] }}
        />
      )}
      {children}
    </span>
  );
}
