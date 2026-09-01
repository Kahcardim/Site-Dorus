import { brands, guides, reviews, services, SITE } from "../data/site.js";
import { useGoogleRating } from "../hooks/useSiteEffects.js";
import { CtaPanel } from "../components/Layout.jsx";
import { Faq } from "../components/ContentSections.jsx";
import faq from "../data/faq.json";

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
            <h3>{service.name}</h3>
            <p>{service.issues.slice(0, 3).join(", ")}.</p>
            <span>Ver assistência →</span>
          </div>
        </a>
      ))}
    </div>
  );
}

export function BrandCarousel() {
  return (
    <section
      className="section section-soft brands-section"
      aria-labelledby="brands-title"
    >
      <div className="container">
        <div className="section-head">
          <div>
            <span className="kicker">Marcas atendidas</span>
            <h2 id="brands-title">
              Experiência com as principais marcas de linha branca
            </h2>
            <p>
              O atendimento depende do equipamento, modelo e disponibilidade de
              serviço.
            </p>
          </div>
        </div>
        <ul className="brand-list" role="list">
          {brands.map(([name, file]) => (
            <li
              className={`brand-logo${file ? "" : " is-text-only"}`}
              key={name}
            >
              {file && (
                <img
                  src={`/assets/brands/${file}.webp`}
                  alt={name}
                  loading="lazy"
                />
              )}
              <span className="brand-fallback">{name}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Reviews() {
  const { rating, reviews: count } = useGoogleRating();
  return (
    <section className="section reviews-section">
      <div className="container">
        <div className="section-head compact-head">
          <div>
            <span className="kicker">Avaliações do Google</span>
            <h2>Experiências de clientes da D’orus</h2>
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
        <div className="review-carousel" tabIndex="0">
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
              <div className="stars" aria-label="5 estrelas">
                ★★★★★
              </div>
              <p>“{text}”</p>
            </article>
          ))}
        </div>
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
            <h1>
              Seu eletrodoméstico apresentou problema? Fale com quem entende.
            </h1>
            <p>
              Há mais de 10 anos, a D’orus atende linha branca com diagnóstico
              técnico, comunicação clara e atendimento em domicílio em{" "}
              {SITE.serviceArea}.
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
              <span>Mais de 10 anos de experiência</span>
              <span>Garantia mínima de 90 dias</span>
            </div>
          </div>
          <figure className="hero-media">
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
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="kicker">Serviços</span>
              <h2>Assistência para os principais equipamentos da sua casa</h2>
              <p>
                Escolha o aparelho para conhecer problemas comuns e preparar o
                atendimento.
              </p>
            </div>
            <a className="text-link" href="/servicos/">
              Ver todos os serviços →
            </a>
          </div>
          <ServiceCards />
        </div>
      </section>
      <BrandCarousel />
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="kicker">Atendimento local</span>
              <h2>Uma assistência preparada para ir até você</h2>
            </div>
          </div>
          <div className="trust-grid">
            <article className="trust-card">
              <div className="icon">01</div>
              <h3>Atendimento em domicílio</h3>
              <p>O endereço é informado apenas no agendamento da visita.</p>
            </article>
            <article className="trust-card">
              <div className="icon">02</div>
              <h3>Diagnóstico responsável</h3>
              <p>
                Os sintomas são avaliados e a necessidade de manutenção é
                explicada com clareza.
              </p>
            </article>
            <article className="trust-card">
              <div className="icon">03</div>
              <h3>Contato direto</h3>
              <p>
                WhatsApp e agendamento simples reduzem o tempo até o
                atendimento.
              </p>
            </article>
          </div>
        </div>
      </section>
      <section className="section section-soft">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="kicker">Guias práticos</span>
              <h2>Entenda o problema antes de solicitar assistência</h2>
            </div>
            <a className="text-link" href="/curiosidades/">
              Ver todos os guias →
            </a>
          </div>
          <div className="cards">
            {guides.slice(0, 3).map((guide) => (
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
      <section className="section section-blue">
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
              <p>Marca, modelo, foto e vídeo ajudam a preparar o contato.</p>
            </article>
            <article className="step">
              <span className="num">03</span>
              <h3>Combine a visita</h3>
              <p>A disponibilidade é confirmada pelo WhatsApp.</p>
            </article>
          </div>
        </div>
      </section>
      <Faq items={faq} />
      <Reviews />
      <CtaPanel />
    </>
  );
}
