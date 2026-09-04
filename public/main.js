// --- one-time typing effect in the hero prompt ---
(function typeIntro() {
  const el = document.getElementById('typed');
  const text = './whoami --verbose';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduceMotion) {
    el.textContent = text;
    return;
  }

  let i = 0;
  function step() {
    if (i <= text.length) {
      el.textContent = text.slice(0, i);
      i++;
      setTimeout(step, 45);
    }
  }
  step();
})();

// --- fetch live project data from our own Express API ---
(async function loadProjects() {
  const container = document.getElementById('project-tree');

  try {
    const res = await fetch('/api/projects');
    if (!res.ok) throw new Error('bad response');
    const projects = await res.json();

    if (!projects.length) {
      container.innerHTML = '<p class="tree__error">No projects found.</p>';
      return;
    }

    container.innerHTML = projects.map(renderProject).join('');
  } catch (err) {
    container.innerHTML = `
      <p class="tree__error">
        Couldn't reach the GitHub API right now —
        <a href="https://github.com/cezium55?tab=repositories" target="_blank" rel="noopener">see repos directly</a>.
      </p>`;
  }
})();

function renderProject(p) {
  const updated = p.updatedAt
    ? new Date(p.updatedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : '';

  const topics = (p.topics || [])
    .slice(0, 4)
    .map((t) => `<span class="tag">${escapeHtml(t)}</span>`)
    .join('');

  return `
    <article class="tree-item">
      <div class="tree-item__head">
        <a class="tree-item__name" href="${p.url}" target="_blank" rel="noopener">${escapeHtml(p.name)}</a>
        <span class="tree-item__meta">${p.language || ''}${p.stars ? ` · ★ ${p.stars}` : ''}${updated ? ` · ${updated}` : ''}</span>
      </div>
      ${p.description ? `<p class="tree-item__desc">${escapeHtml(p.description)}</p>` : ''}
      ${topics ? `<div class="tree-item__topics">${topics}</div>` : ''}
    </article>
  `;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// --- contact form submission against our own /api/contact ---
const form = document.getElementById('contact-form');
const status = document.getElementById('form-status');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  status.textContent = 'sending…';
  status.removeAttribute('data-state');

  const payload = {
    name: form.name.value.trim(),
    email: form.email.value.trim(),
    message: form.message.value.trim(),
  };

  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || 'Something went wrong');

    status.textContent = data.message || 'Message sent.';
    status.dataset.state = 'success';
    form.reset();
  } catch (err) {
    status.textContent = err.message;
    status.dataset.state = 'error';
  } finally {
    submitBtn.disabled = false;
  }
});
