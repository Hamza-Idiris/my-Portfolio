import { Milestone } from 'lucide-react';
import { SimpleResourceManager } from '../../components/admin/SimpleResourceManager.jsx';
import { AdminInput, AdminTextarea, Toggle } from '../../components/admin/AdminPrimitives.jsx';

export default function AdminJourney() {
  return (
    <SimpleResourceManager
      resource="journey"
      title="Development journey"
      description="The timeline shown on the homepage and About page. Use real milestones only."
      itemNoun="Milestone"
      emptyIcon={Milestone}
      emptyDescription="Add the steps that got you to where you are now."
      blank={{ title: '', description: '', period: '', current: false, published: true }}
      renderRow={(entry) => (
        <>
          <p className="text-sm font-medium text-slate-100">
            {entry.title}
            {entry.current ? <span className="ml-2 text-xs text-teal-400">Current</span> : null}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            {entry.period ? `${entry.period} · ` : ''}
            {entry.description}
          </p>
        </>
      )}
      renderForm={(item, patch) => (
        <>
          <AdminInput
            label="Milestone"
            required
            value={item.title}
            onChange={(event) => patch({ title: event.target.value })}
            placeholder="Built Qahwa Shop"
          />
          <AdminInput
            label="Period"
            value={item.period}
            onChange={(event) => patch({ period: event.target.value })}
            hint="Free text, for example 2024, Early 2025 or Now. Leave blank to hide it."
          />
          <AdminTextarea
            label="Description"
            value={item.description}
            onChange={(event) => patch({ description: event.target.value })}
            rows={3}
          />
          <Toggle
            label="Current milestone"
            description="Highlighted with a marker on the timeline."
            checked={item.current}
            onChange={(value) => patch({ current: value })}
          />
          <Toggle
            label="Visible"
            checked={item.published}
            onChange={(value) => patch({ published: value })}
          />
        </>
      )}
    />
  );
}
