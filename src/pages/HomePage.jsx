import { brands, services, SITE } from "../data/site.js";
import googleReviews from "../data/google-reviews.json";
import { useGoogleRating } from "../hooks/useSiteEffects.js";
import { CtaPanel } from "../components/Layout.jsx";
import { Faq } from "../components/ContentSections.jsx";
import faq from "../data/faq.json";
import catalogCopy from "../data/catalog-copy.json";
import { Carousel } from "../components/Carousel.jsx";

const featuredGuides = [
  {
    slug: "geladeira-nao-gela",
    title: "Geladeira não gela",
    description: "Veja causas comuns e quando chamar assistência.",
  },
  {
    slug: "maquina-nao-centrifuga",
    title: "Máquina não centrifuga",
    description: "Entenda os sintomas mais frequentes.",
  },
  {
    slug: "micro-ondas-nao-aquece",
    title: "Micro-ondas não aquece",
    description: "Saiba quais sinais pedem avaliação.",
  },
];

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
  return (
    <div className="service-grid">
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
              alt={service.name}
              loading="lazy"
              width="1254"
              height="1254"
            />
          </picture>
          <div className="service-card-body">
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
    <section
      className="section section-soft brands-section"
      aria-labelledby="brands-title"
    >
      <div className="container">
        <div className="section-head">
          <div>
            <span className="kicker">Marcas atendidas</span>
            <h2 id="brands-title">{title}</h2>
            <p>{description}</p>
          </div>
        </div>
        <Carousel label="Marcas atendidas" className="brand-list" autoPlay>
          {brands.map(([name, file]) => {
            const asset = file
              ? `/assets/brands/${file}.webp`
              : name === "Bosch"
                ? "/assets/brands/bosch.svg"
                : null;
            return (
              <div
                className={`brand-logo${asset ? "" : " is-text-only"}`}
                key={name}
              >
                {asset && <img src={asset} alt={name} loading="lazy" />}
                <span className="brand-fallback">{name}</span>
              </div>
            );
          })}
        </Carousel>
      </div>
    </section>
  );
}

export function Reviews({ title = "Experiências de clientes da D’orus" }) {
  const { rating, reviews: count } = useGoogleRating();
  const selectedReviews = googleReviews.reviews.slice(0, 10);
  return (
    <section
      className="section reviews-section"
      id="avaliacoes"
      aria-labelledby="avaliacoes-titulo"
    >
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
              <strong>
                {rating.toLocaleString("pt-BR", { minimumFractionDigits: 1 })}
              </strong>
              <span
                className="score-stars"
                aria-label={`${rating} de 5 estrelas`}
              >
                ★★★★★
              </span>
              <small>{count.toLocaleString("pt-BR")} avaliações</small>
            </div>
          </div>
        </div>
        <Carousel
          label="Avaliações de clientes"
          className="review-carousel"
          autoPlay
          showNavigation={false}
          pauseOnPointer={false}
          interval={4500}
        >
          {selectedReviews.map((review) => (
            <article className="review-card" key={`${review.author}-${review.text}`}>
              <div className="review-top">
                <div className="review-avatar">{review.author[0]}</div>
                <div>
                  <h3>{review.author}</h3>
                  <small>
                    Google{review.relativeTime ? ` · ${review.relativeTime}` : ""}
                  </small>
                </div>
                <span className="google-mark">G</span>
              </div>
              <div className="stars" aria-label={`${review.rating} estrelas`}>
                {"★".repeat(review.rating)}
              </div>
              <p>“{review.displayText || review.text}”</p>
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
            <span className="eyebrow">Assistência técnica em domicílio</span>
            <h1>Assistência técnica de linha branca em Guarulhos e região.</h1>
            <p>
              Há mais de 10 anos, a D’orus realiza conserto e manutenção de
              geladeiras, máquinas de lavar, fogões, freezers e outros
              eletrodomésticos de linha branca, com diagnóstico técnico,
              comunicação clara e atendimento em domicílio em {SITE.serviceArea}.
            </p>
            <div className="actions">
              <a
                className="button button-green"
                href={SITE.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
              >
                Falar no WhatsApp
              </a>
              <a className="button button-white" href="/agendamento/">
                Agendar visita
              </a>
            </div>
            <div className="hero-points">
              <HeroRating />
              <div>
                <strong>+10 anos</strong>
                <span>Mais de 10 anos de experiência</span>
              </div>
              <div>
                <strong>Garantia</strong>
                <span>Garantia mínima de 90 dias</span>
              </div>
            </div>
          </div>
          <figure className="hero-media">
            <figcaption>
              <strong>Assistência multimarcas</strong>
              <span>
                Geladeiras, lavadoras, fogões e outros equipamentos de linha
                branca.
              </span>
            </figcaption>
            <picture>
              <source
                media="(max-width:680px)"
                srcSet="/assets/banner-principal-dorus-mobile.webp"
              />
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
      <section className="section home-services-section">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="kicker">Serviços</span>
              <h2>Conserto de eletrodomésticos de linha branca em Guarulhos</h2>
              <p>
                Escolha o aparelho para conhecer problemas comuns, orientações e
                solicitar assistência técnica.
              </p>
            </div>
            <a className="text-link" href="/servicos/">
              Ver todos os serviços →
            </a>
          </div>
          <ServiceCards />
        </div>
      </section>
      <Reviews />
      <BrandCarousel />
      <section className="section section-blue home-flow-section">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="kicker">Como funciona</span>
              <h2>Da pesquisa ao atendimento</h2>
            </div>
          </div>
          <div className="steps">
            <article className="step">
              <span className="num">01</span>
              <h3>Identifique o sintoma</h3>
              <p>Consulte os guias ou descreva o comportamento do aparelho.</p>
            </article>
            <article className="step">
              <span className="num">02</span>
              <h3>Envie as informações</h3>
              <p>
                Marca, modelo, foto e vídeo ajudam a preparar o primeiro
                contato.
              </p>
            </article>
            <article className="step">
              <span className="num">03</span>
              <h3>Diagnóstico responsável</h3>
              <p>
                Os sintomas são avaliados e a necessidade de manutenção é
                explicada de forma clara.
              </p>
            </article>
            <article className="step">
              <span className="num">04</span>
              <h3>Combine a visita</h3>
              <p>
                A disponibilidade é confirmada e o atendimento é realizado no
                endereço informado.
              </p>
            </article>
          </div>
        </div>
      </section>
      <section
        className="section section-soft home-guides-section"
        data-featured-criterion="editorial-priority"
      >
        <div className="container">
          <div className="section-head">
            <div>
              <span className="kicker">Guias práticos</span>
              <h2>Entenda o problema antes de solicitar assistência</h2>
              <p>
                Conteúdo direto para reconhecer sinais comuns e saber quando
                buscar avaliação técnica.
              </p>
            </div>
            <a className="text-link" href="/curiosidades/">
              Ver todos os guias →
            </a>
          </div>
          <div className="cards">
            {featuredGuides.map((guide) => (
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
      <Faq items={faq} />
      <CtaPanel showRating />
    </>
  );
}
