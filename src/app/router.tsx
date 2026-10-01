import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from './AppShell';
import { OverviewPage } from '@/features/overview/OverviewPage';
import { ContentPage } from '@/features/content/ContentPage';
import { ContentDetailPage } from '@/features/content/ContentDetailPage';
import { CampaignsPage } from '@/features/campaigns/CampaignsPage';
import { CampaignDetailPage } from '@/features/campaigns/CampaignDetailPage';
import { AudiencePage } from '@/features/audience/AudiencePage';
import { SalesPage } from '@/features/sales/SalesPage';
import { EarningsPage } from '@/features/earnings/EarningsPage';
import { OpportunitiesPage } from '@/features/opportunities/OpportunitiesPage';
import { IntegrationsPage } from '@/features/settings/IntegrationsPage';
import { SettingsPage } from '@/features/settings/SettingsPage';
import { NotFoundPage } from '@/features/misc/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <OverviewPage /> },
      { path: 'content', element: <ContentPage /> },
      { path: 'content/:publicationId', element: <ContentDetailPage /> },
      { path: 'campaigns', element: <CampaignsPage /> },
      { path: 'campaigns/:campaignId', element: <CampaignDetailPage /> },
      { path: 'audience', element: <AudiencePage /> },
      { path: 'sales', element: <SalesPage /> },
      { path: 'earnings', element: <EarningsPage /> },
      { path: 'opportunities', element: <OpportunitiesPage /> },
      { path: 'integrations', element: <IntegrationsPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
