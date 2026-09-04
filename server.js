const express = require('express');
const path = require('path');
require('dotenv').config();

const projectsRouter = require('./routes/projects');
const contactRouter = require('./routes/contact');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api/projects', projectsRouter);
app.use('/api/contact', contactRouter);

// health check — nice small signal you know what production apps need
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.listen(PORT, () => {
  console.log(`Portfolio server running on http://localhost:${PORT}`);
});

module.exports = app;