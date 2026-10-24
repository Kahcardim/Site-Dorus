import { guides, services, SITE } from "../data/site.js";
import { CtaPanel, InternalHero, Warranty } from "../components/Layout.jsx";
import { ContentSections, Faq } from "../components/ContentSections.jsx";
import { BrandCarousel, Reviews } from "./HomePage.jsx";
import serviceContent from "../data/service-content.json";
import institutionalContent from "../data/institutional-content.json";
import catalogCopy from "../data/catalog-copy.json";

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
        <div className="container section-head">
          <div>
            <h2>Escolha o aparelho que precisa de assistência</h2>
            <p>
              Veja sintomas comuns, orientações e os canais para solicitar
              atendimento.
            </p>
          </div>
        </div>
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
                  srcSet={`/assets/servicos/mobile/${service.image}-mobile.webp 1x, /assets/servicos/${service.image}.webp 2x`}
                />
                <img
                  src={`/assets/servicos/${service.image}.webp`}
                  alt={`Ilustração de ${service.name.toLowerCase()}`}
                  loading="lazy"
                  width="1254"
                  height="1254"
                />
              </picture>
              <div className="service-card-body">
                <h2>{service.name}</h2>
                <p>{catalogCopy.serviceSummaries[service.slug]}</p>
                <span>Conhecer o serviço →</span>
              </div>
            </a>
          ))}
        </div>
      </section>
      <ContentSections sections={institutionalContent.servicos.sections} />
      <BrandCarousel
        title="Atendimento multimarcas para linha branca"
        description="Samsung, Brastemp, Electrolux, Consul, GE, LG e Bosch. A possibilidade de atendimento depende do aparelho, modelo e serviço necessário."
      />
      <Reviews title="Avaliações de clientes da D’orus" />
      <Faq
        items={institutionalContent.servicos.faq}
        title="Informações antes de solicitar atendimento"
      />
      <CtaPanel title="Conte o que está acontecendo com seu aparelho">
        Envie marca, modelo e uma descrição do problema para iniciar o
        atendimento.
      </CtaPanel>
    </>
  );
}

export function ServiceDetailPage({ service }) {
  const content = serviceContent[service.slug];
  const relatedGuides = guides.filter((guide) =>
    service.guideSlugs.includes(guide.slug),
  );
  const message = encodeURIComponent(
    `Olá, preciso de assistência para ${service.name.toLowerCase()}. ${service.slug === "micro-ondas" ? "Gostaria de consultar retirada e devolução." : "Gostaria de consultar uma visita técnica em domicílio."}\nBairro e cidade: \nMarca e modelo: \nO que está acontecendo: `,
  );
  return (
    <>
      <section className="internal service-detail-hero">
        <div className="container service-hero-grid">
          <div className="service-hero-copy service-hero-copy-centered">
            <span className="eyebrow">{service.name}</span>
            <h1>{content.title}</h1>
            <p>{content.intro}</p>
            <p>
              {service.slug === "micro-ondas"
                ? "Retirada e devolução: combine a cobertura, as condições e a data pelo contato."
                : "Atendimento em domicílio: informe seu bairro para consultar a cobertura e a disponibilidade de visita."}
              {" "}De segunda a sexta-feira, das 8h às 18h.
            </p>
            <div className="actions">
              <a
                className="button button-green"
                href={`${SITE.whatsapp}?text=${message}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Chamar no WhatsApp
              </a>
              <a className="button button-blue" href="/fale-conosco/">
                {service.slug === "micro-ondas"
                  ? "Consultar retirada de micro-ondas"
                  : "Fale conosco"}
              </a>
            </div>
            <Warranty />
            <p>
              <a
                className="text-link"
                href="https://www.google.com/maps/search/?api=1&query=Dorus%20Assist%C3%AAncia%20T%C3%A9cnica&query_place_id=ChIJZyk7iQ31zpQR0C-R3wgVywg"
                target="_blank"
                rel="noopener noreferrer"
              >
                Ver avaliações de clientes da D’orus no Google
              </a>
            </p>
          </div>
          <picture className="service-hero-media">
            <source
              media="(max-width:680px)"
              srcSet={`/assets/servicos/mobile/${service.image}-mobile.webp 1x, /assets/servicos/${service.image}.webp 2x`}
            />
            <img
              src={`/assets/servicos/${service.image}.webp`}
              width="1254"
              height="1254"
              alt={`Ilustração de ${service.name.toLowerCase()}`}
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
              <h2>
                {service.slug === "geladeiras"
                  ? "O que observar antes de solicitar assistência"
                  : "Sinais que ajudam no diagnóstico"}
              </h2>
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
                <h2>
                  {service.slug === "maquinas-de-lavar"
                    ? "Máquina não centrifuga?"
                    : "Entenda melhor os sintomas"}
                </h2>
              </div>
            </div>
            <div className="cards">
              {relatedGuides.map((guide) => (
                <a
                  className="card"
                  href={`/curiosidades/${guide.slug}/`}
                  key={guide.slug}
                >
                  <h3>
                    {catalogCopy.serviceLinks[service.slug]?.find(
                      (link) => link.slug === guide.slug,
                    )?.title || guide.title}
                  </h3>
                  <p>{guide.description}</p>
                  <span>Ler guia →</span>

                </a>
              ))}
            </div>
          </div>
        </section>
      )}
      <section className="section section-soft">
        <div className="container prose">
          <h2>Como solicitar o conserto de {service.name.toLowerCase()}</h2>
          <h3>{content.triageTitle}</h3>
          <p>{content.triageDescription}</p>
          <p>Informe a marca e o modelo para confirmar a possibilidade de atendimento. As condições variam conforme o equipamento.</p>
          <p>{service.slug === "micro-ondas"
            ? `Retirada e devolução em ${SITE.serviceArea}, conforme cobertura e disponibilidade. Região, condições e data são confirmadas no contato.`
            : `A D’orus atende em domicílio em ${SITE.serviceArea}, conforme disponibilidade. A região e a data são confirmadas no contato.`}</p>
          <p>Atendimento de segunda a sexta-feira, das 8h às 18h, conforme disponibilidade. Foto ou vídeo são opcionais no primeiro contato.</p>
          <p>Nas visitas em domicílio, a D’orus cobra uma visita técnica que inclui deslocamento e diagnóstico. O valor é informado antes do agendamento e, quando o reparo é aprovado, é abatido do serviço. Para áreas fora da região principal de atendimento, o valor pode variar conforme a localização e deve ser confirmado antes da visita.</p>
          <p>
            O diagnóstico define o serviço recomendado, as condições do
            orçamento e a previsão, que também depende da disponibilidade de
            peças. Os serviços executados têm garantia mínima de 90 dias,
            conforme a ordem de serviço.
          </p>
          {service.slug === "micro-ondas" ? <a href="/fale-conosco/">Consultar retirada e devolução de micro-ondas</a> : <a href="/agendamento/">Solicitar uma visita técnica</a>}
          <p className="image-note">Imagem ilustrativa do equipamento; não representa um serviço realizado.</p>
        </div>
      </section>
      <Faq items={content.faq} title={`Dúvidas sobre ${service.name.toLowerCase()}`} />
      <CtaPanel title={content.ctaTitle} serviceMode={service.slug === "micro-ondas" ? "Micro-ondas: retirada e devolução" : undefined}>{content.ctaDescription}</CtaPanel>
    </>
  );
}
