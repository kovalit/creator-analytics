import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function EmptyState({
  title,
  description,
  icon,
  className,
  action,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-card border border-dashed border-border-strong bg-surface-soft px-6 py-12 text-center',
        className,
      )}
    >
      {icon && (
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-soft text-primary">
          {icon}
        </div>
      )}
      <p className="text-[15px] font-semibold text-text-primary">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-[13px] leading-relaxed text-text-secondary">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <EmptyState
      title="Не удалось загрузить данные"
      description="Попробуйте обновить отчёт. В demo данные локальные, поэтому ошибка маловероятна."
      action={
        onRetry && (
          <button
            onClick={onRetry}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-strong"
          >
            Обновить
          </button>
        )
      }
    />
  );
}
