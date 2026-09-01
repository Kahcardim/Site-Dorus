import { lazy } from "react";
import { guides, services, SITE } from "./data/site.js";
import seoMetadata from "./data/seo-metadata.json";

// Resolve pages during static generation; split them into route chunks in browsers.
const serverPages = import.meta.env.SSR
  ? Object.assign(
      {},
      ...(await Promise.all([
        import("./pages/HomePage.jsx"),
        import("./pages/GuidePages.jsx"),
        import("./pages/InstitutionalPages.jsx"),
        import("./pages/ServicePages.jsx"),
      ])),
    )
  : {};
const page = (load, name) =>
  serverPages[name] ||
  lazy(() => load().then((module) => ({ default: module[name] })));
const HomePage = page(() => import("./pages/HomePage.jsx"), "HomePage");
const GuidesPage = page(() => import("./pages/GuidePages.jsx"), "GuidesPage");
const GuideDetailPage = page(
  () => import("./pages/GuidePages.jsx"),
  "GuideDetailPage",
);
const AboutPage = page(
  () => import("./pages/InstitutionalPages.jsx"),
  "AboutPage",
);
const ContactPage = page(
  () => import("./pages/InstitutionalPages.jsx"),
  "ContactPage",
);
const SchedulePage = page(
  () => import("./pages/InstitutionalPages.jsx"),
  "SchedulePage",
);
const PrivacyPage = page(
  () => import("./pages/InstitutionalPages.jsx"),
  "PrivacyPage",
);
const NotFoundPage = page(
  () => import("./pages/InstitutionalPages.jsx"),
  "NotFoundPage",
);
const ServicesPage = page(
  () => import("./pages/ServicePages.jsx"),
  "ServicesPage",
);
const ServiceDetailPage = page(
  () => import("./pages/ServicePages.jsx"),
  "ServiceDetailPage",
);

const common = { image: "/assets/banner-principal-dorus.webp", index: true };

export const routes = [
  {
    path: "/",
    title: "D’orus Assistência Técnica em Guarulhos | Linha Branca",
    description: SITE.description,
    Page: HomePage,
    ...common,
  },
  {
    path: "/sobre/",
    title: "Sobre a D’orus Assistência Técnica | Guarulhos",
    description:
      "Conheça a D’orus, assistência técnica de linha branca com mais de 10 anos de experiência e atendimento em domicílio.",
    Page: AboutPage,
    ...common,
  },
  {
    path: "/servicos/",
    title: "Serviços de Assistência Técnica em Guarulhos | D’orus",
    description:
      "Assistência para geladeiras, máquinas de lavar, fogões, freezers, lava-louças, lava e seca, fornos e micro-ondas.",
    Page: ServicesPage,
    ...common,
  },
  ...services.map((service) => ({
    path: `/servicos/${service.slug}/`,
    title: `${service.name}: assistência técnica em Guarulhos | D’orus`,
    description: service.summary,
    image: `/assets/servicos/${service.image}.webp`,
    Page: () => <ServiceDetailPage service={service} />,
    kind: "service",
    index: true,
  })),
  {
    path: "/curiosidades/",
    title: "Guias de Eletrodomésticos | D’orus Assistência Técnica",
    description:
      "Guias práticos para reconhecer sintomas de eletrodomésticos e saber quando procurar assistência técnica.",
    Page: GuidesPage,
    ...common,
  },
  ...guides.map((guide) => ({
    path: `/curiosidades/${guide.slug}/`,
    title: `${guide.title} | D’orus`,
    description: guide.description,
    Page: () => <GuideDetailPage guide={guide} />,
    kind: "article",
    ...common,
  })),
  {
    path: "/agendamento/",
    title: "Agendamento de Assistência Técnica em Guarulhos | D’orus",
    description:
      "Solicite uma visita técnica da D’orus para atendimento em domicílio.",
    Page: SchedulePage,
    ...common,
  },
  {
    path: "/fale-conosco/",
    title: "Fale com a D’orus Assistência Técnica",
    description:
      "Envie os dados do seu eletrodoméstico e continue o atendimento pelo WhatsApp.",
    Page: ContactPage,
    ...common,
  },
  {
    path: "/privacidade/",
    title: "Política de Privacidade | D’orus",
    description:
      "Entenda como a D’orus utiliza dados de contato, preferências e agendamento.",
    Page: PrivacyPage,
    ...common,
  },
  {
    path: "/404.html",
    title: "Página não encontrada | D’orus",
    description: "A página solicitada não foi encontrada.",
    Page: NotFoundPage,
    image: common.image,
    index: false,
  },
].map((route) => ({ ...route, ...seoMetadata[route.path] }));

export function normalizePath(value) {
  if (!value || value === "/index.html") return "/";
  const clean = value
    .split("?")[0]
    .split("#")[0]
    .replace(/\/index\.html$/, "/");
  if (clean === "/404.html") return clean;
  return clean.endsWith("/") ? clean : `${clean}/`;
}

export function findRoute(path) {
  return (
    routes.find((route) => route.path === normalizePath(path)) || routes.at(-1)
  );
}
