import institutionalContent from "../data/institutional-content.json";
import { ContentSections } from "../components/ContentSections.jsx";
import { useEffect, useState } from "react";
import { equipmentOptions, SITE } from "../data/site.js";
import { CtaPanel, InternalHero } from "../components/Layout.jsx";

function InstitutionalContent({ name, eyebrow }) {
  const content = institutionalContent[name];
  return (
    <>
      <InternalHero
        eyebrow={eyebrow}
        title={content.title}
        warranty={name !== "privacidade"}
      >
        <p>{content.intro}</p>
      </InternalHero>
      <ContentSections sections={content.sections} />
    </>
  );
}
export function AboutPage() {
  return (
    <>
      <InstitutionalContent name="sobre" eyebrow="Nossa história" />
      <CtaPanel />
    </>
  );
}

export function ContactPage() {
  const submit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const message = [
      `Olá, vim pelo site da D’orus.`,
      "",
      `Nome: ${data.get("nome")}`,
      `Equipamento: ${data.get("equipamento")}`,
      `Marca/modelo: ${data.get("modelo") || "Não informado"}`,
      `Problema: ${data.get("problema")}`,
    ].join("\n");
    window.open(
      `${SITE.whatsapp}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };
  return (
    <>
      <InternalHero
        className="contact-hero"
        eyebrow="Fale conosco"
        title="Conte o que está acontecendo com seu aparelho."
      >
        <p>
          Quanto mais detalhes você enviar, melhor conseguimos preparar o
          primeiro atendimento.
        </p>
        <p className="journey-lead">
          Converse primeiro com a equipe, sem precisar escolher uma data.
        </p>
        <div className="actions">
          <a
            className="button button-green"
            href={SITE.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
          >
            Tirar dúvidas pelo WhatsApp
          </a>
          <a className="button button-white" href={SITE.phoneHref}>
            Ligar para a D’orus
          </a>
        </div>
        <JourneySwitch current="contact" />
      </InternalHero>
      <section className="section">
        <div className="container contact-grid">
          <div className="contact-list">
            <a
              className="contact-item"
              href={SITE.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
            >
              <small>Celular e WhatsApp</small>
              <strong>{SITE.phone}</strong>
            </a>
            <div className="contact-item">
              <small>Área de atendimento</small>
              <strong>{SITE.serviceArea}</strong>
              <p>Atendimento em domicílio, conforme disponibilidade.</p>
            </div>
            <a
              className="contact-item"
              href={SITE.instagram}
              target="_blank"
              rel="noopener noreferrer"
            >
              <small>Instagram</small>
              <strong>@assistenciadorus</strong>
            </a>
          </div>
          <details className="contact-message">
            <summary>
              Prefere preparar uma mensagem com os dados do aparelho?
            </summary>
            <form
              className="form"
              onSubmit={submit}
              aria-labelledby="contact-title"
            >
              <div>
                <span className="kicker">Solicitar atendimento</span>
                <h2 id="contact-title">Prepare sua mensagem</h2>
                <p>Ao enviar, você continuará no WhatsApp.</p>
              </div>
              <label htmlFor="nome">Seu nome</label>
              <input id="nome" name="nome" autoComplete="name" required />
              <label htmlFor="equipamento">Equipamento</label>
              <select id="equipamento" name="equipamento">
                {equipmentOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
              <label htmlFor="modelo">Marca ou modelo</label>
              <input id="modelo" name="modelo" />
              <label htmlFor="problema">Descreva o problema</label>
              <textarea id="problema" name="problema" required />
              <button className="button button-green" type="submit">
                Continuar no WhatsApp →
              </button>
            </form>
          </details>
        </div>
      </section>
    </>
  );
}

export function SchedulePage() {
  const [status, setStatus] = useState("");
  const [minDate, setMinDate] = useState("");
  useEffect(() => {
    const today = new Date();
    setMinDate(
      `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`,
    );
  }, []);
  const submit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const displayDate = String(data.get("data")).split("-").reverse().join("/");
    const message = [
      "Olá, vim pelo site da D’orus e gostaria de solicitar uma visita técnica.",
      "",
      `*Nome:* ${data.get("nome")}`,
      `*Meu WhatsApp:* ${data.get("telefone")}`,
      `*Bairro:* ${data.get("bairro")}`,
      `*Endereço:* ${data.get("endereco")}`,
      `*Equipamento:* ${data.get("equipamento")}`,
      `*Marca/modelo:* ${data.get("marca") || "Não informado"}`,
      `*Problema:* ${data.get("problema")}`,
      `*Data preferida:* ${displayDate}`,
      `*Período solicitado:* ${data.get("periodo")}`,
      "",
      "A data e o horário serão confirmados pela equipe.",
    ].join("\n");
    setStatus(
      "Solicitação preparada. Continue pelo WhatsApp para confirmar a disponibilidade.",
    );
    window.open(
      `${SITE.whatsapp}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };
  return (
    <>
      <InternalHero
        className="schedule-hero"
        eyebrow="Agendamento"
        title="Solicite o melhor horário para sua visita."
      >
        <p>
          Informe o aparelho, o problema e o endereço onde o atendimento deverá
          ser realizado. A disponibilidade é confirmada pelo WhatsApp.
        </p>
        <JourneySwitch current="schedule" />
      </InternalHero>
      <section className="section">
        <div className="container schedule-layout">
          <form
            className="form schedule-form"
            onSubmit={submit}
            data-schedule-form
          >
            <div className="form-heading">
              <span className="kicker">Solicitar horário</span>
              <h2>Conte o que aconteceu</h2>
            </div>
            <fieldset className="schedule-fields">
              <legend>1. Data e período da visita</legend>
              <div className="form-grid">
                <label>
                  Data preferida
                  <input name="data" type="date" min={minDate} required />
                </label>
                <label>
                  Período
                  <select name="periodo" required>
                    <option value="">Selecione</option>
                    <option>Manhã — 8h às 12h</option>
                    <option>Tarde — 13h às 17h</option>
                    <option>Horário comercial — 8h às 17h</option>
                  </select>
                </label>
              </div>
            </fieldset>
            <fieldset className="schedule-fields">
              <legend>2. Contato e endereço</legend>
              <div className="form-grid">
                <label>
                  Nome completo
                  <input name="nome" autoComplete="name" required />
                </label>
                <label>
                  Seu WhatsApp
                  <input
                    name="telefone"
                    type="tel"
                    autoComplete="tel"
                    required
                  />
                </label>
                <label>
                  Bairro
                  <input name="bairro" required />
                </label>
                <label>
                  Endereço da visita
                  <input
                    name="endereco"
                    autoComplete="street-address"
                    required
                  />
                </label>
              </div>
            </fieldset>
            <fieldset className="schedule-fields">
              <legend>3. Aparelho e problema</legend>
              <div className="form-grid">
                <label>
                  Equipamento
                  <select name="equipamento" required>
                    <option value="">Selecione</option>
                    {equipmentOptions.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Marca e modelo
                  <input name="marca" />
                </label>
              </div>
              <label>
                Descreva o problema
                <textarea name="problema" required />
              </label>
            </fieldset>
            <label className="consent">
              <input name="consentimento" type="checkbox" required />
              <span>
                Autorizo o envio desses dados para atendimento pelo WhatsApp.
              </span>
            </label>
            <button className="button button-green" type="submit">
              Enviar solicitação pelo WhatsApp
            </button>
            <p
              className="form-status"
              data-schedule-status
              role="status"
              aria-live="polite"
              hidden={!status}
            >
              {status}
            </p>
            <a
              className="button button-white calendar-link"
              data-calendar-link
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              hidden
            >
              Continuar no WhatsApp
            </a>
            <p className="schedule-disclaimer">
              A data escolhida é uma preferência. A visita só fica confirmada
              depois da resposta da D’orus.
            </p>
          </form>
          <aside className="schedule-sidebar">
            <div className="schedule-box">
              <span className="kicker">Como funciona</span>
              <h2>Agendamento simples</h2>
              <div className="schedule-steps">
                <div>
                  <strong>1</strong>
                  <span>Escolha a data e o período.</span>
                </div>
                <div>
                  <strong>2</strong>
                  <span>Envie a solicitação pelo WhatsApp.</span>
                </div>
                <div>
                  <strong>3</strong>
                  <span>A D’orus confirma a disponibilidade.</span>
                </div>
              </div>
            </div>
            <div className="schedule-box">
              <span className="kicker">Área de atendimento</span>
              <h2>Atendimento no endereço da visita</h2>
              <p>{SITE.serviceArea}, conforme disponibilidade.</p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

function JourneySwitch({ current }) {
  return (
    <nav className="journey-switch" aria-label="Escolha o tipo de atendimento">
      {[
        {
          key: "contact",
          href: "/fale-conosco/",
          title: "Falar com a equipe",
          description: "Tirar dúvidas, sem escolher uma data",
        },
        {
          key: "schedule",
          href: "/agendamento/",
          title: "Solicitar uma visita",
          description: "Informar endereço, data e período",
        },
      ].map((item) =>
        current === item.key ? (
          <span key={item.key} aria-current="page">
            {item.title}
            <small>{item.description}</small>
          </span>
        ) : (
          <a key={item.key} href={item.href}>
            {item.title}
            <small>{item.description}</small>
          </a>
        ),
      )}
    </nav>
  );
}

export function PrivacyPage() {
  return <InstitutionalContent name="privacidade" eyebrow="Privacidade" />;
}

export function NotFoundPage() {
  return (
    <section className="section">
      <div className="container cta-panel">
        <div>
          <span className="kicker">Erro 404</span>
          <h1>Página não encontrada</h1>
          <p>O endereço pode ter mudado ou não existe.</p>
        </div>
        <a className="button button-blue" href="/">
          Voltar para o início
        </a>
      </div>
    </section>
  );
}
