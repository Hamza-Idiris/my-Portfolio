import mongoose from 'mongoose';
import { AnalyticsEvent } from '../models/AnalyticsEvent.js';
import { SiteSettings } from '../models/SiteSettings.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { env } from '../config/env.js';
import { isLikelyBot, requestContext } from '../services/clientContext.js';

const toObjectId = (value) =>
  value && mongoose.isValidObjectId(value) ? new mongoose.Types.ObjectId(value) : null;

export const recordEvent = asyncHandler(async (req, res) => {
  // Always answer 204 so a blocked or disabled tracker never surfaces as an
  // error in the visitor's console.
  res.status(204).end();

  if (!env.analyticsEnabled) return;
  if (isLikelyBot(req.get('user-agent') || '')) return;
  if (req.get('sec-fetch-mode') === 'navigate') return;

  const settings = await SiteSettings.getSingleton();
  if (settings.analytics && settings.analytics.enabled === false) return;

  const { sessionId, eventType, path, referrer, screenWidth, projectId, postId, meta } = req.body;
  const context = requestContext(req, screenWidth);

  await AnalyticsEvent.create({
    anonymousSessionId: sessionId,
    eventType,
    page: path,
    referrerCategory: referrer,
    projectId: toObjectId(projectId),
    postId: toObjectId(postId),
    label: typeof meta?.label === 'string' ? meta.label.slice(0, 80) : '',
    ...context,
    timestamp: new Date(),
  });
});
