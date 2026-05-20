const { getStore } = (() => {
  try { return require("@netlify/blobs"); }
  catch { return { getStore: null }; }
})();

const STORE_KEY = "audit-flags";

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin":  "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers };

  if (!getStore) return { statusCode: 500, headers, body: JSON.stringify({ ok: false, error: "@netlify/blobs not available" }) };

  const siteID = process.env.NETLIFY_SITE_ID;
  const token  = process.env.NETLIFY_AUTH_TOKEN;

  if (!siteID || !token) return {
    statusCode: 500, headers,
    body: JSON.stringify({ ok: false, error: "NETLIFY_SITE_ID or NETLIFY_AUTH_TOKEN not set" })
  };

  const store = getStore({ name: "msp-console", siteID, token });

  // GET — load audit flags
  if (event.httpMethod === "GET") {
    try {
      const raw = await store.get(STORE_KEY);
      if (!raw) return { statusCode: 200, headers, body: JSON.stringify({ audited: {} }) };
      return { statusCode: 200, headers, body: raw };
    } catch (err) {
      return { statusCode: 500, headers, body: JSON.stringify({ ok: false, error: err.message }) };
    }
  }

  // POST — save audit flags
  if (event.httpMethod === "POST") {
    try {
      let parsed;
      try { parsed = JSON.parse(event.body); }
      catch { return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: "Invalid JSON" }) }; }
      await store.set(STORE_KEY, JSON.stringify(parsed));
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    } catch (err) {
      return { statusCode: 500, headers, body: JSON.stringify({ ok: false, error: err.message }) };
    }
  }

  return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
};
