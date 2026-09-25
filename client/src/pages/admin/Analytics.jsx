import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, ShieldCheck } from 'lucide-react';
import { api } from '../../lib/api.js';
import {
  AdminEmptyState,
  AdminErrorState,
  AdminLoading,
  PageHeader,
  Panel,
} from '../../components/admin/AdminPrimitives.jsx';
import { DateRangePicker } from '../../components/admin/DateRangePicker.jsx';
import { DonutChart, HorizontalBarChart, VisitorTrendChart } from '../../components/admin/Charts.jsx';
import { formatNumber, formatRelativeTime } from '../../lib/format.js';

const CONVERSION_LABELS = {
  contact_form_open: 'Contact page opened',
  contact_form_submit: 'Contact form submitted',
  cv_download: 'CV downloaded',
  github_click: 'GitHub opened',
  linkedin_click: 'LinkedIn opened',
  project_demo_click: 'Live demo opened',
};

export default function AdminAnalytics() {
  const [range, setRange] = useState({ range: '30d' });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'analytics', range],
    queryFn: () => api.get('/api/admin/analytics', { params: range }),
  });

  const { data: activity } = useQuery({
    queryKey: ['admin', 'analytics', 'activity'],
    queryFn: () => api.get('/api/admin/analytics/activity'),
    refetchInterval: 30_000,
  });

  if (isLoading) return <AdminLoading label="Loading analytics" />;
  if (isError) return <AdminErrorState message="Analytics could not be loaded." onRetry={refetch} />;

  const { overview } = data;
  const conversions = overview.conversions.map((entry) => ({
    name: CONVERSION_LABELS[entry.name] || entry.name,
    count: entry.count,
  }));

  return (
    <>
      <PageHeader
        title="Analytics"
        description="First-party and privacy-conscious: no cookies, no cross-site tracking, no fingerprinting."
        actions={<DateRangePicker value={range} onChange={setRange} />}
      />

      <Panel className="mb-5" bodyClassName="flex items-start gap-3 p-4">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-teal-400" aria-hidden="true" />
        <p className="text-xs leading-relaxed text-slate-400">
          Each visit is tied to a random identifier that lives only in the browser tab and disappears
          when it closes. Device, browser and traffic source are recorded as broad categories, and
          visitors who enable Do Not Track are not recorded at all.
        </p>
      </Panel>

      <Panel title="Visitors over time" description="Page views and unique visitors">
        <VisitorTrendChart data={overview.series} height={320} />
      </Panel>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Panel title="Most visited pages">
          <HorizontalBarChart data={overview.topPages} emptyMessage="No page views in this range." />
        </Panel>
        <Panel title="Project popularity">
          <HorizontalBarChart
            data={overview.topProjects}
            color="#a78bfa"
            emptyMessage="No project views in this range."
          />
        </Panel>
        <Panel title="Most read updates">
          <HorizontalBarChart
            data={overview.topPosts}
            color="#38bdf8"
            emptyMessage="No update views in this range."
          />
        </Panel>
        <Panel title="Call to action clicks">
          <HorizontalBarChart
            data={overview.ctaClicks}
            color="#f59e0b"
            emptyMessage="No call to action clicks in this range."
          />
        </Panel>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Panel title="Devices">
          <DonutChart data={overview.devices} emptyMessage="No device data yet." />
        </Panel>
        <Panel title="Browsers">
          <DonutChart data={overview.browsers} emptyMessage="No browser data yet." />
        </Panel>
        <Panel title="Operating systems">
          <DonutChart data={overview.operatingSystems} emptyMessage="No platform data yet." />
        </Panel>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Panel title="Traffic sources">
          <DonutChart data={overview.referrers} emptyMessage="No referrer data yet." />
        </Panel>
        <Panel title="Conversions" description="Actions that turn interest into contact">
          <ul className="divide-y divide-slate-800">
            {conversions.map((entry) => (
              <li key={entry.name} className="flex items-center justify-between py-2.5 text-sm">
                <span className="text-slate-300">{entry.name}</span>
                <span className="font-medium tabular-nums text-slate-100">
                  {formatNumber(entry.count)}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel className="mt-5" title="Recent activity" description="Visitors are always anonymous">
        {!activity?.items?.length ? (
          <AdminEmptyState
            icon={Activity}
            title="No activity yet"
            description="Visitor actions will appear here as they happen."
          />
        ) : (
          <ul className="divide-y divide-slate-800">
            {activity.items.map((entry) => (
              <li key={entry.id} className="flex items-center justify-between gap-4 py-2.5 text-sm">
                <span className="text-slate-300">
                  <span className="text-slate-500">Anonymous visitor</span> {entry.description}
                </span>
                <span className="shrink-0 text-xs text-slate-600">
                  {formatRelativeTime(entry.timestamp)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}
