import { useState } from 'react';
import { BRAND_NAME, LOGO_URL, PRODUCT_NAME } from '@/lib/brand';
import { cn } from '@/lib/cn';

// Главный логотип: официальный SVG + бейдж продукта.
// Если ассет не загрузился — показываем текстовый вариант бренда.
export function BrandLogo({
  height = 24,
  className,
  showProduct = true,
}: {
  height?: number;
  className?: string;
  showProduct?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      {failed ? (
        <span className="text-[15px] font-bold text-text-primary">
          WhatsBetter<span className="text-primary">.me</span>
        </span>
      ) : (
        <img
          src={LOGO_URL}
          alt={BRAND_NAME}
          height={height}
          style={{ height }}
          className="w-auto"
          onError={() => setFailed(true)}
        />
      )}
      {showProduct && (
        <span className="rounded-md bg-primary-soft px-1.5 py-0.5 text-[11px] font-semibold text-primary">
          {PRODUCT_NAME}
        </span>
      )}
    </div>
  );
}
