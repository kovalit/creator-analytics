// Простой доступный dropdown-селектор для фильтров.

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { IconCheck, IconChevronDown } from './icons';

export interface DropdownOption<T extends string> {
  value: T;
  label: string;
  hint?: string;
}

interface DropdownProps<T extends string> {
  value: T;
  options: DropdownOption<T>[];
  onChange: (value: T) => void;
  label?: string;
  icon?: ReactNode;
  align?: 'left' | 'right';
  minWidth?: number;
  size?: 'sm' | 'md';
}

export function Dropdown<T extends string>({
  value,
  options,
  onChange,
  label,
  icon,
  align = 'left',
  minWidth = 200,
  size = 'md',
}: DropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  const h = size === 'sm' ? 'h-9 text-[13px]' : 'h-10 text-sm';

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          'inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-3 font-medium text-text-primary transition-colors hover:border-border-strong hover:bg-surface-soft',
          h,
        )}
      >
        {icon && <span className="text-text-tertiary">{icon}</span>}
        {label && <span className="text-text-tertiary">{label}:</span>}
        <span className="truncate">{current?.label ?? ''}</span>
        <IconChevronDown
          width={16}
          height={16}
          className={cn('text-text-tertiary transition-transform', open && 'rotate-180')}
        />
      </button>
      {open && (
        <div
          role="listbox"
          className={cn(
            'absolute z-30 mt-2 max-h-80 overflow-auto rounded-2xl border border-border bg-surface p-1.5 shadow-pop animate-fade-in',
            align === 'right' ? 'right-0' : 'left-0',
          )}
          style={{ minWidth }}
        >
          {options.map((o) => {
            const active = o.value === value;
            return (
              <button
                key={o.value}
                role="option"
                aria-selected={active}
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                className={cn(
                  'flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors',
                  active ? 'bg-primary-soft text-primary' : 'hover:bg-surface-soft',
                )}
              >
                <span className="flex flex-col">
                  <span className="font-medium">{o.label}</span>
                  {o.hint && <span className="text-[12px] text-text-tertiary">{o.hint}</span>}
                </span>
                {active && <IconCheck width={16} height={16} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
