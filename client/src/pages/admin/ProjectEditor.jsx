import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Save, Trash2 } from 'lucide-react';
import { useAdminItem, useAdminResource, useUpload } from '../../hooks/useAdminResource.js';
import {
  AdminButton,
  AdminErrorState,
  AdminInput,
  AdminLoading,
  AdminSelect,
  AdminTextarea,
  PageHeader,
  Panel,
  Toggle,
  inputClasses,
  useSaveFeedback,
} from '../../components/admin/AdminPrimitives.jsx';
import { ListEditor } from '../../components/admin/ListEditor.jsx';
import { ImageUploader } from '../../components/admin/ImageUploader.jsx';

const STATUS_OPTIONS = [
  { value: 'completed', label: 'Completed' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'planned', label: 'Planned' },
  { value: 'archived', label: 'Archived' },
];

const CATEGORY_OPTIONS = [
  { value: 'Web', label: 'Web' },
  { value: 'Mobile', label: 'Mobile' },
  { value: 'API', label: 'API' },
  { value: 'Full Stack', label: 'Full Stack' },
  { value: 'Other', label: 'Other' },
];

const TECH_SUGGESTIONS = [
  'React',
  'Node.js',
  'Express.js',
  'MongoDB',
  'Flutter',
  'Dart',
  'JavaScript',
  'Tailwind CSS',
  'JWT',
  'REST APIs',
];

const EMPTY_PROJECT = {
  title: '',
  slug: '',
  tagline: '',
  shortDescription: '',
  fullDescription: '',
  problem: '',
  solution: '',
  architecture: '',
  process: '',
  outcome: '',
  features: [],
  challenges: [],
  lessonsLearned: [],
  technologies: [],
  users: [],
  category: 'Web',
  status: 'completed',
  coverImage: '',
  coverImageAlt: '',
  screenshots: [],
  videoUrl: '',
  githubUrl: '',
  liveUrl: '',
  featured: false,
  published: false,
  year: '',
  seoTitle: '',
  seoDescription: '',
};

const TABS = [
  { id: 'basics', label: 'Basics' },
  { id: 'story', label: 'Case study' },
  { id: 'media', label: 'Media' },
  { id: 'seo', label: 'SEO & publishing' },
];

function ScreenshotEditor({ screenshots, onChange }) {
  const upload = useUpload();

  const addFromFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    upload.mutate(
      { file, folder: 'projects' },
      {
        onSuccess: (result) =>
          onChange([...screenshots, { url: result.url, storageId: result.storageId, alt: '', caption: '' }]),
      },
    );
    event.target.value = '';
  };

  const updateAt = (index, patch) =>
    onChange(screenshots.map((shot, position) => (position === index ? { ...shot, ...patch } : shot)));

  return (
    <div className="space-y-4">
      {screenshots.map((shot, index) => (
        <div key={`${shot.url}-${index}`} className="rounded-lg border border-slate-800 bg-slate-900 p-3">
          <div className="flex gap-3">
            <img
              src={shot.url}
              alt={shot.alt || ''}
              className="h-20 w-28 shrink-0 rounded-md object-cover"
            />
            <div className="min-w-0 flex-1 space-y-2">
              <input
                type="text"
                value={shot.alt || ''}
                onChange={(event) => updateAt(index, { alt: event.target.value })}
                placeholder="Alt text"
                className={inputClasses}
                aria-label={`Screenshot ${index + 1} alt text`}
              />
              <input
                type="text"
                value={shot.caption || ''}
                onChange={(event) => updateAt(index, { caption: event.target.value })}
                placeholder="Caption (optional)"
                className={inputClasses}
                aria-label={`Screenshot ${index + 1} caption`}
              />
            </div>
            <button
              type="button"
              onClick={() => onChange(screenshots.filter((_, position) => position !== index))}
              aria-label={`Remove screenshot ${index + 1}`}
              className="shrink-0 self-start text-slate-600 transition-colors hover:text-red-400"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}

      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-slate-700 px-4 py-5 text-sm text-slate-500 transition-colors hover:border-slate-600 hover:text-slate-300">
        <Plus className="h-4 w-4" aria-hidden="true" />
        {upload.isPending ? 'Uploading' : 'Add screenshot'}
        <input type="file" accept="image/*" onChange={addFromFile} className="sr-only" />
      </label>
    </div>
  );
}

export default function ProjectEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;
  const [tab, setTab] = useState('basics');
  const [form, setForm] = useState(EMPTY_PROJECT);
  const [errors, setErrors] = useState({});
  const { notify, element: toast } = useSaveFeedback();

  const { data, isLoading, isError } = useAdminItem('projects', id);
  const { create, update } = useAdminResource('projects', { limit: 100 });

  useEffect(() => {
    if (data?.item) setForm({ ...EMPTY_PROJECT, ...data.item });
  }, [data]);

  const set = (field) => (event) => {
    const value = event?.target ? event.target.value : event;
    setForm((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: undefined }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setErrors({});

    const { _id, createdAt, updatedAt, __v, repository, ...payload } = form;
    const mutation = isNew ? create : update;

    mutation.mutate(isNew ? payload : { id, ...payload }, {
      onSuccess: (result) => {
        notify(isNew ? 'Project created' : 'Changes saved');
        if (isNew) navigate(`/admin/projects/${result.item._id}`, { replace: true });
      },
      onError: (error) => {
        if (error.details) {
          setErrors(Object.fromEntries(error.details.map((detail) => [detail.field, detail.message])));
          setTab('basics');
        }
        notify(error.message, 'error');
      },
    });
  };

  if (!isNew && isLoading) return <AdminLoading label="Loading project" />;
  if (!isNew && isError) return <AdminErrorState message="This project could not be loaded." />;

  const saving = create.isPending || update.isPending;

  return (
    <form onSubmit={handleSubmit}>
      <PageHeader
        title={isNew ? 'New project' : form.title || 'Edit project'}
        description={
          isNew
            ? 'Tell the story behind the project, not just the stack it uses.'
            : `Public URL: /projects/${form.slug}`
        }
        actions={
          <>
            <Link to="/admin/projects">
              <AdminButton variant="ghost">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Back
              </AdminButton>
            </Link>
            <AdminButton type="submit" variant="primary" loading={saving}>
              <Save className="h-4 w-4" aria-hidden="true" />
              {isNew ? 'Create project' : 'Save changes'}
            </AdminButton>
          </>
        }
      />

      <div className="mb-5 flex gap-1 overflow-x-auto border-b border-slate-800">
        {TABS.map((entry) => (
          <button
            key={entry.id}
            type="button"
            onClick={() => setTab(entry.id)}
            aria-current={tab === entry.id ? 'page' : undefined}
            className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-sm transition-colors ${
              tab === entry.id
                ? 'border-teal-500 font-medium text-slate-100'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            {entry.label}
          </button>
        ))}
      </div>

      {tab === 'basics' ? (
        <div className="grid gap-5 lg:grid-cols-3">
          <Panel title="Project details" className="lg:col-span-2">
            <div className="space-y-4">
              <AdminInput
                label="Title"
                required
                value={form.title}
                onChange={set('title')}
                error={errors.title}
                placeholder="Qahwa Shop"
              />
              <AdminInput
                label="URL slug"
                value={form.slug}
                onChange={set('slug')}
                error={errors.slug}
                hint="Leave blank to generate one from the title."
                placeholder="qahwa-shop"
              />
              <AdminInput
                label="Tagline"
                value={form.tagline}
                onChange={set('tagline')}
                hint="One short line shown under the title."
                placeholder="Real-time ordering and operations for cafés"
              />
              <AdminTextarea
                label="Short description"
                value={form.shortDescription}
                onChange={set('shortDescription')}
                rows={3}
                hint="Shown on project cards and in search results."
              />
              <AdminTextarea
                label="Full description"
                value={form.fullDescription}
                onChange={set('fullDescription')}
                rows={5}
              />
            </div>
          </Panel>

          <div className="space-y-5">
            <Panel title="Classification">
              <div className="space-y-4">
                <AdminSelect
                  label="Status"
                  value={form.status}
                  onChange={set('status')}
                  options={STATUS_OPTIONS}
                />
                <AdminSelect
                  label="Category"
                  value={form.category}
                  onChange={set('category')}
                  options={CATEGORY_OPTIONS}
                />
                <AdminInput
                  label="Year"
                  value={form.year}
                  onChange={set('year')}
                  placeholder="2025"
                />
              </div>
            </Panel>

            <Panel title="Links">
              <div className="space-y-4">
                <AdminInput
                  label="GitHub repository"
                  type="url"
                  value={form.githubUrl}
                  onChange={set('githubUrl')}
                  error={errors.githubUrl}
                  placeholder="https://github.com/..."
                />
                <AdminInput
                  label="Live demo"
                  type="url"
                  value={form.liveUrl}
                  onChange={set('liveUrl')}
                  error={errors.liveUrl}
                  hint="Leave blank if the project is not deployed. The page will say it is in development instead."
                  placeholder="https://..."
                />
                <AdminInput
                  label="Video / demo URL"
                  type="url"
                  value={form.videoUrl}
                  onChange={set('videoUrl')}
                  error={errors.videoUrl}
                />
              </div>
            </Panel>

            <Panel title="Technologies">
              <ListEditor
                label="Stack"
                value={form.technologies}
                onChange={set('technologies')}
                placeholder="React"
                suggestions={TECH_SUGGESTIONS}
              />
            </Panel>
          </div>
        </div>
      ) : null}

      {tab === 'story' ? (
        <div className="grid gap-5 lg:grid-cols-2">
          <Panel title="The problem" description="What was wrong before this existed?">
            <AdminTextarea
              label="Problem"
              value={form.problem}
              onChange={set('problem')}
              rows={7}
            />
          </Panel>
          <Panel title="The solution" description="How does the product address it?">
            <AdminTextarea
              label="Solution"
              value={form.solution}
              onChange={set('solution')}
              rows={7}
            />
          </Panel>
          <Panel title="The build" description="Architecture and how it came together">
            <div className="space-y-4">
              <AdminTextarea
                label="Architecture"
                value={form.architecture}
                onChange={set('architecture')}
                rows={5}
              />
              <AdminTextarea
                label="Development process"
                value={form.process}
                onChange={set('process')}
                rows={4}
              />
            </div>
          </Panel>
          <Panel title="The outcome" description="What the project achieved">
            <AdminTextarea
              label="Outcome"
              value={form.outcome}
              onChange={set('outcome')}
              rows={5}
              hint="Only describe results you can actually stand behind."
            />
          </Panel>
          <Panel title="Features">
            <ListEditor
              label="Key features"
              value={form.features}
              onChange={set('features')}
              placeholder="Kitchen Display System showing live orders"
            />
          </Panel>
          <Panel title="Users">
            <ListEditor
              label="Who uses it"
              value={form.users}
              onChange={set('users')}
              placeholder="Kitchen staff"
            />
          </Panel>
          <Panel title="Challenges">
            <ListEditor
              label="What was difficult"
              value={form.challenges}
              onChange={set('challenges')}
              placeholder="Keeping four interfaces consistent in real time"
            />
          </Panel>
          <Panel title="Lessons learned">
            <ListEditor
              label="What you took from it"
              value={form.lessonsLearned}
              onChange={set('lessonsLearned')}
              placeholder="Getting the data model right first made everything simpler"
            />
          </Panel>
        </div>
      ) : null}

      {tab === 'media' ? (
        <div className="grid gap-5 lg:grid-cols-2">
          <Panel title="Cover image" description="Used on cards, the case study and social previews">
            <ImageUploader
              label="Cover"
              folder="projects"
              value={form.coverImage}
              alt={form.coverImageAlt}
              onChange={(url) => setForm((previous) => ({ ...previous, coverImage: url }))}
              onAltChange={(alt) => setForm((previous) => ({ ...previous, coverImageAlt: alt }))}
            />
          </Panel>
          <Panel title="Screenshots" description="Shown in the Screens section of the case study">
            <ScreenshotEditor
              screenshots={form.screenshots}
              onChange={(screenshots) => setForm((previous) => ({ ...previous, screenshots }))}
            />
          </Panel>
        </div>
      ) : null}

      {tab === 'seo' ? (
        <div className="grid gap-5 lg:grid-cols-2">
          <Panel title="Search metadata">
            <div className="space-y-4">
              <AdminInput
                label="SEO title"
                value={form.seoTitle}
                onChange={set('seoTitle')}
                hint="Falls back to the project title."
              />
              <AdminTextarea
                label="SEO description"
                value={form.seoDescription}
                onChange={set('seoDescription')}
                rows={3}
                hint="Falls back to the short description. Around 155 characters works best."
              />
            </div>
          </Panel>
          <Panel title="Publishing">
            <div className="space-y-5">
              <Toggle
                label="Published"
                description="Unpublished projects are invisible on the public site."
                checked={form.published}
                onChange={(value) => setForm((previous) => ({ ...previous, published: value }))}
              />
              <Toggle
                label="Featured"
                description="Featured projects appear in the Selected projects section on the homepage."
                checked={form.featured}
                onChange={(value) => setForm((previous) => ({ ...previous, featured: value }))}
              />
            </div>
          </Panel>
        </div>
      ) : null}

      {toast}
    </form>
  );
}
