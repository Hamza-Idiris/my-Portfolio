const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const shell = (title, bodyHtml) => `<!doctype html>
<html>
  <body style="margin:0;background:#0a0b0d;padding:32px 16px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#c7ccd4;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#121316;border:1px solid rgba(255,255,255,.08);border-radius:16px;">
      <tr>
        <td style="padding:28px 28px 20px;border-bottom:1px solid rgba(255,255,255,.08);">
          <p style="margin:0;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:#34d3b5;">Hamza Idiris</p>
          <h1 style="margin:8px 0 0;font-size:20px;color:#f5f6f8;font-weight:600;">${escapeHtml(title)}</h1>
        </td>
      </tr>
      <tr><td style="padding:24px 28px;font-size:14px;line-height:1.65;">${bodyHtml}</td></tr>
      <tr>
        <td style="padding:16px 28px 24px;border-top:1px solid rgba(255,255,255,.08);font-size:12px;color:#6b7280;">
          Sent automatically from hamzaidiris.dev
        </td>
      </tr>
    </table>
  </body>
</html>`;

const row = (label, value) =>
  value
    ? `<tr>
        <td style="padding:6px 12px 6px 0;color:#6b7280;white-space:nowrap;vertical-align:top;">${escapeHtml(label)}</td>
        <td style="padding:6px 0;color:#e7e9ed;">${escapeHtml(value)}</td>
      </tr>`
    : '';

export function contactNotificationEmail(message) {
  const details = [
    row('Name', message.name),
    row('Email', message.email),
    row('Subject', message.subject),
    row('Project type', message.projectType),
    row('Budget', message.budget),
    row('Timeline', message.timeline),
  ].join('');

  const html = shell(
    'New message from your portfolio',
    `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;font-size:14px;">${details}</table>
     <div style="margin-top:20px;padding:16px;background:#0e1013;border:1px solid rgba(255,255,255,.08);border-radius:12px;white-space:pre-wrap;color:#e7e9ed;">${escapeHtml(
       message.message,
     )}</div>
     <p style="margin:20px 0 0;color:#9aa1ac;">Reply directly to this email to respond to ${escapeHtml(
       message.name,
     )}.</p>`,
  );

  const text = [
    `New message from your portfolio`,
    ``,
    `Name: ${message.name}`,
    `Email: ${message.email}`,
    message.subject ? `Subject: ${message.subject}` : '',
    message.projectType ? `Project type: ${message.projectType}` : '',
    message.budget ? `Budget: ${message.budget}` : '',
    message.timeline ? `Timeline: ${message.timeline}` : '',
    ``,
    message.message,
  ]
    .filter(Boolean)
    .join('\n');

  return {
    subject: `New portfolio message from ${message.name}`,
    html,
    text,
  };
}

export function contactConfirmationEmail(message, { name = 'Hamza Idiris', responseTime } = {}) {
  const html = shell(
    'Thanks for reaching out',
    `<p style="margin:0 0 14px;">Hi ${escapeHtml(message.name.split(' ')[0])},</p>
     <p style="margin:0 0 14px;">Thank you for your message. It has arrived safely and ${escapeHtml(
       name,
     )} will read it personally.${responseTime ? ` ${escapeHtml(responseTime)}` : ''}</p>
     <p style="margin:0 0 8px;color:#9aa1ac;">A copy of what you sent:</p>
     <div style="padding:16px;background:#0e1013;border:1px solid rgba(255,255,255,.08);border-radius:12px;white-space:pre-wrap;color:#e7e9ed;">${escapeHtml(
       message.message,
     )}</div>
     <p style="margin:20px 0 0;">— ${escapeHtml(name)}</p>`,
  );

  const text = `Hi ${message.name.split(' ')[0]},

Thank you for your message. It has arrived safely and ${name} will read it personally.${
    responseTime ? ` ${responseTime}` : ''
  }

A copy of what you sent:
${message.message}

— ${name}`;

  return { subject: 'Thanks for getting in touch', html, text };
}
