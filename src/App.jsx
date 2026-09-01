import { Layout } from "./components/Layout.jsx";
import { findRoute } from "./routes.jsx";
import { breadcrumbsFor } from "./seo.js";

export function App({ path }) {
  const route = findRoute(path);
  const Page = route.Page;
  return (
    <Layout
      path={route.path}
      breadcrumbs={route.index ? breadcrumbsFor(route) : []}
      compactFooter={route.path === "/404.html"}
    >
      <Page />
    </Layout>
  );
}
