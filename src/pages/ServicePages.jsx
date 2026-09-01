import { guides, services, SITE } from "../data/site.js";
import { CtaPanel, InternalHero } from "../components/Layout.jsx";

export function ServicesPage() {
  return (
    <>
      <InternalHero
        eyebrow="Serviços"
        title="Assistência técnica para eletrodomésticos de linha branca."
      >
        <p>
          Atendimento em domicílio para oito categorias de equipamentos,
          conforme marca, modelo e disponibilidade.
        </p>
      </InternalHero>
      <section className="section">
        <div className="container service-grid">
          {services.map((service) => (
            <a
              className="service-card"
              href={`/servicos/${service.slug}/`}
              key={service.slug}
            >
              <picture className="service-card-media">
                <source
                  media="(max-width:680px)"
                  srcSet={`/assets/servicos/mobile/${service.image}-mobile.webp`}
                />
                <img
                  src={`/assets/servicos/${service.image}.webp`}
                  alt={service.name}
                />
              </picture>
              <div className="service-card-copy">
                <h2>{service.name}</h2>
                <p>{service.summary}</p>
                <span>Conhecer o serviço →</span>
              </div>
            </a>
          ))}
        </div>
      </section>
      <CtaPanel />
    </>
  );
}

export function ServiceDetailPage({ service }) {
  const relatedGuides = guides.filter((guide) =>
    service.guideSlugs.includes(guide.slug),
  );
  const message = encodeURIComponent(
    `Olá, preciso de assistência para ${service.name.toLowerCase()}.`,
  );
  return (
    <>
      <section className="internal service-detail-hero">
        <div className="container service-hero-grid">
          <div className="service-hero-copy">
            <span className="eyebrow">{service.name}</span>
            <h1>{service.title}.</h1>
            <p>{service.summary}</p>
            <div className="actions">
              <a
                className="button button-green"
                href={`${SITE.whatsapp}?text=${message}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Chamar no WhatsApp
              </a>
            </div>
          </div>
          <picture className="service-hero-media">
            <source
              media="(max-width:680px)"
              srcSet={`/assets/servicos/mobile/${service.image}-mobile.webp`}
            />
            <img
              src={`/assets/servicos/${service.image}.webp`}
              width="1254"
              height="1254"
              alt={`${service.name} atendido pela D’orus`}
              fetchPriority="high"
            />
          </picture>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="kicker">Problemas comuns</span>
              <h2>Sinais que ajudam no diagnóstico</h2>
            </div>
          </div>
          <div className="cards">
            {service.issues.map((issue) => (
              <article className="card" key={issue}>
                <h3>{issue}</h3>
                <p>
                  Registre quando o sintoma aparece e evite desmontar ou forçar
                  o equipamento.
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
      {relatedGuides.length > 0 && (
        <section className="section section-soft">
          <div className="container">
            <div className="section-head">
              <div>
                <span className="kicker">Guias relacionados</span>
                <h2>Entenda melhor os sintomas</h2>
              </div>
            </div>
            <div className="cards">
              {relatedGuides.map((guide) => (
                <a
                  className="card"
                  href={`/curiosidades/${guide.slug}/`}
                  key={guide.slug}
                >
                  <h3>{guide.title}</h3>
                  <p>{guide.description}</p>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}
      <CtaPanel title={`Conte o problema do seu equipamento.`}>
        Informe marca, modelo, foto e uma breve descrição do defeito.
      </CtaPanel>
    </>
  );
}
