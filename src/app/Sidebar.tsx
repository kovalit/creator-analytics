import { NavLink } from 'react-router-dom';
import { PRIMARY_NAV, SECONDARY_NAV, type NavItem } from './nav';
import { dataset } from '@/data/dataset';
import { Avatar } from '@/components/ui/Avatar';
import { compactNumber } from '@/analytics/formatters';
import { cn } from '@/lib/cn';

function NavRow({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition-colors',
          isActive
            ? 'bg-primary-soft text-primary'
            : 'text-text-secondary hover:bg-surface-soft hover:text-text-primary',
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            width={19}
            height={19}
            className={cn(isActive ? 'text-primary' : 'text-text-tertiary group-hover:text-text-secondary')}
          />
          {item.label}
        </>
      )}
    </NavLink>
  );
}

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { creator, socialAccounts } = dataset;
  const followers = socialAccounts.reduce((a, s) => a + s.followers, 0);

  return (
    <div className="flex h-full flex-col bg-surface">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 pb-2 pt-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 7l2.6 10L9.5 9.5 12.5 17 15 7"
              stroke="currentColor"
              strokeWidth="2.1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="19" cy="7" r="1.5" fill="currentColor" />
          </svg>
        </div>
        <div className="leading-tight">
          <div className="text-[14.5px] font-bold text-text-primary">WhatsBetter<span className="text-primary">.me</span></div>
          <div className="text-[11.5px] font-medium text-text-tertiary">Creator</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-1">
          {PRIMARY_NAV.map((item) => (
            <NavRow key={item.to} item={item} onNavigate={onNavigate} />
          ))}
        </div>
        <div className="my-4 h-px bg-border" />
        <div className="space-y-1">
          {SECONDARY_NAV.map((item) => (
            <NavRow key={item.to} item={item} onNavigate={onNavigate} />
          ))}
        </div>
      </nav>

      {/* Creator mini profile */}
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 rounded-xl p-2">
          <Avatar name={creator.displayName} size={38} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13.5px] font-semibold text-text-primary">
              {creator.displayName}
            </div>
            <div className="truncate text-[12px] text-text-tertiary">
              {compactNumber(followers)} подписчиков
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
