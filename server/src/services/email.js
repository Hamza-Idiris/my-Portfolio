import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

/**
 * Email is behind a small driver interface so the provider can change without
 * touching any calling code. Credentials only ever come from environment
 * variables.
 *
 *   console (default) - logs the message, used in development
 *   resend            - Resend HTTP API, needs EMAIL_API_KEY
 *   smtp              - any SMTP server, needs SMTP_* values
 */

let smtpTransport = null;

const getSmtpTransport = () => {
  if (smtpTransport) return smtpTransport;
  smtpTransport = nodemailer.createTransport({
    host: env.email.smtp.host,
    port: env.email.smtp.port,
    secure: env.email.smtp.secure,
    auth:
      env.email.smtp.user && env.email.smtp.pass
        ? { user: env.email.smtp.user, pass: env.email.smtp.pass }
        : undefined,
  });
  return smtpTransport;
};

async function sendViaResend({ to, subject, html, text, replyTo }) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.email.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.email.from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Resend responded with ${response.status}: ${detail}`);
  }
  return response.json();
}

export async function sendEmail({ to, subject, html, text, replyTo }) {
  if (!to) {
    console.warn('[email] no recipient configured, skipping send');
    return { skipped: true };
  }

  try {
    switch (env.email.driver) {
      case 'resend':
        if (!env.email.apiKey) throw new Error('EMAIL_API_KEY is not set');
        return await sendViaResend({ to, subject, html, text, replyTo });

      case 'smtp':
        if (!env.email.smtp.host) throw new Error('SMTP_HOST is not set');
        return await getSmtpTransport().sendMail({
          from: env.email.from,
          to,
          subject,
          html,
          text,
          replyTo,
        });

      default:
        console.log(`[email:console] to=${to} subject="${subject}"`);
        console.log(text || html);
        return { logged: true };
    }
  } catch (error) {
    // A failing mail provider must not break the visitor's submission.
    console.error('[email] send failed:', error.message);
    return { error: error.message };
  }
}
