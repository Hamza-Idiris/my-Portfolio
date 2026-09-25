import { Award } from 'lucide-react';
import { SimpleResourceManager } from '../../components/admin/SimpleResourceManager.jsx';
import { AdminInput, AdminTextarea, Toggle } from '../../components/admin/AdminPrimitives.jsx';
import { ImageUploader } from '../../components/admin/ImageUploader.jsx';

export default function AdminCertifications() {
  return (
    <SimpleResourceManager
      resource="certifications"
      title="Certifications"
      description="Manage professional credentials, degrees, and industry certifications."
      itemNoun="Certification"
      emptyIcon={Award}
      emptyDescription="Add your credentials and achievements to display on your portfolio."
      blank={{
        title: '',
        issuer: '',
        issueDate: '',
        expirationDate: '',
        credentialId: '',
        credentialUrl: '',
        image: '',
        pdfUrl: '',
        description: '',
        skills: [],
        featured: true,
        published: true,
      }}
      renderRow={(cert) => (
        <div className="flex items-center gap-3">
          {cert.image ? (
            <img
              src={cert.image}
              alt={cert.title}
              className="h-10 w-10 shrink-0 rounded-lg object-cover border border-slate-700"
            />
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-500/10 text-teal-400 font-semibold border border-teal-500/20">
              <Award className="h-5 w-5" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-slate-100 truncate">{cert.title}</p>
              {cert.featured ? (
                <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-400 border border-amber-500/20">
                  Featured
                </span>
              ) : null}
            </div>
            <p className="text-xs text-slate-400">
              {cert.issuer} {cert.issueDate ? `• ${cert.issueDate}` : ''}
            </p>
          </div>
        </div>
      )}
      renderForm={(item, patch) => (
        <>
          <AdminInput
            label="Certification Title"
            required
            value={item.title}
            onChange={(event) => patch({ title: event.target.value })}
            placeholder="Meta Full-Stack Engineer Certificate"
          />
          <AdminInput
            label="Issuing Organization"
            required
            value={item.issuer}
            onChange={(event) => patch({ issuer: event.target.value })}
            placeholder="Meta / Coursera"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <AdminInput
              label="Issue Date"
              value={item.issueDate}
              onChange={(event) => patch({ issueDate: event.target.value })}
              placeholder="e.g. May 2024"
            />
            <AdminInput
              label="Expiration Date"
              value={item.expirationDate}
              onChange={(event) => patch({ expirationDate: event.target.value })}
              placeholder="e.g. No Expiration or May 2027"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <AdminInput
              label="Credential ID"
              value={item.credentialId}
              onChange={(event) => patch({ credentialId: event.target.value })}
              placeholder="e.g. FCC-84920"
            />
            <AdminInput
              label="Credential Verification URL"
              value={item.credentialUrl}
              onChange={(event) => patch({ credentialUrl: event.target.value })}
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-300">Certificate Image / Badge</label>
            <ImageUploader
              value={item.image}
              onChange={(url) => patch({ image: url })}
              label="Upload certificate image or enter URL below"
            />
          </div>

          <AdminInput
            label="Image URL (Alternative)"
            value={item.image}
            onChange={(event) => patch({ image: event.target.value })}
            placeholder="https://images.unsplash.com/..."
          />

          <AdminTextarea
            label="Description & Highlights"
            value={item.description}
            onChange={(event) => patch({ description: event.target.value })}
            rows={3}
            placeholder="Brief overview of topics covered and skills demonstrated..."
          />

          <AdminInput
            label="Skills & Technologies (comma-separated)"
            value={Array.isArray(item.skills) ? item.skills.join(', ') : item.skills || ''}
            onChange={(event) =>
              patch({
                skills: event.target.value
                  ? event.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                  : [],
              })
            }
            placeholder="React, Node.js, Express, MongoDB"
          />

          <div className="flex flex-col gap-3 pt-2">
            <Toggle
              label="Featured on Homepage"
              checked={Boolean(item.featured)}
              onChange={(value) => patch({ featured: value })}
            />
            <Toggle
              label="Published (Visible)"
              checked={Boolean(item.published)}
              onChange={(value) => patch({ published: value })}
            />
          </div>
        </>
      )}
    />
  );
}
