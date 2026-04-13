const { getStore } = (() => {
  try { return require("@netlify/blobs"); }
  catch { return { getStore: null }; }
})();

const STORE_KEY = "org-matches";

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin":  "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers };

  // GET — load saved matches
  if (event.httpMethod === "GET") {
    try {
      if (!getStore) return { statusCode: 200, headers, body: JSON.stringify({ matches: [], updated: "" }) };
      const store = getStore("msp-console");
      const raw   = await store.get(STORE_KEY);
      if (!raw)   return { statusCode: 200, headers, body: JSON.stringify({ matches: [], updated: "" }) };
      return { statusCode: 200, headers, body: raw };
    } catch (err) {
      return { statusCode: 500, headers, body: JSON.stringify({ ok: false, error: err.message }) };
    }
  }

  // POST — save matches
  if (event.httpMethod === "POST") {
    try {
      let parsed;
      try { parsed = JSON.parse(event.body); }
      catch { return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: "Invalid JSON" }) }; }

      parsed.updated = new Date().toISOString();
      const payload  = JSON.stringify(parsed);

      if (getStore) {
        const store = getStore("msp-console");
        await store.set(STORE_KEY, payload);
      }
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, count: parsed.matches?.length ?? 0 }) };
    } catch (err) {
      return { statusCode: 500, headers, body: JSON.stringify({ ok: false, error: err.message }) };
    }
  }

  return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
};
