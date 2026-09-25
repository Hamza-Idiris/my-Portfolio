import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  Download,
  Eye,
  ExternalLink,
  FileText,
  FolderKanban,
  Inbox,
  MousePointerClick,
  Users,
} from 'lucide-react';
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

const STAT_CARDS = [
  { key: 'uniqueVisitors', label: 'Unique visitors', icon: Users },
  { key: 'sessions', label: 'Sessions', icon: Activity },
  { key: 'pageViews', label: 'Page views', icon: Eye },
  { key: 'projectViews', label: 'Project views', icon: FolderKanban },
  { key: 'updateViews', label: 'Update views', icon: FileText },
  { key: 'messages', label: 'Contact messages', icon: Inbox },
  { key: 'cvDownloads', label: 'CV downloads', icon: Download },
  { key: 'externalClicks', label: 'External link clicks', icon: ExternalLink },
];

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <Icon className="h-4 w-4 text-slate-600" aria-hidden="true" />
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-50">{formatNumber(value)}</p>
    </div>
  );
}

export default function AdminOverview() {
  const [range, setRange] = useState({ range: '30d' });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'dashboard', range],
    queryFn: () => api.get('/api/admin/dashboard', { params: range }),
  });

  if (isLoading) return <AdminLoading label="Loading dashboard" />;
  if (isError) {
    return <AdminErrorState message="The dashboard could not be loaded." onRetry={refetch} />;
  }

  const { overview, recentActivity, content } = data;
  const noData = overview.totals.totalEvents === 0;

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Everything here comes from real visitor activity on your site."
        actions={<DateRangePicker value={range} onChange={setRange} />}
      />

      {noData ? (
        <Panel className="mb-6">
          <AdminEmptyState
            icon={Activity}
            title="No visitor activity in this range"
            description="Once people start visiting your site, their page views and interactions will appear here. Nothing on this dashboard is simulated."
          />
        </Panel>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_CARDS.map((card) => (
          <StatCard
            key={card.key}
            label={card.label}
            value={overview.totals[card.key]}
            icon={card.icon}
          />
        ))}
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-3">
        <Panel
          title="Visitor trend"
          description="Page views and unique visitors over the selected range"
          className="xl:col-span-2"
        >
          <VisitorTrendChart data={overview.series} />
        </Panel>

        <Panel title="Content" description="What is published right now">
          <dl className="space-y-3 text-sm">
            {[
              ['Projects published', `${content.publishedProjects} of ${content.projects}`],
              ['Updates published', `${content.publishedPosts} of ${content.posts}`],
              ['Messages received', content.messages],
              ['Unread messages', content.unread],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4">
                <dt className="text-slate-400">{label}</dt>
                <dd className="font-medium tabular-nums text-slate-100">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-800 pt-4 text-sm">
            <Link to="/admin/projects" className="text-teal-400 hover:text-teal-300">
              Manage projects
            </Link>
            <span className="text-slate-700">·</span>
            <Link to="/admin/updates" className="text-teal-400 hover:text-teal-300">
              Write an update
            </Link>
          </div>
        </Panel>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Panel title="Top projects" description="Most viewed project pages">
          <HorizontalBarChart
            data={overview.topProjects}
            emptyMessage="Project views will appear here once visitors open your case studies."
          />
        </Panel>

        <Panel title="Top pages" description="Most visited pages">
          <HorizontalBarChart
            data={overview.topPages}
            color="#38bdf8"
            emptyMessage="Page views will appear here as people browse the site."
          />
        </Panel>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Panel title="Devices">
          <DonutChart data={overview.devices} emptyMessage="No device data yet." />
        </Panel>
        <Panel title="Traffic sources">
          <DonutChart data={overview.referrers} emptyMessage="No referrer data yet." />
        </Panel>
        <Panel title="Recent activity" description="Visitors are always anonymous">
          {!recentActivity.length ? (
            <AdminEmptyState
              icon={MousePointerClick}
              title="Nothing yet"
              description="Live visitor actions will show up here."
            />
          ) : (
            <ul className="space-y-3">
              {recentActivity.map((entry) => (
                <li key={entry.id} className="flex items-start justify-between gap-3 text-sm">
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
      </div>
    </>
  );
}
