import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { loginLimiter, uploadLimiter } from '../middleware/rateLimit.js';
import { login, logout, me, updateAccount } from '../controllers/authController.js';
import {
  certificationsController,
  journeyController,
  postsController,
  projectsController,
  servicesController,
  skillsController,
} from '../controllers/adminContentController.js';
import {
  analyticsOverview,
  dashboardSummary,
  deleteMessage,
  getReport,
  getSettings,
  listActivity,
  listMessages,
  pruneAnalytics,
  recentActivityFeed,
  updateMessageStatus,
  updateSettings,
} from '../controllers/adminDashboardController.js';
import { deleteFile, uploadFile, uploadMiddleware, uploadResume } from '../controllers/uploadController.js';
import {
  accountSchema,
  certificationSchema,
  journeySchema,
  listQuerySchema,
  loginSchema,
  messageStatusSchema,
  postSchema,
  projectSchema,
  rangeSchema,
  reorderSchema,
  serviceSchema,
  settingsSchema,
  skillSchema,
} from '../validators/adminSchemas.js';

const router = Router();

router.post('/auth/login', loginLimiter, validate(loginSchema), login);
router.post('/auth/logout', requireAuth, logout);
router.get('/auth/me', requireAuth, me);
router.patch('/auth/account', requireAuth, validate(accountSchema), updateAccount);

router.use(requireAuth);

/** Wires the standard CRUD surface for a content resource. */
const mountResource = (path, controller, schema) => {
  router.get(path, validate(listQuerySchema, 'query'), controller.list);
  router.post(`${path}/reorder`, validate(reorderSchema), controller.reorder);
  router.get(`${path}/:id`, controller.getOne);
  router.post(path, validate(schema), controller.create);
  router.patch(`${path}/:id`, validate(schema.partial()), controller.update);
  router.delete(`${path}/:id`, controller.remove);
};

mountResource('/projects', projectsController, projectSchema);
mountResource('/updates', postsController, postSchema);
mountResource('/skills', skillsController, skillSchema);
mountResource('/services', servicesController, serviceSchema);
mountResource('/journey', journeyController, journeySchema);
mountResource('/certifications', certificationsController, certificationSchema);

router.get('/settings', getSettings);
router.patch('/settings', validate(settingsSchema), updateSettings);

router.get('/messages', validate(listQuerySchema, 'query'), listMessages);
router.patch('/messages/:id', validate(messageStatusSchema), updateMessageStatus);
router.delete('/messages/:id', deleteMessage);

router.get('/dashboard', validate(rangeSchema, 'query'), dashboardSummary);
router.get('/analytics', validate(rangeSchema, 'query'), analyticsOverview);
router.get('/analytics/activity', recentActivityFeed);
router.post('/analytics/prune', pruneAnalytics);

router.get(
  '/reports/:type',
  validate(rangeSchema.extend({ format: z.enum(['json', 'csv']).optional() }), 'query'),
  getReport,
);

router.get('/activity', validate(listQuerySchema, 'query'), listActivity);

router.post('/uploads', uploadLimiter, uploadMiddleware, uploadFile);
router.post('/uploads/resume', uploadLimiter, uploadMiddleware, uploadResume);
router.delete('/uploads', deleteFile);

export default router;
