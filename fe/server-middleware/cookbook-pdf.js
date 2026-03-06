const http = require("http");
const https = require("https");

const API_PATH = "/api/cookbook.pdf";
const MAX_REDIRECTS = 5;

function pickClient(urlString) {
  return urlString.startsWith("https:") ? https : http;
}

function proxyPdf(urlString, req, res, redirects = 0) {
  if (redirects > MAX_REDIRECTS) {
    res.statusCode = 508;
    res.end("Too many redirects while fetching cookbook PDF.");
    return;
  }

  const client = pickClient(urlString);
  const upstreamReq = client.get(
    urlString,
    {
      headers: {
        range: req.headers.range || "",
        "user-agent": req.headers["user-agent"] || "NuxtCookbookProxy",
      },
    },
    (upstreamRes) => {
      const status = upstreamRes.statusCode || 502;
      const location = upstreamRes.headers.location;
      if ([301, 302, 303, 307, 308].includes(status) && location) {
        upstreamRes.resume();
        proxyPdf(location, req, res, redirects + 1);
        return;
      }

      res.statusCode = status;
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
      res.statusCode = 502;
      res.end("Failed to fetch cookbook PDF.");
    }
  });
}

module.exports = function cookbookPdfMiddleware(req, res, next) {
  if (!req.url || !req.url.startsWith(API_PATH)) {
    next();
    return;
  }

  const sourceUrl = String(process.env.NUXT_ENV_COOKBOOK_PDF_URL || "").trim();
  if (!sourceUrl) {
    res.statusCode = 500;
    res.end("NUXT_ENV_COOKBOOK_PDF_URL is not configured.");
    return;
  }

  proxyPdf(sourceUrl, req, res);
};
