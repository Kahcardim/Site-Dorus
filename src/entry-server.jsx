import { renderToString } from "react-dom/server";
import { App } from "./App.jsx";
import { findRoute, routes } from "./routes.jsx";
import { SITE } from "./data/site.js";
import { structuredData } from "./seo.js";

const escape = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

export function render(path) {
  const route = findRoute(path);
  const canonical =
    route.path === "/404.html"
      ? `${SITE.origin}/404.html`
      : `${SITE.origin}${route.path}`;
  const image = `${SITE.origin}${route.image}`;
  const head = [
    `<title>${escape(route.title)}</title>`,
    `<meta name="description" content="${escape(route.description)}">`,
    `<meta name="robots" content="${route.index ? "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" : "noindex, follow"}">`,
    `<link rel="canonical" href="${canonical}">`,
    `<meta property="og:type" content="${route.kind === "article" ? "article" : "website"}">`,
    `<meta property="og:locale" content="pt_BR">`,
    `<meta property="og:site_name" content="${SITE.name}">`,
    `<meta property="og:title" content="${escape(route.title)}">`,
    `<meta property="og:description" content="${escape(route.description)}">`,
    `<meta property="og:url" content="${canonical}">`,
    `<meta property="og:image" content="${image}">`,
    ...(route.imageWidth
      ? [
          `<meta property="og:image:width" content="${route.imageWidth}">`,
          `<meta property="og:image:height" content="${route.imageHeight}">`,
        ]
      : []),
    `<meta property="og:image:alt" content="${escape(route.imageAlt || SITE.name)}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${escape(route.title)}">`,
    `<meta name="twitter:description" content="${escape(route.description)}">`,
    `<meta name="twitter:image" content="${image}">`,
    `<meta name="twitter:image:alt" content="${escape(route.imageAlt || SITE.name)}">`,
    `<link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png">`,
    `<link rel="apple-touch-icon" href="/favicon-192x192.png">`,
    `<link rel="manifest" href="/site.webmanifest">`,
    `<link rel="alternate" hreflang="pt-BR" href="${canonical}">`,
    `<link rel="alternate" hreflang="x-default" href="${canonical}">`,
    `<script type="application/ld+json">${JSON.stringify(structuredData(route)).replaceAll("<", "\\u003c")}</script>`,
  ].join("\n    ");
  return { html: renderToString(<App path={route.path} />), head, route };
}

export { routes };
