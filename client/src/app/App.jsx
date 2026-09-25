import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { MotionConfig } from 'framer-motion';
import { queryClient } from './queryClient.js';
import { ScrollAndTrack } from './ScrollAndTrack.jsx';
import { ErrorBoundary } from './ErrorBoundary.jsx';
import PublicLayout from '../components/public/PublicLayout.jsx';

const Home = lazy(() => import('../pages/public/Home.jsx'));
const About = lazy(() => import('../pages/public/About.jsx'));
const Projects = lazy(() => import('../pages/public/Projects.jsx'));
const ProjectDetail = lazy(() => import('../pages/public/ProjectDetail.jsx'));
const Updates = lazy(() => import('../pages/public/Updates.jsx'));
const UpdateDetail = lazy(() => import('../pages/public/UpdateDetail.jsx'));
const Contact = lazy(() => import('../pages/public/Contact.jsx'));
const Resume = lazy(() => import('../pages/public/Resume.jsx'));
const CertificationsPage = lazy(() => import('../pages/public/Certifications.jsx'));
const NotFound = lazy(() => import('../pages/public/NotFound.jsx'));

const AdminLogin = lazy(() => import('../pages/admin/Login.jsx'));
const AdminLayout = lazy(() => import('../components/admin/AdminLayout.jsx'));
const AdminOverview = lazy(() => import('../pages/admin/Overview.jsx'));
const AdminProjects = lazy(() => import('../pages/admin/Projects.jsx'));
const AdminProjectEditor = lazy(() => import('../pages/admin/ProjectEditor.jsx'));
const AdminUpdates = lazy(() => import('../pages/admin/Updates.jsx'));
const AdminUpdateEditor = lazy(() => import('../pages/admin/UpdateEditor.jsx'));
const AdminCertifications = lazy(() => import('../pages/admin/Certifications.jsx'));
const AdminMessages = lazy(() => import('../pages/admin/Messages.jsx'));
const AdminAnalytics = lazy(() => import('../pages/admin/Analytics.jsx'));
const AdminReports = lazy(() => import('../pages/admin/Reports.jsx'));
const AdminSkills = lazy(() => import('../pages/admin/Skills.jsx'));
const AdminServices = lazy(() => import('../pages/admin/Services.jsx'));
const AdminJourney = lazy(() => import('../pages/admin/Journey.jsx'));
const AdminProfile = lazy(() => import('../pages/admin/Profile.jsx'));
const AdminSettings = lazy(() => import('../pages/admin/Settings.jsx'));
const AdminActivity = lazy(() => import('../pages/admin/Activity.jsx'));

/** Shown only while a route chunk downloads; layouts add their own richer fallbacks. */
function RouteFallback() {
  return <div className="min-h-dvh bg-ink-900" aria-busy="true" aria-label="Loading" />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MotionConfig reducedMotion="user">
        <BrowserRouter>
          <ScrollAndTrack />
          <ErrorBoundary>
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route element={<PublicLayout />}>
                  <Route index element={<Home />} />
                  <Route path="about" element={<About />} />
                  <Route path="projects" element={<Projects />} />
                  <Route path="projects/:slug" element={<ProjectDetail />} />
                  <Route path="updates" element={<Updates />} />
                  <Route path="updates/:slug" element={<UpdateDetail />} />
                  <Route path="contact" element={<Contact />} />
                  <Route path="resume" element={<Resume />} />
                  <Route path="certifications" element={<CertificationsPage />} />
                  <Route path="*" element={<NotFound />} />
                </Route>

                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminOverview />} />
                  <Route path="projects" element={<AdminProjects />} />
                  <Route path="projects/new" element={<AdminProjectEditor />} />
                  <Route path="projects/:id" element={<AdminProjectEditor />} />
                  <Route path="updates" element={<AdminUpdates />} />
                  <Route path="updates/new" element={<AdminUpdateEditor />} />
                  <Route path="updates/:id" element={<AdminUpdateEditor />} />
                  <Route path="certifications" element={<AdminCertifications />} />
                  <Route path="messages" element={<AdminMessages />} />
                  <Route path="analytics" element={<AdminAnalytics />} />
                  <Route path="reports" element={<AdminReports />} />
                  <Route path="skills" element={<AdminSkills />} />
                  <Route path="services" element={<AdminServices />} />
                  <Route path="journey" element={<AdminJourney />} />
                  <Route path="profile" element={<AdminProfile />} />
                  <Route path="settings" element={<AdminSettings />} />
                  <Route path="activity" element={<AdminActivity />} />
                  <Route path="*" element={<Navigate to="/admin" replace />} />
                </Route>
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </BrowserRouter>
      </MotionConfig>
    </QueryClientProvider>
  );
}
