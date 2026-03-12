const crypto = require("crypto");

const COOKIE_NAME = "miseryparty_gate";
const COOKIE_MAX_AGE = 60 * 60 * 12;

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

module.exports = (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ ok: false, message: "Method not allowed." });
    return;
  }

  const configuredPassword = getGatePassword();
  if (!configuredPassword) {
    res
      .status(500)
      .json({ ok: false, message: "Site gate password is not configured." });
    return;
  }

  const submittedPassword = String(req.body?.password || "");

  if (submittedPassword !== configuredPassword) {
    res.status(401).json({ ok: false, message: "Incorrect password." });
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

  res.setHeader("Set-Cookie", cookieParts.join("; "));
  res.status(200).json({ ok: true });
};
