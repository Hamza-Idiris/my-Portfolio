import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, FileText } from 'lucide-react';
import { api, apiUrl } from '../../lib/api.js';
import {
  AdminButton,
  AdminEmptyState,
  AdminErrorState,
  AdminLoading,
  PageHeader,
  Panel,
} from '../../components/admin/AdminPrimitives.jsx';
import { DateRangePicker } from '../../components/admin/DateRangePicker.jsx';
import { formatDate } from '../../lib/format.js';
import { cn } from '../../lib/cn.js';

const REPORTS = [
  { value: 'traffic', label: 'Traffic' },
  { value: 'projects', label: 'Project performance' },
  { value: 'content', label: 'Content' },
  { value: 'conversion', label: 'Conversion' },
  { value: 'technology', label: 'Technology' },
  { value: 'contact', label: 'Contact' },
];

export default function AdminReports() {
  const [type, setType] = useState('traffic');
  const [range, setRange] = useState({ range: '30d' });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'reports', type, range],
    queryFn: () => api.get(`/api/admin/reports/${type}`, { params: range }),
  });

  const exportUrl = () => {
    const params = new URLSearchParams({ ...range, format: 'csv' });
    return apiUrl(`/api/admin/reports/${type}?${params.toString()}`);
  };

  return (
    <>
      <PageHeader
        title="Reports"
        description="Built from real activity in the selected date range. Export as CSV for sharing."
        actions={
          <>
            <DateRangePicker value={range} onChange={setRange} />
            <a href={exportUrl()} download>
              <AdminButton variant="primary">
                <Download className="h-4 w-4" aria-hidden="true" />
                Export CSV
              </AdminButton>
            </a>
          </>
        }
      />

      <div className="mb-5 flex flex-wrap gap-1 rounded-lg border border-slate-800 bg-slate-950 p-1">
        {REPORTS.map((report) => (
          <button
            key={report.value}
            type="button"
            onClick={() => setType(report.value)}
            aria-pressed={type === report.value}
            className={cn(
              'rounded-md px-3 py-2 text-sm font-medium transition-colors',
              type === report.value
                ? 'bg-slate-800 text-slate-100'
                : 'text-slate-400 hover:text-slate-200',
            )}
          >
            {report.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <Panel>
          <AdminLoading label="Building report" />
        </Panel>
      ) : isError ? (
        <Panel>
          <AdminErrorState message="This report could not be built." onRetry={refetch} />
        </Panel>
      ) : (
        <ReportView report={data.report} />
      )}
    </>
  );
}

function ReportView({ report }) {
  return (
    <div className="space-y-5">
      <Panel>
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg font-semibold text-slate-50">{report.title}</h2>
          <p className="text-xs text-slate-500">
            {formatDate(report.range.start)} – {formatDate(report.range.end)}
          </p>
        </div>

        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {report.summary.map((entry) => (
            <div key={entry.label} className="rounded-lg border border-slate-800 bg-slate-900 p-4">
              <dt className="text-xs text-slate-500">{entry.label}</dt>
              <dd className="mt-1.5 truncate text-xl font-semibold tabular-nums text-slate-50">
                {entry.value}
              </dd>
            </div>
          ))}
        </dl>
      </Panel>

      {report.sections.map((section) => (
        <Panel key={section.title} title={section.title} bodyClassName="p-0">
          {!section.rows.length ? (
            <AdminEmptyState
              icon={FileText}
              title="No data in this range"
              description="Try a wider date range once your site has had more visitors."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wide text-slate-500">
                    {section.columns.map((column) => (
                      <th key={column} scope="col" className="px-5 py-3 font-medium">
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {section.rows.map((row, index) => (
                    <tr key={index} className="transition-colors hover:bg-slate-900/60">
                      {row.map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          className={cn(
                            'px-5 py-2.5',
                            cellIndex === 0 ? 'text-slate-200' : 'tabular-nums text-slate-400',
                          )}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      ))}
    </div>
  );
}
