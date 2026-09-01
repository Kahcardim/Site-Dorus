import guideContent from "../data/guide-content.json";
import guideListing from "../data/guide-listing.json";
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
  return (
    <>
      <InternalHero
        eyebrow={`Guia de ${guide.category.toLowerCase()}`}
        title={content.title}
      >
        <p>{content.intro}</p>
      </InternalHero>
      <ContentSections sections={content.sections} />
      <CtaPanel />
    </>
  );
}
