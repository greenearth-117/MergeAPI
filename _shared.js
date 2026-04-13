// _shared.js — loaded by every page
// Shared API base, state management, helpers, nav highlighting

// ── API base URL ──────────────────────────────────────────────────
const API = "/.netlify/functions";

// ── Shared state via sessionStorage ──────────────────────────────
// sessionStorage keeps data in memory for the current browser session.
// Navigating between pages keeps the data; closing the tab clears it.
const State = {
  get syncroOrgs()     { return JSON.parse(sessionStorage.getItem('syncroOrgs')     || '[]'); },
  set syncroOrgs(v)    { sessionStorage.setItem('syncroOrgs',     JSON.stringify(v)); },
  get syncroAllOrgs()  { return JSON.parse(sessionStorage.getItem('syncroAllOrgs')  || '[]'); },
  set syncroAllOrgs(v) { sessionStorage.setItem('syncroAllOrgs',  JSON.stringify(v)); },
  get ninjaOrgs()      { return JSON.parse(sessionStorage.getItem('ninjaOrgs')      || '[]'); },
  set ninjaOrgs(v)     { sessionStorage.setItem('ninjaOrgs',      JSON.stringify(v)); },
  get pax8Orgs()       { return JSON.parse(sessionStorage.getItem('pax8Orgs')       || '[]'); },
  set pax8Orgs(v)      { sessionStorage.setItem('pax8Orgs',       JSON.stringify(v)); },
  get matches()        { return JSON.parse(sessionStorage.getItem('matches')        || '[]'); },
  set matches(v)       { sessionStorage.setItem('matches',        JSON.stringify(v)); },
  get auditedMap()     { return JSON.parse(sessionStorage.getItem('auditedMap')     || '{}'); },
  set auditedMap(v)    { sessionStorage.setItem('auditedMap',     JSON.stringify(v)); },
  get countsData()     { return JSON.parse(sessionStorage.getItem('countsData')     || '{}'); },
  set countsData(v)    { sessionStorage.setItem('countsData',     JSON.stringify(v)); },
  get outstandingMap() { return JSON.parse(sessionStorage.getItem('outstandingMap') || '{}'); },
  set outstandingMap(v){ sessionStorage.setItem('outstandingMap', JSON.stringify(v)); },
};

// ── Generic API proxy call ────────────────────────────────────────
async function api(service, endpoint, method = 'GET', body = null) {
  const r = await fetch(`${API}/${service}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ endpoint, method, body })
  });
  const j = await r.json();
  if (!j.ok) throw new Error(j.error || 'API error');
  return j.data;
}

// ── Toast notification ────────────────────────────────────────────
let _nt;
function notify(msg, type = 'ok') {
  const el = document.getElementById('notif');
  if (!el) return;
  el.textContent = msg;
  el.className = 'show ' + type;
  clearTimeout(_nt);
  _nt = setTimeout(() => el.className = '', 3200);
}

// ── Fuzzy name matching ───────────────────────────────────────────
function similarity(a, b) {
  a = a.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim();
  b = b.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim();
  if (a === b) return 1;
  const wordsA = new Set(a.split(/\s+/));
  const wordsB = b.split(/\s+/);
  const common = wordsB.filter(w => wordsA.has(w)).length;
  return (2 * common) / (wordsA.size + wordsB.length);
}

function bestMatch(name, list) {
  let best = null, bestScore = 0;
  for (const item of list) {
    const s = similarity(name, item.name);
    if (s > bestScore) { bestScore = s; best = item; }
  }
  return bestScore > 0.25 ? { item: best, score: bestScore } : null;
}

// ── Highlight active nav link ─────────────────────────────────────
function highlightNav() {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(a => {
    const href = a.getAttribute('href');
    a.classList.toggle('active',
      href === page || (page === '' && href === 'index.html')
    );
  });
}
document.addEventListener('DOMContentLoaded', highlightNav);
