import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar.jsx';
import { Footer } from './Footer.jsx';
import { LoadingState } from '../ui/States.jsx';
import { Container } from '../ui/Section.jsx';

export default function PublicLayout() {
  return (
    <div className="flex min-h-dvh flex-col bg-ink-900">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-accent-500 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-ink-950"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main" className="flex-1 pt-16">
        <Suspense
          fallback={
            <Container className="py-24">
              <LoadingState label="Loading page" />
            </Container>
          }
        >
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
