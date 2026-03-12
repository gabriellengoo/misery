const crypto = require("crypto");

const API_PATH = "/api/site-gate/unlock";
const COOKIE_NAME = "miseryparty_gate";
const COOKIE_MAX_AGE = 60 * 60 * 12;

function parseCookies(cookieHeader = "") {
  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((cookies, part) => {
      const separatorIndex = part.indexOf("=");
      if (separatorIndex === -1) {
        return cookies;
      }

      const key = part.slice(0, separatorIndex).trim();
      const value = part.slice(separatorIndex + 1).trim();
      cookies[key] = decodeURIComponent(value);
      return cookies;
    }, {});
}

function getGatePassword() {
  return String(
    process.env.NUXT_ENV_SITE_GATE_PASSWORD ||
      process.env.SITE_GATE_PASSWORD ||
      ""
  ).trim();
}

function createGateToken(password) {
  return crypto
    .createHash("sha256")
    .update(`miseryparty:${password}`)
    .digest("hex");
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 10_000) {
        reject(new Error("Request body too large"));
      }
    });

    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

module.exports = async function siteGateMiddleware(req, res, next) {
  if (!req.url || !req.url.startsWith(API_PATH)) {
    next();
    return;
  }

  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Allow", "POST");
    res.end("Method not allowed.");
    return;
  }

  const configuredPassword = getGatePassword();
  if (!configuredPassword) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ ok: false, message: "Site gate password is not configured." }));
    return;
  }

  try {
    const rawBody = await readRequestBody(req);
    const payload = JSON.parse(rawBody || "{}");
    const submittedPassword = String(payload.password || "");

    if (submittedPassword !== configuredPassword) {
      res.statusCode = 401;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ ok: false, message: "Incorrect password." }));
      return;
    }

    const token = createGateToken(configuredPassword);
    const cookieParts = [
      `${COOKIE_NAME}=${encodeURIComponent(token)}`,
      "Path=/",
      `Max-Age=${COOKIE_MAX_AGE}`,
      "SameSite=Lax",
    ];

    if (process.env.NODE_ENV === "production") {
      cookieParts.push("Secure");
    }

    res.statusCode = 200;
    res.setHeader("Set-Cookie", cookieParts.join("; "));
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ ok: true }));
  } catch (error) {
    res.statusCode = 400;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ ok: false, message: "Invalid request payload." }));
  }
};
