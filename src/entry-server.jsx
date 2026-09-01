import { renderToString } from "react-dom/server";
import { App } from "./App.jsx";
import { findRoute, routes } from "./routes.jsx";
import { SITE } from "./data/site.js";

const escape = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

function schema(route) {
  if (route.path === "/")
    return {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${SITE.origin}/#organization`,
      name: SITE.name,
      url: `${SITE.origin}/`,
      telephone: "+55-11-91357-3932",
      foundingDate: "2014",
      logo: `${SITE.origin}/assets/dorus-logo-3d.webp`,
      areaServed: SITE.serviceArea
        .split(", ")
        .map((name) => ({ "@type": "City", name })),
    };
  if (route.kind === "article")
    return {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: route.title.split("|")[0].trim(),
      description: route.description,
      mainEntityOfPage: `${SITE.origin}${route.path}`,
      author: { "@id": `${SITE.origin}/#organization` },
    };
  if (route.kind === "service")
    return {
      "@context": "https://schema.org",
      "@type": "Service",
      name: route.title.split("|")[0].trim(),
      description: route.description,
      provider: { "@id": `${SITE.origin}/#organization` },
      areaServed: SITE.serviceArea,
    };
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Início",
        item: `${SITE.origin}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: route.title.split("|")[0].trim(),
        item: `${SITE.origin}${route.path}`,
      },
    ],
  };
}

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
    `<meta name="robots" content="${route.index ? "index, follow, max-image-preview:large" : "noindex, follow"}">`,
    `<link rel="canonical" href="${canonical}">`,
    `<meta property="og:type" content="${route.kind === "article" ? "article" : "website"}">`,
    `<meta property="og:locale" content="pt_BR">`,
    `<meta property="og:site_name" content="${SITE.name}">`,
    `<meta property="og:title" content="${escape(route.title)}">`,
    `<meta property="og:description" content="${escape(route.description)}">`,
    `<meta property="og:url" content="${canonical}">`,
    `<meta property="og:image" content="${image}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png">`,
    `<link rel="apple-touch-icon" href="/favicon-192x192.png">`,
    `<link rel="manifest" href="/site.webmanifest">`,
    `<link rel="alternate" hreflang="pt-BR" href="${canonical}">`,
    `<script type="application/ld+json">${JSON.stringify(schema(route)).replaceAll("<", "\\u003c")}</script>`,
  ].join("\n    ");
  return { html: renderToString(<App path={route.path} />), head, route };
}

export { routes };
