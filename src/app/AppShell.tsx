import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { IconClose, IconMenu } from '@/components/ui/icons';
import { cn } from '@/lib/cn';

export function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Закрываем мобильное меню и прокручиваем наверх при смене маршрута.
  useEffect(() => {
    setMobileOpen(false);
    const main = document.getElementById('app-main');
    main?.scrollTo({ top: 0 });
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-bg">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[240px] border-r border-border lg:block">
        <Sidebar />
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-20 flex min-h-14 items-center justify-between py-2 border-b border-border bg-surface px-4 lg:hidden">
        <BrandLogo variant="compact" height={18} />
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Открыть меню"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-soft"
        >
          <IconMenu />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/30 animate-fade-in"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-[260px] border-r border-border bg-surface shadow-pop animate-fade-in">
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Закрыть меню"
              className="absolute right-3 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-soft"
            >
              <IconClose width={18} height={18} />
            </button>
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Content */}
      <main id="app-main" className={cn('lg:pl-[240px]')}>
        <div className="mx-auto w-full max-w-[1600px] px-5 py-6 md:px-8 md:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
