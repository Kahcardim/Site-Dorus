import { guides, services } from "../data/site.js";
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
      <section className="section">
        <div className="container tips">
          {guides.map((guide) => (
            <a
              className="card"
              href={`/curiosidades/${guide.slug}/`}
              key={guide.slug}
            >
              <span className="kicker">{guide.category}</span>
              <h2>{guide.title}</h2>
              <p>{guide.description}</p>
            </a>
          ))}
        </div>
      </section>
      <section className="section section-soft">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="kicker">Problemas por aparelho</span>
              <h2>Encontre assistência para os oito equipamentos</h2>
            </div>
          </div>
          <div className="common-problems-grid">
            {services.map((service) => (
              <a
                className="card common-problem-card"
                href={`/servicos/${service.slug}/`}
                key={service.slug}
              >
                <span className="kicker">{service.name}</span>
                <h3>{service.issues.slice(0, 3).join(", ")}</h3>
                <p>{service.summary}</p>
                <span className="common-problem-link">Ver assistência →</span>
              </a>
            ))}
          </div>
        </div>
      </section>
      <CtaPanel />
    </>
  );
}

export function GuideDetailPage({ guide }) {
  const service = services.find((item) => item.slug === guide.service);
  return (
    <>
      <InternalHero
        eyebrow={`Guia de ${guide.category.toLowerCase()}`}
        title={guide.title}
      >
        <p>{guide.description}</p>
      </InternalHero>
      <section className="section">
        <div className="container content-grid">
          <div>
            <span className="kicker">Primeiras verificações</span>
            <h2>Comece pelo que é simples e seguro.</h2>
          </div>
          <div className="prose">
            <p>
              Observe o comportamento do equipamento antes de solicitar
              assistência. Essas informações ajudam a preparar o diagnóstico.
            </p>
            <ul>
              {guide.checks.map((check) => (
                <li key={check}>{check}</li>
              ))}
            </ul>
            <p>
              <strong>{guide.warning}</strong>
            </p>
          </div>
        </div>
      </section>
      <section className="section section-soft">
        <div className="container cta-panel">
          <div>
            <span className="kicker">Quando chamar assistência</span>
            <h2>O problema continua após as verificações básicas?</h2>
            <p>
              A D’orus realiza atendimento em domicílio conforme a área de
              cobertura.
            </p>
          </div>
          <a className="button button-blue" href={`/servicos/${service.slug}/`}>
            Ver assistência para {service.name.toLowerCase()}
          </a>
        </div>
      </section>
      <CtaPanel />
    </>
  );
}
