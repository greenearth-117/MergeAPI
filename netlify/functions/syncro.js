exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin":  "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers };
  if (event.httpMethod !== "POST")    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };

  const org = process.env.SYNCRO_ORG;
  const key = process.env.SYNCRO_API_KEY;

  if (!org || !key) return { statusCode: 500, headers, body: JSON.stringify({ ok: false, error: "Syncro credentials not configured" }) };

  let parsed;
  try { parsed = JSON.parse(event.body); }
  catch { return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: "Invalid JSON body" }) }; }

  const { endpoint, method = "GET", body: reqBody } = parsed;
  if (!endpoint) return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: "Missing endpoint" }) };

  const url = `https://${org}.syncromsp.com/api/v1${endpoint}`;

  try {
    const fetchOpts = {
      method: method.toUpperCase(),
      headers: { accept: "application/json", Authorization: key },
    };
    if (method.toUpperCase() !== "GET" && reqBody) {
      fetchOpts.headers["Content-Type"] = "application/json";
      fetchOpts.body = JSON.stringify(reqBody);
    }
    const resp = await fetch(url, fetchOpts);
    const data = await resp.json();
    return { statusCode: 200, headers, body: JSON.stringify({ status: resp.status, ok: resp.ok, endpoint, data }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ ok: false, error: err.message }) };
  }
};
