import guideContent from "../data/guide-content.json";
import guideListing from "../data/guide-listing.json";
import { ContentSections } from "../components/ContentSections.jsx";
import { CtaPanel, InternalHero } from "../components/Layout.jsx";

const serviceLabels = {
  geladeiras: "conserto de geladeira em Guarulhos",
  "maquinas-de-lavar": "conserto de máquina de lavar em Guarulhos",
  fogoes: "conserto de fogão em Guarulhos",
  freezers: "conserto de freezer em Guarulhos",
  "micro-ondas": "conserto de micro-ondas em Guarulhos",
};

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
  const servicePath = guide.service ? `/servicos/${guide.service}/` : "/servicos/";
  const serviceLabel = serviceLabels[guide.service] || "assistência técnica em Guarulhos";

  return (
    <>
      <InternalHero
        eyebrow={`Guia de ${guide.category.toLowerCase()}`}
        title={content.title}
      >
        <p>{content.intro}</p>
      </InternalHero>
      <ContentSections sections={content.sections} />
      <section className="section section-soft">
        <div className="container prose">
          <span className="kicker">Precisa de avaliação técnica?</span>
          <h2>Conheça nosso serviço de {serviceLabel}</h2>
          <p>
            Se as verificações seguras não resolverem o problema, veja como funciona
            o atendimento da D’orus, os sintomas atendidos e como solicitar uma visita.
          </p>
          <a className="text-link" href={servicePath}>
            Ver {serviceLabel} →
          </a>
        </div>
      </section>
      <CtaPanel />
    </>
  );
}
