// _shared.js — loaded by every page
// Shared API base, state management, helpers, nav highlighting

const MSAL_CONFIG = {
  auth: {
    clientId: "21034253-1cef-4073-a123-b29477e863fb",
    authority:
      "https://login.microsoftonline.com/aecdb3cf-6aad-43c5-a8ec-243900f5e937",
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
};

let _msalInstance = null;

document.addEventListener("DOMContentLoaded", () => {
  const content = document.getElementById("content");
  if (content) content.style.visibility = "hidden";
});

async function initAuth() {
  try {
    await new Promise((resolve, reject) => {
      if (window.msal) return resolve();
      const s = document.createElement("script");
      s.src = "/msal-browser.min.js";
      s.onload = resolve;
      s.onerror = () => reject(new Error("Failed to load msal-browser.min.js"));
      document.head.appendChild(s);
    });

    _msalInstance = new msal.PublicClientApplication(MSAL_CONFIG);
    await _msalInstance.initialize();

    const response = await _msalInstance.handleRedirectPromise();
    if (response) {
      _msalInstance.setActiveAccount(response.account);
    }

    const account =
      _msalInstance.getActiveAccount() ||
      (_msalInstance.getAllAccounts()[0] ?? null);

    if (!account) {
      await _msalInstance.loginRedirect({
        scopes: ["openid", "profile", "email"],
      });
      return;
    }

    _msalInstance.setActiveAccount(account);
    _renderUserChip(account);

    const content = document.getElementById("content");
    if (content) content.style.visibility = "";
  } catch (err) {
    console.error("[MSAL]", err);
    _showAuthError(err.message);
  }
}

function _showAuthError(msg) {
  const content = document.getElementById("content");
  if (!content) return;
  content.style.visibility = "";
  content.innerHTML = `
    <div style="margin:60px auto;max-width:480px;text-align:center">
      <div style="font-size:2rem;margin-bottom:16px">🔒</div>
      <div style="font-size:1rem;font-weight:700;color:#fff;margin-bottom:8px">Authentication failed</div>
      <div style="font-size:0.82rem;color:var(--muted);margin-bottom:20px;word-break:break-word">${msg}</div>
      <button class="btn btn-primary" onclick="initAuth()">Try again</button>
    </div>
  `;
}

function _renderUserChip(account) {
  const topbar = document.getElementById("topbar");
  if (!topbar) return;

  const chip = document.createElement("div");
  chip.id = "user-chip";
  chip.innerHTML = `
    <span id="user-name">${account.name || account.username}</span>
    <button id="sign-out-btn" onclick="signOut()">Sign out</button>
  `;
  topbar.appendChild(chip);
}

function signOut() {
  if (!_msalInstance) return;
  _msalInstance.logoutRedirect({
    postLogoutRedirectUri: window.location.origin,
  });
}

function getActiveUser() {
  const account = _msalInstance?.getActiveAccount();
  return account?.name || account?.username || 'Unknown';
}

document.addEventListener("DOMContentLoaded", initAuth);

// ── API base URL ──────────────────────────────────────────────────
const API = "/.netlify/functions";

// ── Shared state via sessionStorage ──────────────────────────────
// sessionStorage keeps data in memory for the current browser session.
// Navigating between pages keeps the data; closing the tab clears it.
const State = {
  get syncroOrgs() {
    return JSON.parse(sessionStorage.getItem("syncroOrgs") || "[]");
  },
  set syncroOrgs(v) {
    sessionStorage.setItem("syncroOrgs", JSON.stringify(v));
  },
  get syncroAllOrgs() {
    return JSON.parse(sessionStorage.getItem("syncroAllOrgs") || "[]");
  },
  set syncroAllOrgs(v) {
    sessionStorage.setItem("syncroAllOrgs", JSON.stringify(v));
  },
  get ninjaOrgs() {
    return JSON.parse(sessionStorage.getItem("ninjaOrgs") || "[]");
  },
  set ninjaOrgs(v) {
    sessionStorage.setItem("ninjaOrgs", JSON.stringify(v));
  },
  get pax8Orgs() {
    return JSON.parse(sessionStorage.getItem("pax8Orgs") || "[]");
  },
  set pax8Orgs(v) {
    sessionStorage.setItem("pax8Orgs", JSON.stringify(v));
  },
  get matches() {
    return JSON.parse(sessionStorage.getItem("matches") || "[]");
  },
  set matches(v) {
    sessionStorage.setItem("matches", JSON.stringify(v));
  },
  get auditedMap() {
    return JSON.parse(sessionStorage.getItem("auditedMap") || "{}");
  },
  set auditedMap(v) {
    sessionStorage.setItem("auditedMap", JSON.stringify(v));
  },
  get countsData() {
    return JSON.parse(sessionStorage.getItem("countsData") || "{}");
  },
  set countsData(v) {
    sessionStorage.setItem("countsData", JSON.stringify(v));
  },
  get outstandingMap() {
    return JSON.parse(sessionStorage.getItem("outstandingMap") || "{}");
  },
  set outstandingMap(v) {
    sessionStorage.setItem("outstandingMap", JSON.stringify(v));
  },
  get healthMap() {
    return JSON.parse(sessionStorage.getItem("healthMap") || "{}");
  },
  set healthMap(v) {
    sessionStorage.setItem("healthMap", JSON.stringify(v));
  },
};

// ── Generic API proxy call ────────────────────────────────────────
async function api(service, endpoint, method = "GET", body = null) {
  const r = await fetch(`${API}/${service}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ endpoint, method, body }),
  });
  const j = await r.json();
  if (!j.ok) throw new Error(j.error || "API error");
  return j.data;
}

// ── Toast notification ────────────────────────────────────────────
let _nt;
function notify(msg, type = "ok") {
  const el = document.getElementById("notif");
  if (!el) return;
  el.textContent = msg;
  el.className = "show " + type;
  clearTimeout(_nt);
  _nt = setTimeout(() => (el.className = ""), 3200);
}

// ── Fuzzy name matching ───────────────────────────────────────────
function similarity(a, b) {
  a = a
    .toLowerCase()
    .replace(/[^a-z0-9]/g, " ")
    .trim();
  b = b
    .toLowerCase()
    .replace(/[^a-z0-9]/g, " ")
    .trim();
  if (a === b) return 1;
  const wordsA = new Set(a.split(/\s+/));
  const wordsB = b.split(/\s+/);
  const common = wordsB.filter((w) => wordsA.has(w)).length;
  return (2 * common) / (wordsA.size + wordsB.length);
}

function bestMatch(name, list) {
  let best = null,
    bestScore = 0;
  for (const item of list) {
    const s = similarity(name, item.name);
    if (s > bestScore) {
      bestScore = s;
      best = item;
    }
  }
  return bestScore > 0.25 ? { item: best, score: bestScore } : null;
}

// ── Highlight active nav link ─────────────────────────────────────
function highlightNav() {
  const page = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-link").forEach((a) => {
    const href = a.getAttribute("href");
    a.classList.toggle(
      "active",
      href === page || (page === "" && href === "index.html"),
    );
  });
}
document.addEventListener("DOMContentLoaded", highlightNav);
