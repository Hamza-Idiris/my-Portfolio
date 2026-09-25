import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api.js';
import { applySeo } from '../../lib/seo.js';
import { Container } from '../../components/ui/Section.jsx';
import { ErrorState } from '../../components/ui/States.jsx';
import { Certifications } from '../../components/public/Certifications.jsx';

export default function CertificationsPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['certifications'],
    queryFn: () => api.get('/api/certifications'),
  });

  useEffect(() => {
    applySeo({
      title: 'Certifications',
      description:
        'Professional certifications, badges, and technical qualifications held by Hamza Idiris in full-stack web and mobile development.',
      path: '/certifications',
    });
  }, []);

  if (isError) {
    return (
      <Container className="py-24">
        <ErrorState
          title="Certifications could not be loaded"
          description="The API did not respond. Try again shortly."
          onRetry={refetch}
        />
      </Container>
    );
  }

  return (
    <>
      <div className="border-b border-[var(--hairline)] pt-20 pb-12 sm:pt-24">
        <Container>
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-accent-400">
            Credentials
          </p>
          <h1 className="text-4xl sm:text-5xl">Certifications</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-300">
            Formal certifications and technical qualifications in full-stack web and mobile
            development. Click any card to see the full credential details.
          </p>
        </Container>
      </div>

      <Certifications certifications={isLoading ? [] : (data?.items || [])} />
    </>
  );
}
