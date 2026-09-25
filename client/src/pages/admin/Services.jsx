import { Briefcase } from 'lucide-react';
import { SimpleResourceManager } from '../../components/admin/SimpleResourceManager.jsx';
import { AdminInput, AdminTextarea, Toggle } from '../../components/admin/AdminPrimitives.jsx';

export default function AdminServices() {
  return (
    <SimpleResourceManager
      resource="services"
      title="Services"
      description="What you offer, shown in the What I build section on the homepage."
      itemNoun="Service"
      emptyIcon={Briefcase}
      emptyDescription="Describe the kinds of work you take on."
      blank={{ title: '', description: '', detailedDescription: '', icon: 'Code2', published: true }}
      renderRow={(service) => (
        <>
          <p className="text-sm font-medium text-slate-100">{service.title}</p>
          {service.description ? (
            <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{service.description}</p>
          ) : null}
        </>
      )}
      renderForm={(item, patch) => (
        <>
          <AdminInput
            label="Title"
            required
            value={item.title}
            onChange={(event) => patch({ title: event.target.value })}
            placeholder="Full Stack Web Development"
          />
          <AdminTextarea
            label="Short description"
            value={item.description}
            onChange={(event) => patch({ description: event.target.value })}
            rows={3}
          />
          <AdminTextarea
            label="Detailed description"
            value={item.detailedDescription}
            onChange={(event) => patch({ detailedDescription: event.target.value })}
            rows={4}
            hint="Optional, for future use on a dedicated services page."
          />
          <AdminInput
            label="Icon"
            value={item.icon}
            onChange={(event) => patch({ icon: event.target.value })}
            hint="A lucide.dev icon name, for example Layers, Server, Database or Smartphone."
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
