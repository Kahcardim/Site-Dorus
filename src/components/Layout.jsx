import { SITE } from "../data/site.js";
import { useConsent, useNativeAccessibility } from "../hooks/useSiteEffects.js";

const navigation = [
  ["/", "Início"],
  ["/sobre/", "Sobre"],
  ["/servicos/", "Serviços"],
  ["/curiosidades/", "Guias"],
  ["/agendamento/", "Agendamento"],
  ["/fale-conosco/", "Fale conosco"],
];

function NavLinks({ path }) {
  return navigation.map(([href, label]) => (
    <a key={href} href={href} aria-current={path === href ? "page" : undefined}>
      {label}
    </a>
  ));
}

function CookieBanner({ onChoice }) {
  return (
    <section
      className="cookie-banner"
      role="dialog"
      aria-label="Preferências de cookies"
      data-cookie-banner
    >
      <div className="cookie-copy">
        <strong>Privacidade e cookies</strong>
        <p>
          Usamos recursos necessários para o funcionamento do site e para
          lembrar suas preferências.
        </p>
        <a href="/privacidade/">Ver política de privacidade</a>
      </div>
      <div className="cookie-actions">
        <button
          type="button"
          className="cookie-essential"
          onClick={() => onChoice("essential")}
        >
          Somente necessários
        </button>
        <button
          type="button"
          className="cookie-accept"
          onClick={() => onChoice("all")}
        >
          Aceitar todos
        </button>
      </div>
    </section>
  );
}

export function Layout({
  path,
  breadcrumbs = [],
  children,
  compactFooter = false,
}) {
  useNativeAccessibility();
  const { consent, saveConsent, reopen } = useConsent();

  return (
    <>
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <div className="topbar">
        <div className="container">
          <span>Atendimento em {SITE.serviceArea}</span>
          <a href={SITE.phoneHref}>{SITE.phone}</a>
        </div>
      </div>
      <header className="header">
        <div className="container">
          <a className="brand" href="/">
            <img
              className="logo"
              src="/assets/dorus-logo-3d.webp"
              alt={SITE.name}
            />
          </a>
          <nav className="nav" aria-label="Menu principal">
            <NavLinks path={path} />
          </nav>
          <a
            className="whatsapp-mini"
            href={SITE.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
          >
            Pedir atendimento
          </a>
          <details className="mobile-nav">
            <summary>Menu</summary>
            <div>
              <NavLinks path={path} />
            </div>
          </details>
        </div>
      </header>
      <main id="conteudo">
        {breadcrumbs.length > 1 && (
          <nav
            className="container breadcrumbs"
            aria-label="Caminho de navegação"
          >
            <ol>
              {breadcrumbs.map((item, index) => (
                <li key={item.path}>
                  {index === breadcrumbs.length - 1 ? (
                    <span aria-current="page">{item.name}</span>
                  ) : (
                    <a href={item.path}>{item.name}</a>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
        {children}
      </main>
      <a
        className="whatsapp-float"
        href={SITE.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Falar com a D’orus pelo WhatsApp"
      >
        WhatsApp
      </a>
      <footer className="footer">
        {!compactFooter && (
          <div className="container footer-grid">
            <div>
              <img
                src="/assets/dorus-logo-3d.webp"
                alt={SITE.name}
                loading="lazy"
              />
              <p>
                Assistência técnica de linha branca com atendimento em
                domicílio.
              </p>
              <p>CNPJ 30.204.892/0001-03</p>
              <p>Garantia mínima de 90 dias nos serviços executados.</p>
            </div>
            <div className="footer-links">
              <h3>Institucional</h3>
              <a href="/sobre/">Sobre</a>
              <a href="/servicos/">Serviços</a>
              <a href="/curiosidades/">Guias</a>
              <a href="/privacidade/">Privacidade</a>
            </div>
            <div className="footer-links">
              <h3>Atendimento</h3>
              <a href="/agendamento/">Agendamento</a>
              <a href="/fale-conosco/">Fale conosco</a>
              <a href={SITE.phoneHref}>{SITE.phone}</a>
              <a
                href={SITE.instagram}
                target="_blank"
                rel="noopener noreferrer"
              >
                @assistenciadorus
              </a>
            </div>
          </div>
        )}
        <div className="container footer-bottom">
          <span>© {SITE.name}</span>
          <span>Empresa de área de serviço</span>
          <button
            type="button"
            className="cookie-settings-link"
            onClick={reopen}
          >
            Configurar cookies
          </button>
        </div>
      </footer>
      {!consent && <CookieBanner onChoice={saveConsent} />}
    </>
  );
}

export function InternalHero({ eyebrow, title, children, className = "" }) {
  return (
    <section className={`internal ${className}`.trim()}>
      <div className="container">
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        {children}
      </div>
    </section>
  );
}

export function CtaPanel({
  title = "Conte o problema e fale direto com a D’orus.",
  children,
}) {
  return (
    <section className="section section-soft final-cta">
      <div className="container cta-panel">
        <div>
          <span className="kicker">Precisa de assistência?</span>
          <h2>{title}</h2>
          <p>
            {children ||
              `Atendimento em ${SITE.serviceArea}, conforme disponibilidade.`}
          </p>
        </div>
        <div className="actions">
          <a
            className="button button-green"
            href={SITE.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
          >
            Abrir WhatsApp
          </a>
          <a className="button button-white" href="/agendamento/">
            Agendar visita
          </a>
        </div>
      </div>
    </section>
  );
}
