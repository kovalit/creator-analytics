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
    <div className={cn('flex flex-col items-start gap-1', className)}>
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
        <span className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-primary">
          {PRODUCT_NAME}
        </span>
      )}
    </div>
  );
}
