import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { IconChevronDown } from '../ui/icons';

export interface Column<T> {
  key: string;
  header: ReactNode;
  align?: 'left' | 'right' | 'center';
  sortValue?: (row: T) => number | string;
  render: (row: T) => ReactNode;
  width?: string;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  initialSort?: { key: string; dir: 'asc' | 'desc' };
  pageSize?: number;
  emptyLabel?: string;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  initialSort,
  pageSize,
  emptyLabel = 'Нет данных',
}: DataTableProps<T>) {
  const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(
    initialSort ?? null,
  );
  const [limit, setLimit] = useState(pageSize ?? rows.length);

  let sorted = rows;
  if (sort) {
    const col = columns.find((c) => c.key === sort.key);
    if (col?.sortValue) {
      sorted = [...rows].sort((a, b) => {
        const va = col.sortValue!(a);
        const vb = col.sortValue!(b);
        if (va < vb) return sort.dir === 'asc' ? -1 : 1;
        if (va > vb) return sort.dir === 'asc' ? 1 : -1;
        return 0;
      });
    }
  }
  const visible = pageSize ? sorted.slice(0, limit) : sorted;

  const toggleSort = (key: string) => {
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, dir: 'desc' };
      if (prev.dir === 'desc') return { key, dir: 'asc' };
      return null;
    });
  };

  const alignClass = (a?: 'left' | 'right' | 'center') =>
    a === 'right' ? 'text-right' : a === 'center' ? 'text-center' : 'text-left';

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border">
              {columns.map((c) => {
                const active = sort?.key === c.key;
                return (
                  <th
                    key={c.key}
                    className={cn(
                      'whitespace-nowrap px-3 py-2.5 text-[12px] font-medium uppercase tracking-wide text-text-tertiary first:pl-1 last:pr-1',
                      alignClass(c.align),
                    )}
                    style={{ width: c.width }}
                  >
                    {c.sortValue ? (
                      <button
                        onClick={() => toggleSort(c.key)}
                        className={cn(
                          'inline-flex items-center gap-1 transition-colors hover:text-text-secondary',
                          c.align === 'right' && 'flex-row-reverse',
                          active && 'text-primary',
                        )}
                      >
                        {c.header}
                        <IconChevronDown
                          width={13}
                          height={13}
                          className={cn(
                            'transition-transform',
                            active && sort?.dir === 'asc' && 'rotate-180',
                            !active && 'opacity-40',
                          )}
                        />
                      </button>
                    ) : (
                      c.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-3 py-10 text-center text-sm text-text-tertiary"
                >
                  {emptyLabel}
                </td>
              </tr>
            )}
            {visible.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  'border-b border-border/70 transition-colors last:border-0',
                  onRowClick && 'cursor-pointer hover:bg-surface-soft',
                )}
              >
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={cn(
                      'px-3 py-3.5 text-[13.5px] text-text-primary first:pl-1 last:pr-1',
                      alignClass(c.align),
                      c.align === 'right' && 'tnum',
                      c.className,
                    )}
                  >
                    {c.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pageSize && sorted.length > limit && (
        <div className="mt-3 flex justify-center">
          <button
            onClick={() => setLimit((l) => l + (pageSize ?? 10))}
            className="rounded-xl border border-border px-4 py-2 text-[13px] font-medium text-text-secondary transition-colors hover:bg-surface-soft"
          >
            Показать ещё
          </button>
        </div>
      )}
    </div>
  );
}
