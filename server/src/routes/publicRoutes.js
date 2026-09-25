import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { analyticsLimiter, contactLimiter } from '../middleware/rateLimit.js';
import {
  getHomeData,
  getPost,
  getProject,
  getSettings,
  listCertifications,
  listJourney,
  listPosts,
  listProjects,
  listServices,
  listSkills,
} from '../controllers/publicController.js';
import { submitMessage } from '../controllers/contactController.js';
import { recordEvent } from '../controllers/analyticsIngestController.js';
import {
  analyticsEventSchema,
  contactSchema,
  postQuerySchema,
  projectQuerySchema,
} from '../validators/publicSchemas.js';
import { sitemap, robots } from '../controllers/seoController.js';

const router = Router();

router.get('/settings', getSettings);
router.get('/home', getHomeData);

router.get('/projects', validate(projectQuerySchema, 'query'), listProjects);
router.get('/projects/:slug', getProject);

router.get('/posts', validate(postQuerySchema, 'query'), listPosts);
router.get('/posts/:slug', getPost);

router.get('/skills', listSkills);
router.get('/services', listServices);
router.get('/journey', listJourney);
router.get('/certifications', listCertifications);

router.post('/contact', contactLimiter, validate(contactSchema), submitMessage);
router.post('/analytics/event', analyticsLimiter, validate(analyticsEventSchema), recordEvent);

router.get('/sitemap.xml', sitemap);
router.get('/robots.txt', robots);

export default router;
