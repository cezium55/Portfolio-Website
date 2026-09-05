const express = require('express');
const { Resend } = require('resend');
const router = express.Router();

const resend = new Resend(process.env.RESEND_API_KEY);
const TO_EMAIL = process.env.CONTACT_TO_EMAIL || 'garvitgaur47@gmail.com';
// Resend's free tier can only send FROM their own onboarding domain
// unless you verify your own domain. This default works with zero setup.
const FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || 'Portfolio <onboarding@resend.dev>';

// Basic in-memory rate limiting — no need for Redis at this scale,
// but shows awareness of abuse vectors on a public form.
const submissions = new Map();
const RATE_LIMIT_WINDOW_MS = 1000 * 60 * 10;
const RATE_LIMIT_MAX = 3;

function isRateLimited(ip) {
  const now = Date.now();
  const entry = submissions.get(ip) || { count: 0, windowStart: now };

  if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    entry.count = 0;
    entry.windowStart = now;
  }

  entry.count += 1;
  submissions.set(ip, entry);
  return entry.count > RATE_LIMIT_MAX;
}

router.post('/', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'name, email, and message are required' });
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  const ip = req.ip;
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Too many submissions. Try again later.' });
  }

  // Send the actual email via Resend.
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      reply_to: email,
      subject: `Portfolio contact from ${name}`,
      text: `From: ${name} <${email}>\n\n${message}`,
      html: `
        <p><strong>From:</strong> ${escapeHtml(name)} (${escapeHtml(email)})</p>
        <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(502).json({ error: 'Could not send message. Try again shortly.' });
    }
  } catch (err) {
    console.error('Unexpected email error:', err);
    return res.status(502).json({ error: 'Could not send message. Try again shortly.' });
  }

  res.status(200).json({ success: true, message: 'Message received. I will get back to you soon.' });
});

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

module.exports = router;
