import { guides, services, SITE } from "../data/site.js";
import { CtaPanel, InternalHero } from "../components/Layout.jsx";
import { ContentSections, Faq } from "../components/ContentSections.jsx";
import { BrandCarousel, Reviews } from "./HomePage.jsx";
import serviceContent from "../data/service-content.json";
import institutionalContent from "../data/institutional-content.json";

export function ServicesPage() {
  return (
    <>
      <InternalHero
        eyebrow="Serviços"
        title={institutionalContent.servicos.title}
      >
        <p>{institutionalContent.servicos.intro}</p>
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
                  loading="lazy"
                  width="1254"
                  height="1254"
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
      <ContentSections sections={institutionalContent.servicos.sections} />
      <BrandCarousel />
      <Reviews />
      <Faq
        items={institutionalContent.servicos.faq}
        title="Informações antes de solicitar atendimento"
      />
      <CtaPanel />
    </>
  );
}

export function ServiceDetailPage({ service }) {
  const content = serviceContent[service.slug];
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
            <h1>{content.title}</h1>
            <p>{content.intro}</p>
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
            {content.issues.map((issue) => (
              <article className="card" key={issue.title}>
                <h3>{issue.title}</h3>
                <p>{issue.description}</p>
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
                  <span>Ler guia →</span>
                  {service.slug === "micro-ondas" && (
                    <p>Leia os sinais e cuidados de segurança →</p>
                  )}
                </a>
              ))}
            </div>
          </div>
        </section>
      )}
      <section className="section section-soft">
        <div className="container prose">
          <h2>Como solicitar o conserto de {service.name.toLowerCase()}</h2>
          <p>
            Informe marca, modelo, o sintoma e sua cidade. A D’orus atende em
            domicílio em {SITE.serviceArea}, conforme disponibilidade. A região
            e a data são confirmadas no contato.
          </p>
          <p>
            O diagnóstico define o serviço recomendado, as condições do
            orçamento e a previsão, que também depende da disponibilidade de
            peças. Os serviços executados têm garantia mínima de 90 dias,
            conforme a ordem de serviço.
          </p>
          <a href="/agendamento/">Solicitar uma visita técnica</a>
        </div>
      </section>
      <CtaPanel title={content.ctaTitle}>{content.ctaDescription}</CtaPanel>
    </>
  );
}
