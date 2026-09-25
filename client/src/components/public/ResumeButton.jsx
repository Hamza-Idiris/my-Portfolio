import { Link } from 'react-router-dom';
import { trackEvent } from '../../lib/analytics.js';

/**
 * Links straight to the uploaded CV when one exists. Until Hamza uploads one,
 * it points at /resume instead of offering a download that would fail.
 */
export function ResumeButton({ resume, location = 'unknown', className, children }) {
  if (!resume?.url) {
    return (
      <Link to="/resume" className={className}>
        {children}
      </Link>
    );
  }

  return (
    <a
      href={resume.url}
      download={resume.fileName || 'hamza-idiris-cv.pdf'}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackEvent('cv_download', { meta: { location } })}
      className={className}
    >
      {children}
    </a>
  );
}
