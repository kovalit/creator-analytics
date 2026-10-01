import { PLATFORM_COLOR, PLATFORM_LABEL } from '@/analytics/selectors/labels';
import type { Platform } from '@/data/types';
import { cn } from '@/lib/cn';

export function PlatformTag({ platform, className }: { platform: Platform; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-pill bg-surface-soft px-2 py-0.5 text-[12px] font-medium text-text-secondary',
        className,
      )}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: PLATFORM_COLOR[platform] }}
      />
      {PLATFORM_LABEL[platform]}
    </span>
  );
}
