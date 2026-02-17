function getHostname(context) {
  if (process.client) {
    return window.location.hostname;
  }

  const req = context.req;
  const forwardedHost = req?.headers?.["x-forwarded-host"];
  const host = forwardedHost || req?.headers?.host || "";
  return host.split(",")[0].trim().split(":")[0];
}

export default function (context) {
  const { route, redirect } = context;
  const hostname = getHostname(context).toLowerCase();
  const isPreorderHost = hostname === "preorder.miseryparty.org";

  if (!isPreorderHost) {
    return;
  }

  const path = route.path || "/";
  const isPreorderRoute = path === "/preorder" || path === "/preorder/" || path.startsWith("/preorder/");

  if (!isPreorderRoute) {
    redirect("/preorder");
  }
}
