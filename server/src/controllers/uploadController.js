import multer from 'multer';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { storage } from '../services/storage.js';
import { SiteSettings } from '../models/SiteSettings.js';
import { logActivity } from '../services/activityLog.js';

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif', 'image/svg+xml'];
const DOCUMENT_TYPES = ['application/pdf'];

export const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.maxUploadBytes, files: 1 },
  fileFilter(req, file, callback) {
    const allowed = [...IMAGE_TYPES, ...DOCUMENT_TYPES];
    if (!allowed.includes(file.mimetype)) {
      return callback(ApiError.badRequest('Only images and PDF files can be uploaded'));
    }
    return callback(null, true);
  },
}).single('file');

export const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('Choose a file to upload');

  const folder = ['projects', 'updates', 'profile', 'resume'].includes(req.body.folder)
    ? req.body.folder
    : 'general';

  const isPdf = DOCUMENT_TYPES.includes(req.file.mimetype);
  const result = await storage.upload(req.file, {
    folder,
    resourceType: isPdf ? 'raw' : 'image',
  });

  await logActivity(req.admin, 'file_uploaded', {
    targetType: 'file',
    targetLabel: req.file.originalname,
    detail: `Uploaded to ${folder}`,
  });

  res.status(201).json({ file: result });
});

export const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('Choose a PDF file to upload');
  if (req.file.mimetype !== 'application/pdf') {
    throw ApiError.badRequest('The resume must be a PDF file');
  }

  const settings = await SiteSettings.getSingleton();
  const previousId = settings.resume.storageId;

  const result = await storage.upload(req.file, { folder: 'resume', resourceType: 'raw' });

  settings.resume.url = result.url;
  settings.resume.fileName = req.file.originalname;
  settings.resume.storageId = result.storageId;
  settings.resume.updatedAt = new Date();
  await settings.save();

  if (previousId && previousId !== result.storageId) {
    await storage.remove(previousId, { resourceType: 'raw' });
  }

  await logActivity(req.admin, 'resume_updated', {
    targetType: 'resume',
    targetLabel: req.file.originalname,
  });

  res.status(201).json({ resume: settings.resume });
});

export const deleteFile = asyncHandler(async (req, res) => {
  const { storageId, resourceType } = req.body;
  if (!storageId) throw ApiError.badRequest('storageId is required');

  await storage.remove(storageId, { resourceType: resourceType || 'image' });
  await logActivity(req.admin, 'file_deleted', { targetType: 'file', targetLabel: storageId });

  res.json({ message: 'File removed' });
});
