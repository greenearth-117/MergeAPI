Blank
exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin":  "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers };
  if (event.httpMethod !== "POST")    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };

  const clientId     = process.env.PAX8_CLIENT_ID;
  const clientSecret = process.env.PAX8_SECRET;

  if (!clientId || !clientSecret) return { statusCode: 500, headers, body: JSON.stringify({ ok: false, error: "Pax8 credentials not configured" }) };

  let parsed;
  try { parsed = JSON.parse(event.body); }
  catch { return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: "Invalid JSON body" }) }; }

  const { endpoint, method = "GET", body: reqBody } = parsed;
  if (!endpoint) return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: "Missing endpoint" }) };

  try {
    const tokenResp = await fetch("https://api.pax8.com/v1/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id:     clientId,
        client_secret: clientSecret,
        audience:      "https://api.pax8.com",
        grant_type:    "client_credentials",
      }),
    });
    const tokenData = await tokenResp.json();
    const token = tokenData.access_token;
    if (!token) throw new Error("Failed to obtain Pax8 access token");

    const url = `https://api.pax8.com${endpoint}`;
    const fetchOpts = {
      method: method.toUpperCase(),
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
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
