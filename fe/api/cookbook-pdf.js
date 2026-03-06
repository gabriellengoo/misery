const http = require("http");
const https = require("https");

const MAX_REDIRECTS = 5;

function pickClient(urlString) {
  return urlString.startsWith("https:") ? https : http;
}

function fetchWithRedirects(urlString, req, res, redirects = 0) {
  if (redirects > MAX_REDIRECTS) {
    res.status(508).send("Too many redirects while fetching cookbook PDF.");
    return;
  }

  const client = pickClient(urlString);
  const upstreamReq = client.get(
    urlString,
    {
      headers: {
        range: req.headers.range || "",
        "user-agent": req.headers["user-agent"] || "VercelCookbookProxy",
      },
    },
    (upstreamRes) => {
      const status = upstreamRes.statusCode || 502;
      const location = upstreamRes.headers.location;
      if ([301, 302, 303, 307, 308].includes(status) && location) {
        upstreamRes.resume();
        fetchWithRedirects(location, req, res, redirects + 1);
        return;
      }

      res.status(status);
      const passthroughHeaders = [
        "accept-ranges",
        "content-length",
        "content-range",
        "cache-control",
        "etag",
        "last-modified",
      ];
      passthroughHeaders.forEach((name) => {
        if (upstreamRes.headers[name]) {
          res.setHeader(name, upstreamRes.headers[name]);
        }
      });
      res.setHeader("content-type", "application/pdf");
      upstreamRes.pipe(res);
    }
  );

  upstreamReq.on("error", () => {
    if (!res.headersSent) {
      res.status(502).send("Failed to fetch cookbook PDF.");
    }
  });
}

module.exports = (req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("allow", "GET, HEAD");
    res.status(405).send("Method not allowed.");
    return;
  }

  const sourceUrl = String(
    process.env.NUXT_ENV_COOKBOOK_PDF_URL || process.env.COOKBOOK_PDF_URL || ""
  ).trim();

  if (!sourceUrl) {
    res.status(500).send("NUXT_ENV_COOKBOOK_PDF_URL is not configured.");
    return;
  }

  fetchWithRedirects(sourceUrl, req, res);
};
