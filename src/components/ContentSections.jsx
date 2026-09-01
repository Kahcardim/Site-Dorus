export function ContentSections({ sections }) {
  return sections.map((section, index) => (
    <section
      className={`section${index % 2 ? " section-soft" : ""}`}
      key={index}
    >
      <div className="container">
        <div className="section-head">
          <div>
            {section.kicker && <span className="kicker">{section.kicker}</span>}
            <h2>
              {section.heading ||
                (section.cards.length
                  ? "Informações e cuidados"
                  : "Leia também")}
            </h2>
          </div>
        </div>
        {section.paragraphs.length > 0 && (
          <div className="prose">
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        )}
        {section.cards.length > 0 && (
          <div className="cards">
            {section.cards.map((card) => (
              <article className="card" key={card.title}>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </article>
            ))}
          </div>
        )}
        {section.links.length > 0 && (
          <div
            className={
              section.links.some((link) => link.card) ? "cards" : "actions"
            }
          >
            {section.links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={
                  link.card
                    ? "card"
                    : `button ${link.href.startsWith("https://wa.me/") ? "button-green" : "button-blue"}`
                }
                target={link.href.startsWith("https:") ? "_blank" : undefined}
                rel={
                  link.href.startsWith("https:")
                    ? "noopener noreferrer"
                    : undefined
                }
              >
                {link.card ? (
                  <>
                    <h3>{link.title}</h3>
                    <p>{link.description}</p>
                  </>
                ) : (
                  link.title
                )}
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  ));
}

export function Faq({ items, title = "Antes de solicitar atendimento" }) {
  return (
    <section className="section section-soft">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="kicker">Dúvidas frequentes</span>
            <h2>{title}</h2>
          </div>
        </div>
        <div className="faq">
          {items.map((item) => (
            <details key={item.question}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
