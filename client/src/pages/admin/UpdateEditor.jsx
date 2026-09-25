import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Eye, Save } from 'lucide-react';
import { useAdminItem, useAdminResource } from '../../hooks/useAdminResource.js';
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
  useSaveFeedback,
} from '../../components/admin/AdminPrimitives.jsx';
import { ListEditor } from '../../components/admin/ListEditor.jsx';
import { ImageUploader } from '../../components/admin/ImageUploader.jsx';
import { Markdown } from '../../components/public/Markdown.jsx';

const CATEGORIES = [
  'Development',
  'Projects',
  'Learning',
  'Career',
  'Technology',
  'Lessons Learned',
].map((value) => ({ value, label: value }));

const EMPTY_POST = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  coverImage: '',
  coverImageAlt: '',
  category: 'Development',
  tags: [],
  published: false,
  featured: false,
  seoTitle: '',
  seoDescription: '',
};

export default function UpdateEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;
  const [form, setForm] = useState(EMPTY_POST);
  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState(false);
  const { notify, element: toast } = useSaveFeedback();

  const { data, isLoading, isError } = useAdminItem('updates', id);
  const { create, update } = useAdminResource('updates', { limit: 100 });

  useEffect(() => {
    if (data?.item) setForm({ ...EMPTY_POST, ...data.item });
  }, [data]);

  const set = (field) => (event) => {
    const value = event?.target ? event.target.value : event;
    setForm((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: undefined }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setErrors({});

    const { _id, createdAt, updatedAt, __v, readingTime, author, publishedAt, ...payload } = form;
    const mutation = isNew ? create : update;

    mutation.mutate(isNew ? payload : { id, ...payload }, {
      onSuccess: (result) => {
        notify(isNew ? 'Update created' : 'Changes saved');
        if (isNew) navigate(`/admin/updates/${result.item._id}`, { replace: true });
      },
      onError: (error) => {
        if (error.details) {
          setErrors(Object.fromEntries(error.details.map((detail) => [detail.field, detail.message])));
        }
        notify(error.message, 'error');
      },
    });
  };

  if (!isNew && isLoading) return <AdminLoading label="Loading update" />;
  if (!isNew && isError) return <AdminErrorState message="This update could not be loaded." />;

  const saving = create.isPending || update.isPending;
  const wordCount = form.content.trim().split(/\s+/).filter(Boolean).length;

  return (
    <form onSubmit={handleSubmit}>
      <PageHeader
        title={isNew ? 'New update' : form.title || 'Edit update'}
        description={
          isNew ? 'Write about what you built, broke and learned.' : `Public URL: /updates/${form.slug}`
        }
        actions={
          <>
            <Link to="/admin/updates">
              <AdminButton variant="ghost">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Back
              </AdminButton>
            </Link>
            <AdminButton
              variant="outline"
              onClick={() => setPreview((value) => !value)}
              aria-pressed={preview}
            >
              <Eye className="h-4 w-4" aria-hidden="true" />
              {preview ? 'Edit' : 'Preview'}
            </AdminButton>
            <AdminButton type="submit" variant="primary" loading={saving}>
              <Save className="h-4 w-4" aria-hidden="true" />
              {isNew ? 'Create update' : 'Save changes'}
            </AdminButton>
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Panel title="Content">
            <div className="space-y-4">
              <AdminInput
                label="Title"
                required
                value={form.title}
                onChange={set('title')}
                error={errors.title}
                placeholder="What I learned building a kitchen display system"
              />
              <AdminInput
                label="URL slug"
                value={form.slug}
                onChange={set('slug')}
                hint="Leave blank to generate one from the title."
              />
              <AdminTextarea
                label="Excerpt"
                value={form.excerpt}
                onChange={set('excerpt')}
                rows={3}
                hint="Shown on cards and in search results."
              />

              {preview ? (
                <div className="rounded-lg border border-slate-800 bg-slate-900 p-5">
                  <p className="mb-4 text-xs uppercase tracking-wide text-slate-500">Preview</p>
                  <Markdown content={form.content} />
                </div>
              ) : (
                <AdminTextarea
                  label="Body"
                  value={form.content}
                  onChange={set('content')}
                  rows={20}
                  className="font-mono"
                  hint={`Markdown supported: headings, lists, links, quotes and code blocks. ${wordCount} words.`}
                />
              )}
            </div>
          </Panel>
        </div>

        <div className="space-y-5">
          <Panel title="Publishing">
            <div className="space-y-5">
              <Toggle
                label="Published"
                description="Drafts are invisible on the public site."
                checked={form.published}
                onChange={(value) => setForm((previous) => ({ ...previous, published: value }))}
              />
              <Toggle
                label="Featured"
                checked={form.featured}
                onChange={(value) => setForm((previous) => ({ ...previous, featured: value }))}
              />
            </div>
          </Panel>

          <Panel title="Classification">
            <div className="space-y-4">
              <AdminSelect
                label="Category"
                value={form.category}
                onChange={set('category')}
                options={CATEGORIES}
              />
              <ListEditor
                label="Tags"
                value={form.tags}
                onChange={set('tags')}
                placeholder="mongodb"
              />
            </div>
          </Panel>

          <Panel title="Cover image">
            <ImageUploader
              label="Cover"
              folder="updates"
              value={form.coverImage}
              alt={form.coverImageAlt}
              onChange={(url) => setForm((previous) => ({ ...previous, coverImage: url }))}
              onAltChange={(alt) => setForm((previous) => ({ ...previous, coverImageAlt: alt }))}
            />
          </Panel>

          <Panel title="SEO">
            <div className="space-y-4">
              <AdminInput label="SEO title" value={form.seoTitle} onChange={set('seoTitle')} />
              <AdminTextarea
                label="SEO description"
                value={form.seoDescription}
                onChange={set('seoDescription')}
                rows={3}
              />
            </div>
          </Panel>
        </div>
      </div>

      {toast}
    </form>
  );
}
