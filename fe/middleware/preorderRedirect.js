const isDeployment = Boolean(process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "development");

export default function ({ route, redirect }) {
  if (!isDeployment) {
    return;
  }

  const path = route.path || "/";
  const isPreorderRoute = path === "/preorder" || path === "/preorder/" || path.startsWith("/preorder/");

  if (!isPreorderRoute) {
    redirect("/preorder");
  }
}
