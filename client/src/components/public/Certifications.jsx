import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, ExternalLink, Calendar, CheckCircle2, X, FileText, ShieldCheck } from 'lucide-react';
import { Section, SectionHeader } from '../ui/Section.jsx';
import { Badge } from '../ui/Badge.jsx';
import { Button } from '../ui/Button.jsx';
import { fadeUp, revealOnScroll, staggerChildren } from '../../lib/motion.js';
import { resolveMediaUrl } from '../../lib/api.js';

function CertificationModal({ cert, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (!cert) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-ink-950/80 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-[var(--hairline-strong)] bg-ink-900 shadow-2xl shadow-black/80 z-10 my-auto"
      >
        {/* Header decoration */}
        <div className="h-2 w-full bg-gradient-to-r from-accent-500 via-teal-400 to-accent-600" />

        <div className="p-6 sm:p-8">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-ink-800/80 text-ink-300 transition-colors hover:bg-ink-700 hover:text-ink-50"
            aria-label="Close details"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {cert.image ? (
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-[var(--hairline)] bg-ink-850 p-1 shadow-md">
                <img
                  src={resolveMediaUrl(cert.image)}
                  alt={cert.title}
                  className="h-full w-full rounded-lg object-cover"
                />
              </div>
            ) : (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-accent-500/10 text-accent-300 border border-accent-500/20">
                <Award className="h-10 w-10" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-xs font-mono text-accent-400 mb-1">
                <ShieldCheck className="h-4 w-4" />
                <span>Verified Credential</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-ink-50">
                {cert.title}
              </h2>

              <p className="mt-1 text-sm font-medium text-ink-300">{cert.issuer}</p>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-400 font-mono">
                {cert.issueDate ? (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-accent-400" /> Issued: {cert.issueDate}
                  </span>
                ) : null}
                {cert.expirationDate ? (
                  <span className="text-ink-500">• {cert.expirationDate}</span>
                ) : null}
              </div>

              {cert.credentialId ? (
                <div className="mt-2 text-xs font-mono text-ink-400 bg-ink-850/80 inline-block px-2.5 py-1 rounded-md border border-[var(--hairline)]">
                  ID: <span className="text-ink-200">{cert.credentialId}</span>
                </div>
              ) : null}
            </div>
          </div>

          {cert.description ? (
            <div className="mt-6 pt-6 border-t border-[var(--hairline)]">
              <h3 className="text-xs font-mono uppercase tracking-wider text-ink-400 mb-2">
                Overview & Achievements
              </h3>
              <p className="text-sm leading-relaxed text-ink-200 whitespace-pre-line">
                {cert.description}
              </p>
            </div>
          ) : null}

          {cert.skills?.length ? (
            <div className="mt-6 pt-6 border-t border-[var(--hairline)]">
              <h3 className="text-xs font-mono uppercase tracking-wider text-ink-400 mb-3">
                Skills & Technologies Verified
              </h3>
              <div className="flex flex-wrap gap-2">
                {cert.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--hairline)] bg-ink-850 px-3 py-1 font-mono text-xs text-accent-300"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-teal-400" />
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-8 pt-6 border-t border-[var(--hairline)] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {cert.credentialUrl ? (
                <a
                  href={cert.credentialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-accent-500 hover:bg-accent-400 text-ink-950 px-4 py-2.5 text-sm font-semibold transition-colors shadow-lg shadow-accent-500/20"
                >
                  Verify Certificate
                  <ExternalLink className="h-4 w-4" />
                </a>
              ) : null}

              {cert.pdfUrl ? (
                <a
                  href={cert.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-[var(--hairline)] bg-ink-800 hover:bg-ink-750 text-ink-100 px-4 py-2.5 text-sm font-medium transition-colors"
                >
                  <FileText className="h-4 w-4 text-accent-400" />
                  View PDF
                </a>
              ) : null}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-xs text-ink-400 hover:text-ink-200 transition-colors ml-auto"
            >
              Close window
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function CertificationCard({ cert, onSelect }) {
  return (
    <motion.article
      variants={fadeUp}
      onClick={() => onSelect(cert)}
      className="group surface relative cursor-pointer overflow-hidden rounded-[var(--radius-card)] p-6 transition-all duration-300 hover:border-[var(--hairline-strong)] hover:shadow-xl hover:shadow-accent-500/5 flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between gap-4 mb-4">
          {cert.image ? (
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-[var(--hairline)] bg-ink-850 p-1 group-hover:scale-105 transition-transform">
              <img
                src={resolveMediaUrl(cert.image)}
                alt={cert.title}
                className="h-full w-full rounded-lg object-cover"
              />
            </div>
          ) : (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-500/10 text-accent-300 border border-accent-500/20 group-hover:bg-accent-500/20 transition-colors">
              <Award className="h-6 w-6" />
            </div>
          )}

          {cert.issueDate ? (
            <span className="font-mono text-xs text-ink-400 bg-ink-850 px-2.5 py-1 rounded-md border border-[var(--hairline)]">
              {cert.issueDate}
            </span>
          ) : null}
        </div>

        <h3 className="text-lg font-semibold tracking-tight text-ink-50 group-hover:text-accent-300 transition-colors">
          {cert.title}
        </h3>
        <p className="mt-1 text-sm text-ink-300 font-medium">{cert.issuer}</p>

        {cert.description ? (
          <p className="mt-3 text-sm text-ink-400 line-clamp-2 leading-relaxed">
            {cert.description}
          </p>
        ) : null}
      </div>

      <div className="mt-6 pt-4 border-t border-[var(--hairline)]">
        {cert.skills?.length ? (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {cert.skills.slice(0, 3).map((skill) => (
              <span
                key={skill}
                className="rounded-md border border-[var(--hairline)] bg-ink-850 px-2 py-0.5 font-mono text-[11px] text-ink-400"
              >
                {skill}
              </span>
            ))}
            {cert.skills.length > 3 ? (
              <span className="font-mono text-[11px] text-ink-500 px-1">
                +{cert.skills.length - 3}
              </span>
            ) : null}
          </div>
        ) : null}

        <div className="flex items-center justify-between text-xs font-medium text-accent-400 group-hover:text-accent-300">
          <span>Click to view full credential</span>
          <span className="font-mono transition-transform duration-200 group-hover:translate-x-1">→</span>
        </div>
      </div>
    </motion.article>
  );
}

export function Certifications({ certifications = [] }) {
  const [selected, setSelected] = useState(null);

  if (!certifications.length) return null;

  return (
    <Section id="certifications" className="border-t border-[var(--hairline)]">
      <SectionHeader
        eyebrow="Certifications & Qualifications"
        title="Verified Skills & Credentials"
        description="Formal certifications, badges, and technical qualifications acquired across full-stack web and mobile development."
      />

      <motion.div
        {...revealOnScroll}
        variants={staggerChildren(0.08)}
        className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {certifications.map((cert) => (
          <CertificationCard key={cert._id || cert.title} cert={cert} onSelect={setSelected} />
        ))}
      </motion.div>

      <AnimatePresence>
        {selected ? (
          <CertificationModal cert={selected} onClose={() => setSelected(null)} />
        ) : null}
      </AnimatePresence>
    </Section>
  );
}
