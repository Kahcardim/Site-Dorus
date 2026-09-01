import { Layout } from "./components/Layout.jsx";
import { findRoute } from "./routes.jsx";

export function App({ path }) {
  const route = findRoute(path);
  const Page = route.Page;
  return (
    <Layout path={route.path} compactFooter={route.path === "/404.html"}>
      <Page />
    </Layout>
  );
}
