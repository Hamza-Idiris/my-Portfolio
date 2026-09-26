import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  ExternalLink,
  Calendar,
  CheckCircle2,
  X,
  FileText,
  ShieldCheck,
  Maximize2,
  Download,
} from 'lucide-react';
import { Section, SectionHeader } from '../ui/Section.jsx';
import { fadeUp, revealOnScroll, staggerChildren } from '../../lib/motion.js';
import { resolveMediaUrl } from '../../lib/api.js';

function isPdfDocument(url) {
  if (!url || typeof url !== 'string') return false;
  const clean = url.toLowerCase().split('?')[0];
  return clean.endsWith('.pdf') || url.includes('/raw/upload/') || url.includes('format=pdf');
}

function CertificationModal({ cert, onClose }) {
  const [showFullPreview, setShowFullPreview] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (showFullPreview) {
          setShowFullPreview(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose, showFullPreview]);

  if (!cert) return null;

  const rawMedia = cert.image || cert.pdfUrl;
  const mediaUrl = rawMedia ? resolveMediaUrl(rawMedia) : null;
  const isPdf = isPdfDocument(cert.pdfUrl || cert.image);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-ink-950/85 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-[var(--hairline-strong)] bg-ink-900 shadow-2xl shadow-black/90 z-10 my-auto max-h-[92vh] flex flex-col"
      >
        {/* Top accent line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-accent-500 via-teal-400 to-accent-600 shrink-0" />

        <div className="overflow-y-auto p-5 sm:p-8 space-y-6">
          {/* Header row */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-xs font-mono text-accent-400 mb-1.5">
                <ShieldCheck className="h-4 w-4 text-accent-400" />
                <span className="uppercase tracking-wider">Verified Credential</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink-50 leading-tight">
                {cert.title}
              </h2>
              <p className="mt-1 text-base font-medium text-ink-300">{cert.issuer}</p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink-800 text-ink-300 transition-colors hover:bg-ink-700 hover:text-ink-50 border border-[var(--hairline)]"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Large Certificate Preview Box */}
          {mediaUrl ? (
            <div className="group relative rounded-xl border border-[var(--hairline-strong)] bg-ink-950/70 p-2 sm:p-3 overflow-hidden shadow-inner">
              {isPdf ? (
                <div className="w-full flex flex-col items-center justify-center py-10 px-4 bg-ink-850/50 rounded-lg border border-[var(--hairline)] text-center">
                  <div className="h-16 w-16 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center border border-red-500/20 mb-3">
                    <FileText className="h-8 w-8" />
                  </div>
                  <h4 className="text-base font-semibold text-ink-100">Official Certificate Document (PDF)</h4>
                  <p className="text-xs text-ink-400 mt-1 max-w-md">
                    This credential is saved as a high-resolution PDF document. You can open the embedded viewer or download it directly.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    <a
                      href={mediaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg bg-accent-500 hover:bg-accent-400 text-ink-950 px-4 py-2 text-xs font-semibold transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" /> Open Full PDF
                    </a>
                  </div>
                </div>
              ) : (
                <div className="relative flex items-center justify-center bg-ink-950/90 rounded-lg overflow-hidden min-h-[220px] max-h-[460px]">
                  <img
                    src={mediaUrl}
                    alt={cert.title}
                    className="max-h-[440px] w-full object-contain rounded-lg transition-transform duration-300 group-hover:scale-[1.01]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowFullPreview(true)}
                    className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg bg-ink-950/90 px-3 py-1.5 text-xs font-mono text-ink-200 backdrop-blur-sm border border-[var(--hairline)] hover:bg-accent-500 hover:text-ink-950 transition-colors shadow-lg"
                  >
                    <Maximize2 className="h-3.5 w-3.5" /> Full Zoom
                  </button>
                </div>
              )}
            </div>
          ) : null}

          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
            {cert.issueDate ? (
              <span className="inline-flex items-center gap-1.5 bg-ink-850 px-3 py-1.5 rounded-lg border border-[var(--hairline)] text-ink-300">
                <Calendar className="h-3.5 w-3.5 text-accent-400" />
                Issued: <strong className="text-ink-100">{cert.issueDate}</strong>
              </span>
            ) : null}

            {cert.expirationDate ? (
              <span className="bg-ink-850 px-3 py-1.5 rounded-lg border border-[var(--hairline)] text-ink-400">
                Expires: <span className="text-ink-200">{cert.expirationDate}</span>
              </span>
            ) : null}

            {cert.credentialId ? (
              <span className="bg-ink-850 px-3 py-1.5 rounded-lg border border-[var(--hairline)] text-ink-400">
                Credential ID: <span className="text-accent-300 select-all font-semibold">{cert.credentialId}</span>
              </span>
            ) : null}
          </div>

          {/* Description */}
          {cert.description ? (
            <div className="pt-2">
              <h3 className="text-xs font-mono uppercase tracking-wider text-ink-400 mb-2">
                Program & Competencies
              </h3>
              <p className="text-sm leading-relaxed text-ink-200 whitespace-pre-line bg-ink-850/50 p-4 rounded-xl border border-[var(--hairline)]">
                {cert.description}
              </p>
            </div>
          ) : null}

          {/* Skills */}
          {cert.skills?.length ? (
            <div>
              <h3 className="text-xs font-mono uppercase tracking-wider text-ink-400 mb-2.5">
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

          {/* Action links footer */}
          <div className="pt-4 border-t border-[var(--hairline)] flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              {cert.credentialUrl ? (
                <a
                  href={cert.credentialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-accent-500 hover:bg-accent-400 text-ink-950 px-4 py-2.5 text-sm font-semibold transition-colors shadow-lg shadow-accent-500/20"
                >
                  Verify Online
                  <ExternalLink className="h-4 w-4" />
                </a>
              ) : null}

              {mediaUrl ? (
                <a
                  href={mediaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="inline-flex items-center gap-2 rounded-xl border border-[var(--hairline)] bg-ink-800 hover:bg-ink-750 text-ink-100 px-4 py-2.5 text-sm font-medium transition-colors"
                >
                  {isPdf ? <FileText className="h-4 w-4 text-accent-400" /> : <Download className="h-4 w-4 text-accent-400" />}
                  {isPdf ? 'Open PDF File' : 'View Original Image'}
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

      {/* Full Screen Lightbox for Certificate Image */}
      <AnimatePresence>
        {showFullPreview && mediaUrl && !isPdf ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 p-4"
            onClick={() => setShowFullPreview(false)}
          >
            <button
              type="button"
              onClick={() => setShowFullPreview(false)}
              className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-ink-900/90 text-ink-100 hover:bg-ink-800 border border-slate-700"
            >
              <X className="h-6 w-6" />
            </button>
            <img
              src={mediaUrl}
              alt={cert.title}
              className="max-h-[94vh] max-w-[94vw] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function CertificationCard({ cert, onSelect }) {
  const isPdf = isPdfDocument(cert.pdfUrl || cert.image);
  const mediaUrl = resolveMediaUrl(cert.image || cert.pdfUrl);

  return (
    <motion.article
      variants={fadeUp}
      onClick={() => onSelect(cert)}
      className="group surface relative cursor-pointer overflow-hidden rounded-[var(--radius-card)] p-5 sm:p-6 transition-all duration-300 hover:border-[var(--hairline-strong)] hover:shadow-xl hover:shadow-accent-500/5 flex flex-col justify-between"
    >
      <div>
        {/* Top visual thumbnail or banner */}
        {mediaUrl ? (
          <div className="relative mb-4 h-36 w-full overflow-hidden rounded-xl border border-[var(--hairline)] bg-ink-950/60 flex items-center justify-center">
            {isPdf ? (
              <div className="flex flex-col items-center justify-center text-center p-3 text-red-400">
                <FileText className="h-10 w-10 mb-1" />
                <span className="text-xs font-mono text-ink-300">PDF Credential</span>
              </div>
            ) : (
              <img
                src={mediaUrl}
                alt={cert.title}
                className="h-full w-full object-contain p-1 rounded-lg group-hover:scale-105 transition-transform duration-300"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950/60 via-transparent to-transparent opacity-60 group-hover:opacity-20 transition-opacity" />
          </div>
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-500/10 text-accent-300 border border-accent-500/20 mb-4">
            <Award className="h-6 w-6" />
          </div>
        )}

        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-accent-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Verified</span>
          </div>
          {cert.issueDate ? (
            <span className="font-mono text-xs text-ink-400 bg-ink-850 px-2 py-0.5 rounded-md border border-[var(--hairline)]">
              {cert.issueDate}
            </span>
          ) : null}
        </div>

        <h3 className="text-lg font-bold tracking-tight text-ink-50 group-hover:text-accent-300 transition-colors line-clamp-1">
          {cert.title}
        </h3>
        <p className="mt-1 text-sm text-ink-300 font-medium">{cert.issuer}</p>

        {cert.description ? (
          <p className="mt-2.5 text-xs sm:text-sm text-ink-400 line-clamp-2 leading-relaxed">
            {cert.description}
          </p>
        ) : null}
      </div>

      <div className="mt-5 pt-3.5 border-t border-[var(--hairline)]">
        {cert.skills?.length ? (
          <div className="flex flex-wrap gap-1.5 mb-3.5">
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

        <div className="flex items-center justify-between text-xs font-semibold text-accent-400 group-hover:text-accent-300">
          <span>Click to view full certificate</span>
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
