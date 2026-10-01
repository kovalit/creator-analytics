// Единый набор outline-иконок (24×24, stroke=currentColor).

import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement>;

function base(props: P) {
  return {
    width: 20,
    height: 20,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    ...props,
  };
}

export const IconHome = (p: P) => (
  <svg {...base(p)}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" /></svg>
);
export const IconContent = (p: P) => (
  <svg {...base(p)}><rect x="4" y="3" width="16" height="18" rx="2.5" /><path d="M8 8h8M8 12h8M8 16h5" /></svg>
);
export const IconCampaigns = (p: P) => (
  <svg {...base(p)}><path d="M3 11v2a1 1 0 0 0 1 1h3l6 4V6L7 10H4a1 1 0 0 0-1 1Z" /><path d="M17 9a4 4 0 0 1 0 6" /></svg>
);
export const IconAudience = (p: P) => (
  <svg {...base(p)}><circle cx="9" cy="8" r="3.2" /><path d="M3.5 19a5.5 5.5 0 0 1 11 0" /><path d="M16 5.2a3 3 0 0 1 0 5.6M17.5 19a5 5 0 0 0-3-4.6" /></svg>
);
export const IconSales = (p: P) => (
  <svg {...base(p)}><path d="M4 5h2l1.6 10.3a1 1 0 0 0 1 .85h8.2a1 1 0 0 0 1-.8L20 8H6.5" /><circle cx="9.5" cy="19.5" r="1.3" /><circle cx="17.5" cy="19.5" r="1.3" /></svg>
);
export const IconEarnings = (p: P) => (
  <svg {...base(p)}><rect x="3" y="6" width="18" height="13" rx="2.5" /><path d="M3 10h18" /><path d="M16 15h2" /></svg>
);
export const IconOpportunities = (p: P) => (
  <svg {...base(p)}><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" /><circle cx="12" cy="12" r="3.2" /></svg>
);
export const IconIntegrations = (p: P) => (
  <svg {...base(p)}><path d="M9 7V4M15 7V4M8 7h8v4a4 4 0 0 1-8 0V7Z" /><path d="M12 15v5" /></svg>
);
export const IconSettings = (p: P) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="3" /><path d="M19.4 13a7.9 7.9 0 0 0 0-2l1.7-1.3-1.8-3-2 .8a7.6 7.6 0 0 0-1.7-1l-.3-2.2h-3.6l-.3 2.2a7.6 7.6 0 0 0-1.7 1l-2-.8-1.8 3L4.6 11a7.9 7.9 0 0 0 0 2l-1.7 1.3 1.8 3 2-.8a7.6 7.6 0 0 0 1.7 1l.3 2.2h3.6l.3-2.2a7.6 7.6 0 0 0 1.7-1l2 .8 1.8-3Z" /></svg>
);
export const IconHelp = (p: P) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.5 2.5 0 0 1 4.3 1.7c0 1.7-2.3 2-2.3 3.3" /><path d="M12 17.5h.01" /></svg>
);
export const IconChevronDown = (p: P) => (
  <svg {...base(p)}><path d="m6 9 6 6 6-6" /></svg>
);
export const IconChevronRight = (p: P) => (
  <svg {...base(p)}><path d="m9 6 6 6-6 6" /></svg>
);
export const IconSearch = (p: P) => (
  <svg {...base(p)}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" /></svg>
);
export const IconArrowUpRight = (p: P) => (
  <svg {...base(p)}><path d="M7 17 17 7M8 7h9v9" /></svg>
);
export const IconTrendUp = (p: P) => (
  <svg {...base(p)}><path d="m4 15 5-5 3 3 6-7" /><path d="M15 6h4v4" /></svg>
);
export const IconTrendDown = (p: P) => (
  <svg {...base(p)}><path d="m4 9 5 5 3-3 6 7" /><path d="M15 18h4v-4" /></svg>
);
export const IconCheck = (p: P) => (
  <svg {...base(p)}><path d="m5 12 4.5 4.5L19 7" /></svg>
);
export const IconCalendar = (p: P) => (
  <svg {...base(p)}><rect x="3.5" y="5" width="17" height="16" rx="2.5" /><path d="M3.5 9.5h17M8 3v4M16 3v4" /></svg>
);
export const IconFilter = (p: P) => (
  <svg {...base(p)}><path d="M4 6h16M7 12h10M10 18h4" /></svg>
);
export const IconExternal = (p: P) => (
  <svg {...base(p)}><path d="M14 4h6v6M20 4l-8 8" /><path d="M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4" /></svg>
);
export const IconClose = (p: P) => (
  <svg {...base(p)}><path d="M6 6l12 12M18 6 6 18" /></svg>
);
export const IconMenu = (p: P) => (
  <svg {...base(p)}><path d="M4 7h16M4 12h16M4 17h16" /></svg>
);
export const IconBell = (p: P) => (
  <svg {...base(p)}><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" /><path d="M10 19a2 2 0 0 0 4 0" /></svg>
);
export const IconInfo = (p: P) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg>
);
export const IconStar = (p: P) => (
  <svg {...base(p)}><path d="m12 3.5 2.6 5.3 5.9.9-4.2 4.1 1 5.8L12 17l-5.3 2.8 1-5.8L3.5 9.7l5.9-.9Z" /></svg>
);
export const IconSort = (p: P) => (
  <svg {...base(p)}><path d="M7 4v16M7 20l-3-3M7 4l3 3M17 20V4M17 4l3 3M17 20l-3-3" /></svg>
);
export const IconSparkle = (p: P) => (
  <svg {...base(p)}><path d="M12 3v18M3 12h18" transform="rotate(45 12 12)" /><path d="M12 6v12M6 12h12" /></svg>
);
export const IconUsers = IconAudience;
