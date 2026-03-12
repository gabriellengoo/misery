const COOKIE_NAME = "miseryparty_gate";

function getHostname(context) {
  if (process.client) {
    return window.location.hostname;
  }

  const req = context.req;
  const forwardedHost = req?.headers?.["x-forwarded-host"];
  const host = forwardedHost || req?.headers?.host || "";
  return host.split(",")[0].trim().split(":")[0];
}

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

function createGateToken(password) {
  const crypto = require("crypto");
  return crypto
    .createHash("sha256")
    .update(`miseryparty:${password}`)
    .digest("hex");
}

function hasGateAccess(context) {
  const cookieHeader = process.client
    ? document.cookie || ""
    : context.req?.headers?.cookie || "";
  const cookies = parseCookies(cookieHeader);
  const cookieValue = cookies[COOKIE_NAME];

  if (!cookieValue) {
    return false;
  }

  if (process.client) {
    return true;
  }

  const configuredPassword = String(
    process.env.NUXT_ENV_SITE_GATE_PASSWORD ||
      process.env.SITE_GATE_PASSWORD ||
      ""
  ).trim();

  if (!configuredPassword) {
    return false;
  }

  return cookieValue === createGateToken(configuredPassword);
}

export default function (context) {
  const { route, redirect } = context;
  const hostname = getHostname(context).toLowerCase();
  const isComingSoonHost = hostname === "miseryparty.org";

  if (!isComingSoonHost) {
    return;
  }

  const path = route.path || "/";
  const isComingSoonRoute =
    path === "/comingsoon" ||
    path === "/comingsoon/" ||
    path.startsWith("/comingsoon/");
  const isUnlocked = hasGateAccess(context);

  if (!isUnlocked && !isComingSoonRoute) {
    redirect("/comingsoon");
    return;
  }

  if (isUnlocked && isComingSoonRoute) {
    redirect("/");
  }
}
