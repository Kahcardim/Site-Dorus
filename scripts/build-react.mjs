import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { build, createServer } from "vite";

const root = resolve(import.meta.dirname, "..");
const dist = resolve(root, "dist");
const MAX_INLINE_STYLESHEET_BYTES = 32 * 1024;

async function inlineSmallStylesheets(template) {
  const stylesheetTags = template.match(/<link\b[^>]*>/g) || [];
  let document = template;

  for (const tag of stylesheetTags) {
    if (!/\brel=["']stylesheet["']/.test(tag)) continue;

    const href = tag.match(/\bhref=["']([^"']+\.css)["']/)?.[1];
    if (!href?.startsWith("/assets/")) continue;

    const css = await readFile(resolve(dist, href.slice(1)), "utf8");
    if (Buffer.byteLength(css, "utf8") > MAX_INLINE_STYLESHEET_BYTES) continue;

    document = document.replace(
      tag,
      `<style data-inlined-stylesheet="${href}">${css}</style>`,
    );
  }

  return document;
}

await rm(dist, { recursive: true, force: true });
await build({ root });

const templatePath = resolve(dist, "app.html");
// The generated application stylesheet is currently small (~16 KiB). Inlining
// it removes the HTML -> CSS render-blocking network hop reported by Lighthouse.
// Keep a conservative size guard so a future CSS growth does not bloat every
// prerendered page indefinitely.
const templateWithStyles = await inlineSmallStylesheets(
  await readFile(templatePath, "utf8"),
);
// Vite omits the entry's fetchpriority attribute; preserve the SSG-first priority.
const template = templateWithStyles.replace(
  '<script type="module"',
  '<script type="module" fetchpriority="low"',
);
const vite = await createServer({
  root,
  server: { middlewareMode: true },
  appType: "custom",
});

try {
  const { render, routes } = await vite.ssrLoadModule("/src/entry-server.jsx");
  for (const route of routes) {
    const { html, head } = render(route.path);
    const integrations = [
      '<script defer src="/integrations/analytics.js"></script>',
      route.path === "/agendamento/"
        ? '<script defer src="/integrations/calendar.js"></script>'
        : "",
    ]
      .filter(Boolean)
      .join("\n    ");
    const document = template
      .replace(
        "<!--app-head-->",
        `${head}\n    <meta name="dorus-revision" content="${process.env.DORUS_REVISION || process.env.GITHUB_SHA || "local"}">\n    ${integrations}`,
      )
      .replace("<!--app-html-->", html);

    const output =
      route.path === "/"
        ? resolve(dist, "index.html")
        : route.path === "/404.html"
          ? resolve(dist, "404.html")
          : resolve(dist, route.path.slice(1), "index.html");
    await mkdir(resolve(output, ".."), { recursive: true });
    await writeFile(output, document, "utf8");
  }

  const sitemap = routes
    .filter((route) => route.index)
    .map(
      (route) =>
        `  <url><loc>https://assistenciadorus.com.br${route.path}</loc></url>`,
    )
    .join("\n");
  await writeFile(
    resolve(dist, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemap}\n</urlset>\n`,
    "utf8",
  );
} finally {
  await vite.close();
}

await rm(templatePath, { force: true });
console.log("React SSG: rotas, metadados e sitemap gerados em dist/.");
