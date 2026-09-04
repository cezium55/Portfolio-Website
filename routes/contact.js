const express = require('express');
const router = express.Router();

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

  // In production this would call nodemailer / a transactional email API
  // (SendGrid, Resend, etc.) using credentials from process.env.
  // Left as a clear extension point rather than wired to a real inbox,
  // so the repo doesn't ship secrets.
  console.log('New contact form submission:', { name, email, message });

  res.status(200).json({ success: true, message: 'Message received. I will get back to you soon.' });
});

module.exports = router;
