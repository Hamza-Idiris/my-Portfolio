import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CheckCircle2, Mail, Send } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '../../components/ui/BrandIcons.jsx';
import { api, ApiError } from '../../lib/api.js';
import { applySeo } from '../../lib/seo.js';
import { Section } from '../../components/ui/Section.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { SelectField, TextArea, TextField } from '../../components/ui/Field.jsx';
import { fadeUp, staggerChildren } from '../../lib/motion.js';
import { findSocial, useSiteSettings } from '../../hooks/useSiteSettings.js';
import { trackEvent } from '../../lib/analytics.js';

const PROJECT_TYPES = [
  { value: '', label: 'Not sure yet' },
  { value: 'Web application', label: 'Web application' },
  { value: 'Mobile application', label: 'Mobile application' },
  { value: 'API / backend', label: 'API / backend' },
  { value: 'Admin dashboard', label: 'Admin dashboard' },
  { value: 'Job opportunity', label: 'Job opportunity' },
  { value: 'Other', label: 'Other' },
];

const BUDGETS = [
  { value: '', label: 'Prefer not to say' },
  { value: 'Under $500', label: 'Under $500' },
  { value: '$500 – $2,000', label: '$500 – $2,000' },
  { value: '$2,000 – $5,000', label: '$2,000 – $5,000' },
  { value: 'Over $5,000', label: 'Over $5,000' },
];

const TIMELINES = [
  { value: '', label: 'Flexible' },
  { value: 'As soon as possible', label: 'As soon as possible' },
  { value: 'Within a month', label: 'Within a month' },
  { value: 'One to three months', label: 'One to three months' },
  { value: 'Just exploring', label: 'Just exploring' },
];

const EMPTY_FORM = {
  name: '',
  email: '',
  subject: '',
  message: '',
  projectType: '',
  budget: '',
  timeline: '',
  website: '',
};

export default function Contact() {
  const { settings } = useSiteSettings();
  const { profile, socialLinks, contact } = settings;
  const [form, setForm] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [showOptional, setShowOptional] = useState(false);

  const email = contact.email || profile.email;
  const github = findSocial(socialLinks, 'github');
  const linkedin = findSocial(socialLinks, 'linkedin');

  useEffect(() => {
    applySeo({
      title: 'Contact',
      description:
        'Get in touch with Hamza Idiris about a role, a project, or a question about something he has built.',
      path: '/contact',
    });
    trackEvent('contact_form_open');
  }, []);

  const mutation = useMutation({
    mutationFn: (payload) => api.post('/api/contact', payload),
    onSuccess: () => {
      setForm(EMPTY_FORM);
      setFieldErrors({});
    },
    onError: (error) => {
      if (error instanceof ApiError && error.details) {
        setFieldErrors(
          Object.fromEntries(error.details.map((detail) => [detail.field, detail.message])),
        );
      }
    },
  });

  const update = (field) => (event) => {
    setForm((previous) => ({ ...previous, [field]: event.target.value }));
    setFieldErrors((previous) => ({ ...previous, [field]: undefined }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    mutation.mutate(form);
  };

  if (mutation.isSuccess) {
    return (
      <Section className="pt-20">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerChildren(0.08)}
          className="surface mx-auto max-w-xl rounded-2xl px-6 py-14 text-center sm:px-10"
        >
          <motion.span
            variants={fadeUp}
            className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-accent-500/10 text-accent-300"
          >
            <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
          </motion.span>
          <motion.h1 variants={fadeUp} className="text-2xl">
            Message sent
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-3 leading-relaxed text-ink-400">
            Thank you for getting in touch. A confirmation has been sent to your inbox.
            {contact.responseTime ? ` ${contact.responseTime}` : ''}
          </motion.p>
          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap justify-center gap-3">
            <Button to="/projects" variant="secondary">
              Browse my projects
            </Button>
            <Button variant="ghost" onClick={() => mutation.reset()}>
              Send another message
            </Button>
          </motion.div>
        </motion.div>
      </Section>
    );
  }

  return (
    <Section className="pt-16 sm:pt-20">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerChildren(0.07)}
        className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16"
      >
        <div>
          <motion.p
            variants={fadeUp}
            className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-accent-400"
          >
            Contact
          </motion.p>
          <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl">
            Let&rsquo;s talk
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-5 leading-relaxed text-ink-400">
            {contact.intro ||
              'Whether it is a role, a project or a question about something I have built, this reaches me directly.'}
          </motion.p>

          <motion.ul variants={fadeUp} className="mt-8 space-y-3">
            {email ? (
              <li>
                <a
                  href={`mailto:${email}`}
                  onClick={() => trackEvent('email_click', { meta: { location: 'contact' } })}
                  className="inline-flex items-center gap-2.5 text-sm text-ink-300 transition-colors hover:text-ink-50"
                >
                  <Mail className="h-4 w-4 text-ink-500" aria-hidden="true" />
                  {email}
                </a>
              </li>
            ) : null}
            {github ? (
              <li>
                <a
                  href={github.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent('github_click', { meta: { location: 'contact' } })}
                  className="inline-flex items-center gap-2.5 text-sm text-ink-300 transition-colors hover:text-ink-50"
                >
                  <GithubIcon className="h-4 w-4 text-ink-500" />
                  {github.label}
                </a>
              </li>
            ) : null}
            {linkedin ? (
              <li>
                <a
                  href={linkedin.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent('linkedin_click', { meta: { location: 'contact' } })}
                  className="inline-flex items-center gap-2.5 text-sm text-ink-300 transition-colors hover:text-ink-50"
                >
                  <LinkedinIcon className="h-4 w-4 text-ink-500" />
                  {linkedin.label}
                </a>
              </li>
            ) : null}
          </motion.ul>

          {profile.availabilityEnabled && profile.availability ? (
            <motion.p
              variants={fadeUp}
              className="mt-8 inline-flex items-center gap-2 rounded-full border border-accent-500/25 bg-accent-500/[0.07] px-3 py-1.5 text-xs font-medium text-accent-300"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-accent-400" aria-hidden="true" />
              {profile.availability}
            </motion.p>
          ) : null}
        </div>

        <motion.div variants={fadeUp}>
          {contact.formEnabled === false ? (
            <div className="surface rounded-2xl p-6 text-center sm:p-8">
              <h2 className="text-lg">The contact form is closed right now</h2>
              <p className="mt-2 text-sm text-ink-400">
                {email ? `Please email ${email} instead.` : 'Please try again later.'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="surface rounded-2xl p-6 sm:p-8">
              {mutation.isError ? (
                <div
                  role="alert"
                  className="mb-6 rounded-lg border border-red-500/25 bg-red-500/[0.07] px-4 py-3 text-sm text-red-200"
                >
                  {mutation.error?.message || 'Your message could not be sent. Please try again.'}
                </div>
              ) : null}

              <div className="grid gap-5 sm:grid-cols-2">
                <TextField
                  label="Name"
                  name="name"
                  autoComplete="name"
                  required
                  value={form.name}
                  onChange={update('name')}
                  error={fieldErrors.name}
                  placeholder="Your name"
                />
                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={update('email')}
                  error={fieldErrors.email}
                  placeholder="you@example.com"
                />
              </div>

              <TextField
                className="mt-5"
                label="Subject"
                name="subject"
                value={form.subject}
                onChange={update('subject')}
                error={fieldErrors.subject}
                placeholder="What is this about?"
              />

              <TextArea
                className="mt-5"
                label="Message"
                name="message"
                required
                rows={6}
                value={form.message}
                onChange={update('message')}
                error={fieldErrors.message}
                placeholder="Tell me about the role, the project, or what you would like to build."
              />

              <div className="mt-5">
                <button
                  type="button"
                  onClick={() => setShowOptional((value) => !value)}
                  aria-expanded={showOptional}
                  className="text-left text-sm text-ink-500 underline underline-offset-4 transition-colors hover:text-ink-300"
                >
                  {showOptional ? 'Hide project details' : 'Add project details (optional)'}
                </button>
              </div>

              {showOptional ? (
                <div className="mt-5 grid gap-5 sm:grid-cols-3">
                  <SelectField
                    label="Project type"
                    name="projectType"
                    value={form.projectType}
                    onChange={update('projectType')}
                    options={PROJECT_TYPES}
                  />
                  <SelectField
                    label="Budget"
                    name="budget"
                    value={form.budget}
                    onChange={update('budget')}
                    options={BUDGETS}
                  />
                  <SelectField
                    label="Timeline"
                    name="timeline"
                    value={form.timeline}
                    onChange={update('timeline')}
                    options={TIMELINES}
                  />
                </div>
              ) : null}

              {/* Honeypot: hidden from people, tempting to bots. */}
              <div className="absolute h-0 w-0 overflow-hidden" aria-hidden="true">
                <label htmlFor="website">Website</label>
                <input
                  id="website"
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={form.website}
                  onChange={update('website')}
                />
              </div>

              <div className="mt-8 pt-2">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full sm:w-auto"
                  loading={mutation.isPending}
                >
                  {!mutation.isPending ? <Send className="h-4 w-4" aria-hidden="true" /> : null}
                  {mutation.isPending ? 'Sending' : 'Send message'}
                </Button>
              </div>

              <p className="mt-4 text-xs leading-relaxed text-ink-600">
                Your message is stored so Hamza can reply, and is never shared or used for anything
                else.
              </p>
            </form>
          )}
        </motion.div>
      </motion.div>
    </Section>
  );
}
