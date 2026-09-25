import { useEffect, useState } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import { useAdminSettings } from '../../hooks/useAdminResource.js';
import {
  AdminButton,
  AdminErrorState,
  AdminInput,
  AdminLoading,
  AdminTextarea,
  PageHeader,
  Panel,
  Toggle,
  inputClasses,
  useSaveFeedback,
} from '../../components/admin/AdminPrimitives.jsx';
import { ImageUploader } from '../../components/admin/ImageUploader.jsx';

export default function AdminProfile() {
  const { settings, isLoading, isError, save } = useAdminSettings();
  const [form, setForm] = useState(null);
  const { notify, element: toast } = useSaveFeedback();

  useEffect(() => {
    if (settings) {
      setForm({
        profile: { ...settings.profile },
        socialLinks: settings.socialLinks?.length ? [...settings.socialLinks] : [],
      });
    }
  }, [settings]);

  if (isLoading || !form) return <AdminLoading label="Loading profile" />;
  if (isError) return <AdminErrorState message="Your profile could not be loaded." />;

  const setProfile = (field) => (event) => {
    const value = event?.target ? event.target.value : event;
    setForm((previous) => ({ ...previous, profile: { ...previous.profile, [field]: value } }));
  };

  const setLink = (index, patch) =>
    setForm((previous) => ({
      ...previous,
      socialLinks: previous.socialLinks.map((link, position) =>
        position === index ? { ...link, ...patch } : link,
      ),
    }));

  const handleSubmit = (event) => {
    event.preventDefault();
    save.mutate(
      {
        profile: form.profile,
        socialLinks: form.socialLinks.filter((link) => link.url && link.label && link.platform),
      },
      {
        onSuccess: () => notify('Profile saved'),
        onError: (error) => notify(error.message, 'error'),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <PageHeader
        title="Profile"
        description="This is the content visitors read across the homepage, About page and footer."
        actions={
          <AdminButton type="submit" variant="primary" loading={save.isPending}>
            <Save className="h-4 w-4" aria-hidden="true" />
            Save changes
          </AdminButton>
        }
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Panel title="Identity">
            <div className="grid gap-4 sm:grid-cols-2">
              <AdminInput label="Name" value={form.profile.name} onChange={setProfile('name')} />
              <AdminInput
                label="Professional title"
                value={form.profile.title}
                onChange={setProfile('title')}
              />
              <AdminInput
                className="sm:col-span-2"
                label="Tagline"
                value={form.profile.tagline}
                onChange={setProfile('tagline')}
                hint="The headline statement in the hero."
              />
              <AdminInput label="Location" value={form.profile.location} onChange={setProfile('location')} />
              <AdminInput
                label="Public email"
                type="email"
                value={form.profile.email}
                onChange={setProfile('email')}
                hint="Shown on the site. Separate from your sign-in email."
              />
            </div>
          </Panel>

          <Panel title="About content" description="Used on the homepage preview and the About page">
            <div className="space-y-4">
              <AdminTextarea
                label="Short bio"
                value={form.profile.shortBio}
                onChange={setProfile('shortBio')}
                rows={3}
                hint="Shown under the tagline in the hero."
              />
              <AdminTextarea
                label="Full bio"
                value={form.profile.bio}
                onChange={setProfile('bio')}
                rows={7}
                hint="Blank lines start a new paragraph."
              />
              <AdminTextarea
                label="What I build"
                value={form.profile.whatIBuild}
                onChange={setProfile('whatIBuild')}
                rows={4}
              />
              <AdminTextarea
                label="Development philosophy"
                value={form.profile.philosophy}
                onChange={setProfile('philosophy')}
                rows={5}
              />
              <AdminTextarea
                label="Current focus"
                value={form.profile.currentFocus}
                onChange={setProfile('currentFocus')}
                rows={3}
              />
              <AdminTextarea
                label="Future goals"
                value={form.profile.futureGoals}
                onChange={setProfile('futureGoals')}
                rows={3}
              />
            </div>
          </Panel>

          <Panel
            title="Social links"
            description="Shown in the hero, footer, contact page and About page"
            actions={
              <AdminButton
                size="sm"
                onClick={() =>
                  setForm((previous) => ({
                    ...previous,
                    socialLinks: [
                      ...previous.socialLinks,
                      { platform: '', label: '', url: '', order: previous.socialLinks.length },
                    ],
                  }))
                }
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                Add link
              </AdminButton>
            }
          >
            {!form.socialLinks.length ? (
              <p className="text-sm text-slate-500">No links added.</p>
            ) : (
              <ul className="space-y-3">
                {form.socialLinks.map((link, index) => (
                  <li key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={link.platform}
                      onChange={(event) => setLink(index, { platform: event.target.value })}
                      placeholder="github"
                      aria-label="Platform key"
                      className={`${inputClasses} sm:max-w-[130px]`}
                    />
                    <input
                      type="text"
                      value={link.label}
                      onChange={(event) => setLink(index, { label: event.target.value })}
                      placeholder="GitHub"
                      aria-label="Link label"
                      className={`${inputClasses} sm:max-w-[150px]`}
                    />
                    <input
                      type="url"
                      value={link.url}
                      onChange={(event) => setLink(index, { url: event.target.value })}
                      placeholder="https://github.com/..."
                      aria-label="Link URL"
                      className={inputClasses}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setForm((previous) => ({
                          ...previous,
                          socialLinks: previous.socialLinks.filter((_, position) => position !== index),
                        }))
                      }
                      aria-label="Remove link"
                      className="shrink-0 px-1 text-slate-600 transition-colors hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 text-xs text-slate-500">
              The platform key selects the icon. Use github, linkedin or email for built-in icons.
            </p>
          </Panel>
        </div>

        <div className="space-y-5">
          <Panel title="Profile image">
            <ImageUploader
              label="Photo"
              folder="profile"
              hint="A clear headshot works best. Leave empty to show a typographic placeholder."
              value={form.profile.avatarUrl}
              onChange={(url, storageId) =>
                setForm((previous) => ({
                  ...previous,
                  profile: { ...previous.profile, avatarUrl: url, avatarStorageId: storageId || '' },
                }))
              }
            />
          </Panel>

          <Panel title="Availability">
            <div className="space-y-4">
              <Toggle
                label="Show availability"
                description="Displays the status pill in the hero and on the contact page."
                checked={form.profile.availabilityEnabled}
                onChange={(value) => setProfile('availabilityEnabled')(value)}
              />
              <AdminInput
                label="Status text"
                value={form.profile.availability}
                onChange={setProfile('availability')}
                placeholder="Open to opportunities"
              />
              <AdminTextarea
                label="Currently building"
                value={form.profile.currentlyBuilding}
                onChange={setProfile('currentlyBuilding')}
                rows={3}
                hint="Shown in the Currently building section on the homepage. Leave blank to hide it."
              />
            </div>
          </Panel>
        </div>
      </div>

      {toast}
    </form>
  );
}
