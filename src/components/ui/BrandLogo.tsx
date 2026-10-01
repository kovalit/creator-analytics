import { useState } from 'react';
import { BRAND_NAME, LOGO_URL, PRODUCT_NAME } from '@/lib/brand';
import { cn } from '@/lib/cn';

function LogoImage({ height }: { height: number }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span className="text-[17px] font-bold leading-none text-text-primary">
        WhatsBetter<span className="text-primary">.me</span>
      </span>
    );
  }
  return (
    <img
      src={LOGO_URL}
      alt={BRAND_NAME}
      style={{ height }}
      className="w-auto max-w-full object-contain object-left"
      onError={() => setFailed(true)}
    />
  );
}

function ProductTag() {
  return (
    <div className="flex items-center gap-2">
      <span className="inline-flex items-center gap-1.5 rounded-pill bg-gradient-to-r from-primary to-[#5b8cff] py-[3px] pl-1.5 pr-2.5 text-[11px] font-semibold tracking-wide text-white shadow-[0_2px_6px_rgba(53,109,243,.28)]">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 3.5l1.9 5.1 5.1 1.9-5.1 1.9L12 17.5l-1.9-5.1L5 10.5l5.1-1.9L12 3.5Z"
            fill="currentColor"
          />
          <path
            d="M18.5 15.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2Z"
            fill="currentColor"
            opacity=".7"
          />
        </svg>
        {PRODUCT_NAME}
      </span>
      <span className="text-[11.5px] font-medium text-text-tertiary">кабинет блогера</span>
    </div>
  );
}

// Главный логотип: официальный SVG + продуктовая метка под ним.
// variant="card"    — мягкая карточка для сайдбара
// variant="compact" — без фона, для мобильной шапки
export function BrandLogo({
  height = 21,
  variant = 'card',
  className,
}: {
  height?: number;
  variant?: 'card' | 'compact';
  className?: string;
}) {
  if (variant === 'compact') {
    return (
      <div className={cn('flex flex-col items-start gap-1.5', className)}>
        <LogoImage height={height} />
        <ProductTag />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-primary/10 bg-gradient-to-br from-primary-soft via-white to-white px-3.5 py-3.5',
        className,
      )}
    >
      {/* декоративное свечение в углу */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full bg-primary/10 blur-2xl"
      />
      <div className="relative flex flex-col items-start gap-2.5">
        <LogoImage height={height} />
        <ProductTag />
      </div>
    </div>
  );
}
