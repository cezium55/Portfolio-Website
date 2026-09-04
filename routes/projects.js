const express = require('express');
const axios = require('axios');
const router = express.Router();

const GITHUB_USER = 'cezium55';

// Curated list — we show these specific repos in this order, but pull
// live stats (stars, last updated, description) from GitHub's API instead
// of hardcoding them, so the site never goes stale.
const FEATURED_REPOS = [
  'mini-redis',
  'Posture-Monitor-Web',
  'api-performance-monitor',
  'caching-proxy-CLI',
];

let cache = { data: null, expiresAt: 0 };
const CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes

router.get('/', async (req, res) => {
  try {
    if (cache.data && Date.now() < cache.expiresAt) {
      return res.json(cache.data);
    }

    const requests = FEATURED_REPOS.map((repo) =>
      axios
        .get(`https://api.github.com/repos/${GITHUB_USER}/${repo}`)
        .then((r) => ({
          name: r.data.name,
          description: r.data.description,
          url: r.data.html_url,
          stars: r.data.stargazers_count,
          language: r.data.language,
          updatedAt: r.data.pushed_at,
          topics: r.data.topics || [],
        }))
        .catch(() => null) // one dead repo shouldn't break the whole response
    );

    const results = (await Promise.all(requests)).filter(Boolean);

    cache = { data: results, expiresAt: Date.now() + CACHE_TTL_MS };
    res.json(results);
  } catch (err) {
    console.error('Failed to fetch projects:', err.message);
    res.status(502).json({ error: 'Could not reach GitHub API' });
  }
});

module.exports = router;
