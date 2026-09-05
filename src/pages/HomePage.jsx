import { brands, reviews, services, SITE } from "../data/site.js";
import { useGoogleRating } from "../hooks/useSiteEffects.js";
import { CtaPanel } from "../components/Layout.jsx";
import { Faq } from "../components/ContentSections.jsx";
import faq from "../data/faq.json";
import catalogCopy from "../data/catalog-copy.json";
import { Carousel } from "../components/Carousel.jsx";

function HeroRating() {
  const { rating, reviews: count } = useGoogleRating();
  return (
    <a className="hero-rating" href="#avaliacoes">
      <strong>
        <span data-google-rating>
          {rating.toLocaleString("pt-BR", { minimumFractionDigits: 1 })}
        </span>{" "}
        <span aria-hidden="true">★</span>
      </strong>
      <span>
        <span data-google-review-count>{count.toLocaleString("pt-BR")}</span>{" "}
        avaliações no Google
      </span>
    </a>
  );
}

function ServiceCards() {
  const priority = ["geladeiras", "maquinas-de-lavar", "lava-e-seca"];
  const ordered = [...services].sort((a, b) => {
    const ai = priority.indexOf(a.slug);
    const bi = priority.indexOf(b.slug);
    if (ai === -1 && bi === -1) return 0;
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  return (
    <div className="service-grid">
      {ordered.map((service) => (
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
            {priority.includes(service.slug) && <span className="kicker">Serviço em destaque</span>}
            <h3>{service.name}</h3>
            <p>
              {catalogCopy.homeSummaries[service.slug] ||
                catalogCopy.serviceSummaries[service.slug]}
            </p>
            <span>Ver assistência →</span>
          </div>
        </a>
      ))}
    </div>
  );
}

export function BrandCarousel({
  title = "Experiência com as principais marcas de linha branca",
  description = "O atendimento depende do equipamento, modelo e disponibilidade de serviço.",
}) {
  return (
    <section className="section section-soft brands-section" aria-labelledby="brands-title">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="kicker">Marcas atendidas</span>
            <h2 id="brands-title">{title}</h2>
            <p>{description}</p>
          </div>
        </div>
        <Carousel label="Marcas atendidas" className="brand-list" autoPlay>
          {brands.map(([name, file]) => (
            <div className={`brand-logo${file ? "" : " is-text-only"}`} key={name}>
              {file && <img src={`/assets/brands/${file}.webp`} alt={name} loading="lazy" />}
              <span className="brand-fallback">{name}</span>
            </div>
          ))}
        </Carousel>
      </div>
    </section>
  );
}

export function Reviews({ title = "Experiências de clientes da D’orus" }) {
  const { rating, reviews: count } = useGoogleRating();
  return (
    <section className="section reviews-section" id="avaliacoes" aria-labelledby="avaliacoes-titulo">
      <div className="container">
        <div className="section-head compact-head">
          <div>
            <span className="kicker">Avaliações do Google</span>
            <h2 id="avaliacoes-titulo">{title}</h2>
            <a
              href="https://www.google.com/maps/search/?api=1&query=Dorus%20Assist%C3%AAncia%20T%C3%A9cnica&query_place_id=ChIJZyk7iQ31zpQR0C-R3wgVywg"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ver perfil no Google
            </a>
            <div className="google-score">
              <strong>{rating.toLocaleString("pt-BR", { minimumFractionDigits: 1 })}</strong>
              <span className="score-stars" aria-label={`${rating} de 5 estrelas`}>★★★★★</span>
              <small>{count.toLocaleString("pt-BR")} avaliações</small>
            </div>
          </div>
        </div>
        <Carousel label="Avaliações de clientes" className="review-carousel">
          {reviews.map(([name, text]) => (
            <article className="review-card" key={name}>
              <div className="review-top">
                <div className="review-avatar">{name[0]}</div>
                <div>
                  <h3>{name}</h3>
                  <small>Google</small>
                </div>
                <span className="google-mark">G</span>
              </div>
              <div className="stars" aria-label="5 estrelas">★★★★★</div>
              <p>“{text}”</p>
            </article>
          ))}
        </Carousel>
      </div>
    </section>
  );
}

export function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">Assistência técnica em domicílio em Guarulhos</span>
            <h1>Conserto de eletrodomésticos em Guarulhos com atendimento em domicílio</h1>
            <p>
              Há mais de 10 anos, a D’orus atende linha branca com diagnóstico técnico,
              comunicação clara e atendimento em domicílio. Geladeiras, máquinas de lavar e
              lava e seca são prioridades, além de outros equipamentos de linha branca.
            </p>
            <div className="actions">
              <a className="button button-green" href={SITE.whatsapp} target="_blank" rel="noopener noreferrer">
                Falar no WhatsApp
              </a>
              <a className="button button-white" href="/agendamento/">Agendar visita</a>
            </div>
            <div className="hero-points">
              <HeroRating />
              <div>
                <strong>+10 anos</strong>
                <span>Mais de 10 anos de experiência</span>
              </div>
              <div>
                <strong>90 dias</strong>
                <span>Garantia mínima nos serviços executados</span>
              </div>
            </div>
          </div>
          <figure className="hero-media">
            <figcaption>
              <strong>Assistência multimarcas</strong>
              <span>Geladeiras, lavadoras, lava e seca, fogões e outros equipamentos de linha branca.</span>
            </figcaption>
            <picture>
              <source media="(max-width:680px)" srcSet="/assets/banner-principal-dorus-mobile.webp" />
              <img
                src="/assets/banner-principal-dorus.webp"
                alt="Eletrodomésticos de linha branca atendidos pela D’orus"
                width="1693"
                height="929"
                fetchPriority="high"
              />
            </picture>
          </figure>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="kicker">Principais serviços</span>
              <h2>Conserto de geladeira, máquina de lavar e lava e seca em Guarulhos</h2>
              <p>
                Escolha o aparelho para ver sintomas comuns, entender como funciona o atendimento
                e falar diretamente com a D’orus.
              </p>
            </div>
            <a className="text-link" href="/servicos/">Ver todos os serviços →</a>
          </div>
          <ServiceCards />
        </div>
      </section>

      <section className="section section-soft">
        <div className="container prose">
          <span className="kicker">Atendimento local</span>
          <h2>Assistência técnica em Guarulhos e regiões próximas</h2>
          <p>
            A D’orus atende em domicílio no Centro de Guarulhos, região do Lago dos Patos,
            Bonsucesso e Pimentas. Outros pontos de Guarulhos são confirmados no contato.
            Atendimento em São Paulo é realizado sob consulta e conforme disponibilidade.
          </p>
          <p>
            Informe o aparelho, marca, modelo e o defeito percebido. Isso ajuda a preparar o
            atendimento e torna o diagnóstico mais objetivo desde o primeiro contato.
          </p>
        </div>
      </section>

      <BrandCarousel />
      <Reviews title="Avaliações reais de quem já chamou a D’orus" />

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="kicker">Como funciona</span>
              <h2>Do primeiro contato ao serviço executado</h2>
            </div>
          </div>
          <div className="trust-grid">
            <article className="trust-card">
              <div className="icon">01</div>
              <h3>Conte o problema</h3>
              <p>Envie aparelho, marca, modelo e o sintoma pelo WhatsApp ou agendamento.</p>
            </article>
            <article className="trust-card">
              <div className="icon">02</div>
              <h3>Agende a visita</h3>
              <p>A região, disponibilidade e condições da visita são confirmadas antes do atendimento.</p>
            </article>
            <article className="trust-card">
              <div className="icon">03</div>
              <h3>Diagnóstico e orçamento</h3>
              <p>O diagnóstico orienta o serviço recomendado e o orçamento antes da execução.</p>
            </article>
            <article className="trust-card">
              <div className="icon">04</div>
              <h3>Serviço com garantia</h3>
              <p>Os serviços executados têm garantia mínima de 90 dias, conforme a ordem de serviço.</p>
            </article>
          </div>
        </div>
      </section>

      <Faq items={faq} title="Dúvidas antes de pedir atendimento" />
      <CtaPanel title="Seu eletrodoméstico apresentou problema?">
        Fale com a D’orus e informe aparelho, marca, modelo e sintoma para iniciar o atendimento.
      </CtaPanel>
    </>
  );
}
