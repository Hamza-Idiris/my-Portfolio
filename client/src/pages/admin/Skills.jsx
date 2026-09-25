import { Sparkles } from 'lucide-react';
import { SimpleResourceManager } from '../../components/admin/SimpleResourceManager.jsx';
import {
  AdminInput,
  AdminSelect,
  AdminTextarea,
  Toggle,
} from '../../components/admin/AdminPrimitives.jsx';

const CATEGORIES = ['Frontend', 'Backend', 'Database', 'Mobile', 'Tools', 'Other'].map((value) => ({
  value,
  label: value,
}));

export default function AdminSkills() {
  return (
    <SimpleResourceManager
      resource="skills"
      title="Skills"
      description="Only list technologies you have actually used. These appear in the Tech stack section."
      itemNoun="Skill"
      emptyIcon={Sparkles}
      emptyDescription="Add the technologies you work with so they appear on the site."
      blank={{ name: '', category: 'Frontend', description: '', published: true, primary: false }}
      groupBy={(skill) => skill.category || 'Other'}
      renderRow={(skill) => (
        <>
          <p className="text-sm font-medium text-slate-100">
            {skill.name}
            {skill.primary ? <span className="ml-2 text-xs text-teal-400">Primary</span> : null}
          </p>
          {skill.description ? (
            <p className="mt-0.5 text-xs text-slate-500">{skill.description}</p>
          ) : null}
        </>
      )}
      renderForm={(item, patch) => (
        <>
          <AdminInput
            label="Name"
            required
            value={item.name}
            onChange={(event) => patch({ name: event.target.value })}
            placeholder="React"
          />
          <AdminSelect
            label="Category"
            value={item.category}
            onChange={(event) => patch({ category: event.target.value })}
            options={CATEGORIES}
          />
          <AdminTextarea
            label="Description"
            value={item.description}
            onChange={(event) => patch({ description: event.target.value })}
            rows={2}
            hint="Optional. Shown as a tooltip."
          />
          <Toggle
            label="Primary technology"
            description="Highlighted in the tech stack section."
            checked={item.primary}
            onChange={(value) => patch({ primary: value })}
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
