import { guides, services, SITE } from "../data/site.js";
import { CtaPanel, InternalHero, Warranty } from "../components/Layout.jsx";
import { ContentSections, Faq } from "../components/ContentSections.jsx";
import { BrandCarousel, Reviews } from "./HomePage.jsx";
import serviceContent from "../data/service-content.json";
import institutionalContent from "../data/institutional-content.json";
import catalogCopy from "../data/catalog-copy.json";

const priorityServices = new Set(["geladeiras", "maquinas-de-lavar", "lava-e-seca"]);

const serviceIntentCopy = {
  geladeiras: {
    kicker: "Conserto de geladeira em Guarulhos",
    lead: "Atendimento em domicílio para geladeiras que não gelam, formam gelo em excesso, vazam água, fazem ruídos diferentes ou apresentam funcionamento irregular.",
    aliases: "Também atendemos buscas por assistência técnica de geladeira, manutenção de geladeira e técnico de geladeira em Guarulhos.",
  },
  "maquinas-de-lavar": {
    kicker: "Conserto de máquina de lavar em Guarulhos",
    lead: "Atendimento em domicílio para máquinas de lavar e lavadoras com falhas de centrifugação, drenagem, enchimento, vazamentos, ruídos ou ciclos interrompidos.",
    aliases: "Máquina de lavar e lavadora são tratadas como o mesmo serviço: assistência técnica, diagnóstico e conserto conforme o defeito apresentado.",
  },
  "lava-e-seca": {
    kicker: "Conserto de lava e seca em Guarulhos",
    lead: "Atendimento para lava e seca com falhas na lavagem, centrifugação, drenagem, secagem, códigos de erro ou interrupções de programa.",
    aliases: "O diagnóstico considera marca, modelo, código exibido no painel e o comportamento do equipamento durante o ciclo.",
  },
};

export function ServicesPage() {
  const orderedServices = [...services].sort((a, b) => {
    const order = ["geladeiras", "maquinas-de-lavar", "lava-e-seca"];
    const aIndex = order.indexOf(a.slug);
    const bIndex = order.indexOf(b.slug);
    if (aIndex === -1 && bIndex === -1) return 0;
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  return (
    <>
      <InternalHero eyebrow="Serviços" title={institutionalContent.servicos.title}>
        <p>{institutionalContent.servicos.intro}</p>
      </InternalHero>
      <section className="section">
        <div className="container section-head">
          <div>
            <span className="kicker">Assistência técnica em Guarulhos</span>
            <h2>Conserto de eletrodomésticos com páginas específicas por aparelho</h2>
            <p>
              Geladeiras, máquinas de lavar e lava e seca são as prioridades de
              atendimento desta página, seguidas pelos demais equipamentos de linha branca.
            </p>
          </div>
        </div>
        <div className="container service-grid">
          {orderedServices.map((service) => (
            <a className="service-card" href={`/servicos/${service.slug}/`} key={service.slug}>
              <picture className="service-card-media">
                <source
                  media="(max-width:680px)"
                  srcSet={`/assets/servicos/mobile/${service.image}-mobile.webp 1x, /assets/servicos/${service.image}.webp 2x`}
                />
                <img
                  src={`/assets/servicos/${service.image}.webp`}
                  alt={service.name}
                  loading="lazy"
                  width="1254"
                  height="1254"
                />
              </picture>
              <div className="service-card-body">
                {priorityServices.has(service.slug) && <span className="kicker">Serviço em destaque</span>}
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
      <Faq items={institutionalContent.servicos.faq} title="Informações antes de solicitar atendimento" />
      <CtaPanel title="Conte o que está acontecendo com seu aparelho">
        Envie marca, modelo e uma descrição do problema para iniciar o atendimento.
      </CtaPanel>
    </>
  );
}

export function ServiceDetailPage({ service }) {
  const content = serviceContent[service.slug];
  const relatedGuides = guides.filter((guide) => service.guideSlugs.includes(guide.slug));
  const message = encodeURIComponent(`Olá, preciso de assistência para ${service.name.toLowerCase()}.`);
  const intent = serviceIntentCopy[service.slug];

  return (
    <>
      <section className="internal service-detail-hero">
        <div className="container service-hero-grid">
          <div className="service-hero-copy service-hero-copy-centered">
            <span className="eyebrow">{intent?.kicker || service.name}</span>
            <h1>{content.title}</h1>
            <p>{content.intro}</p>
            {intent && <p>{intent.lead}</p>}
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
            <Warranty />
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
              <h2>{service.slug === "geladeiras" ? "O que observar antes de solicitar assistência" : "Sinais que ajudam no diagnóstico"}</h2>
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

      {intent && (
        <section className="section section-soft">
          <div className="container prose">
            <span className="kicker">Atendimento local</span>
            <h2>{intent.kicker}</h2>
            <p>{intent.aliases}</p>
            <p>
              A D’orus realiza atendimento em domicílio em Guarulhos. Centro de Guarulhos,
              região do Lago dos Patos, Bonsucesso e Pimentas estão entre as áreas de atendimento.
              Solicitações em São Paulo são avaliadas conforme localização e disponibilidade.
            </p>
            <p>
              Antes da visita, informe marca, modelo e o sintoma observado. O diagnóstico orienta
              o orçamento e evita troca de componentes sem necessidade.
            </p>
          </div>
        </section>
      )}

      {relatedGuides.length > 0 && (
        <section className="section section-soft">
          <div className="container">
            <div className="section-head">
              <div>
                <span className="kicker">Guias relacionados</span>
                <h2>{service.slug === "maquinas-de-lavar" ? "Máquina não centrifuga?" : "Entenda melhor os sintomas"}</h2>
              </div>
            </div>
            <div className="cards">
              {relatedGuides.map((guide) => (
                <a className="card" href={`/curiosidades/${guide.slug}/`} key={guide.slug}>
                  <h3>
                    {catalogCopy.serviceLinks[service.slug]?.find((link) => link.slug === guide.slug)?.title || guide.title}
                  </h3>
                  <p>{guide.description}</p>
                  <span>Ler guia →</span>
                  {service.slug === "micro-ondas" && <p>Leia os sinais e cuidados de segurança →</p>}
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {priorityServices.has(service.slug) && (
        <>
          <BrandCarousel
            title={`Marcas atendidas para ${service.name.toLowerCase()}`}
            description="Samsung, Brastemp, Electrolux, Consul, GE, LG e Bosch, conforme aparelho, modelo e serviço necessário."
          />
          <Reviews title={`Confiança para solicitar ${service.slug === "geladeiras" ? "conserto de geladeira" : service.slug === "maquinas-de-lavar" ? "conserto de máquina de lavar" : "conserto de lava e seca"}`} />
        </>
      )}

      <section className="section section-soft">
        <div className="container prose">
          <h2>Como solicitar o conserto de {service.name.toLowerCase()}</h2>
          <p>
            Informe marca, modelo, o sintoma e sua cidade. A D’orus atende em domicílio em {SITE.serviceArea}, conforme disponibilidade. A região e a data são confirmadas no contato.
          </p>
          <p>
            O diagnóstico define o serviço recomendado, as condições do orçamento e a previsão,
            que também depende da disponibilidade de peças. Os serviços executados têm garantia
            mínima de 90 dias, conforme as condições da ordem de serviço.
          </p>
          <a href="/agendamento/">Solicitar uma visita técnica</a>
        </div>
      </section>
      <CtaPanel title={content.ctaTitle}>{content.ctaDescription}</CtaPanel>
    </>
  );
}
