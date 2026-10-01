import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

// Лёгкий hover/focus-тултип (CSS), без внешних зависимостей.
export function Tooltip({
  content,
  children,
  className,
}: {
  content: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <span
      className={cn('relative inline-flex', className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      tabIndex={0}
    >
      {children}
      {open && (
        <span
          role="tooltip"
          className="pointer-events-none absolute bottom-full left-1/2 z-40 mb-2 w-max max-w-[240px] -translate-x-1/2 rounded-xl border border-border bg-surface px-3 py-2 text-[12.5px] font-normal leading-snug text-text-secondary shadow-pop animate-fade-in"
        >
          {content}
        </span>
      )}
    </span>
  );
}
