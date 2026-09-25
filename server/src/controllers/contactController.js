import { ContactMessage } from '../models/ContactMessage.js';
import { SiteSettings } from '../models/SiteSettings.js';
import { AnalyticsEvent } from '../models/AnalyticsEvent.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';
import { sendEmail } from '../services/email.js';
import { contactConfirmationEmail, contactNotificationEmail } from '../services/emailTemplates.js';
import { requestContext } from '../services/clientContext.js';

export const submitMessage = asyncHandler(async (req, res) => {
  const settings = await SiteSettings.getSingleton();
  if (settings.contact && settings.contact.formEnabled === false) {
    throw ApiError.forbidden('The contact form is currently closed. Please use email instead.');
  }

  const { website, ...payload } = req.body;
  // Honeypot filled means a bot; answer as success so it does not retry.
  if (website) {
    return res.status(201).json({ message: 'Thanks. Your message has been received.' });
  }

  const context = requestContext(req);
  const message = await ContactMessage.create({
    ...payload,
    source: {
      referrerCategory: 'direct',
      deviceCategory: context.deviceCategory,
    },
  });

  const notifyTo = env.email.notifyTo || settings.contact.email || settings.profile.email;
  const notification = contactNotificationEmail(message);
  const confirmation = contactConfirmationEmail(message, {
    name: settings.profile.name,
    responseTime: settings.contact.responseTime,
  });

  const [notifyResult] = await Promise.all([
    sendEmail({ ...notification, to: notifyTo, replyTo: message.email }),
    sendEmail({ ...confirmation, to: message.email }),
  ]);

  if (notifyResult && !notifyResult.error && !notifyResult.skipped) {
    message.notificationSent = true;
    await message.save();
  }

  await AnalyticsEvent.create({
    anonymousSessionId: 'server',
    eventType: 'contact_form_submit',
    page: '/contact',
    ...context,
  }).catch(() => null);

  return res.status(201).json({
    message: 'Thanks. Your message has been received.',
    id: message._id,
  });
});
