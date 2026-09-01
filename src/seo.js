import { SITE } from "./data/site.js";

export function breadcrumbsFor(route) {
  const items = [{ name: "Início", path: "/" }];
  if (route.path === "/") return items;
  if (route.kind === "service")
    items.push({ name: "Serviços", path: "/servicos/" });
  if (route.kind === "article")
    items.push({ name: "Guias", path: "/curiosidades/" });
  items.push({ name: route.title.split("|")[0].trim(), path: route.path });
  return items;
}

export function structuredData(route) {
  const url = SITE.origin + route.path;
  const orgId = SITE.origin + "/#organization";
  const websiteId = SITE.origin + "/#website";
  const areaServed = SITE.cities.map((name) => ({ "@type": "City", name }));
  const organization = {
    "@type": "Organization",
    "@id": orgId,
    name: SITE.name,
    alternateName: ["D’orus", "Dorus Assistência Técnica"],
    url: SITE.origin + "/",
    telephone: "+55-11-91357-3932",
    foundingDate: "2014",
    logo: SITE.origin + "/assets/dorus-logo-3d.webp",
    sameAs: [SITE.instagram],
    areaServed,
  };
  const website = {
    "@type": "WebSite",
    "@id": websiteId,
    name: SITE.name,
    url: SITE.origin + "/",
    inLanguage: "pt-BR",
    publisher: { "@id": orgId },
  };
  const page = {
    "@type":
      route.path === "/sobre/"
        ? "AboutPage"
        : route.path === "/fale-conosco/"
          ? "ContactPage"
          : "WebPage",
    "@id": url + "#webpage",
    url,
    name: route.title,
    description: route.description,
    inLanguage: "pt-BR",
    isPartOf: { "@id": websiteId },
    about: { "@id": orgId },
  };
  const graph = [organization, website, page];
  if (route.path !== "/" && route.index) {
    const breadcrumb = {
      "@type": "BreadcrumbList",
      "@id": url + "#breadcrumb",
      itemListElement: breadcrumbsFor(route).map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: SITE.origin + item.path,
      })),
    };
    page.breadcrumb = { "@id": breadcrumb["@id"] };
    graph.push(breadcrumb);
  }
  if (route.kind === "article")
    graph.push({
      "@type": "Article",
      "@id": url + "#article",
      headline: route.title.split("|")[0].trim(),
      description: route.description,
      inLanguage: "pt-BR",
      image: SITE.origin + route.image,
      mainEntityOfPage: { "@id": page["@id"] },
      author: { "@id": orgId },
      publisher: { "@id": orgId },
    });
  if (route.kind === "service")
    graph.push({
      "@type": "Service",
      "@id": url + "#service",
      url,
      name: route.title.split("|")[0].trim(),
      serviceType: route.title.split("|")[0].trim(),
      description: route.description,
      provider: { "@id": orgId },
      areaServed,
      mainEntityOfPage: { "@id": page["@id"] },
    });
  return { "@context": "https://schema.org", "@graph": graph };
}
