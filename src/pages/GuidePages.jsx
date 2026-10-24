import guideContent from "../data/guide-content.json";
import guideListing from "../data/guide-listing.json";
import { services } from "../data/site.js";
import { ContentSections } from "../components/ContentSections.jsx";
import { CtaPanel, InternalHero } from "../components/Layout.jsx";

export function GuidesPage() {
  return (
    <>
      <InternalHero
        eyebrow="Guias e cuidados"
        title="Entenda os sinais do seu eletrodoméstico."
      >
        <p>
          Conteúdo prático para reconhecer sintomas, evitar improvisos e chegar
          mais preparado ao atendimento técnico.
        </p>
      </InternalHero>
      <ContentSections sections={guideListing} />
      <CtaPanel />
    </>
  );
}

export function GuideDetailPage({ guide }) {
  const content = guideContent[guide.slug];
  const service = services.find((item) => item.slug === guide.service);
  return (
    <>
      <InternalHero
        eyebrow={`Guia de ${guide.category.toLowerCase()}`}
        title={content.title}
      >
        <p>{content.intro}</p>
        {service && (
          <p>
            Precisa de atendimento? Conheça o{" "}
            <a className="text-link" href={`/servicos/${service.slug}/`}>
              conserto de {service.name.toLowerCase()} em Guarulhos
            </a>
            {service.slug === "micro-ondas"
              ? ", com retirada e devolução combinadas antes."
              : ", com visita técnica em domicílio conforme disponibilidade."}
          </p>
        )}
      </InternalHero>
      <ContentSections sections={content.sections} />
      <CtaPanel serviceMode={guide.slug === "micro-ondas-nao-aquece" ? "Micro-ondas: retirada e devolução" : undefined} />
    </>
  );
}
