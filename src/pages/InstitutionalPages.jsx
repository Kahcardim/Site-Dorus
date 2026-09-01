import { useMemo, useState } from "react";
import { equipmentOptions, SITE } from "../data/site.js";
import { CtaPanel, InternalHero } from "../components/Layout.jsx";

export function AboutPage() {
  return (
    <>
      <InternalHero
        eyebrow="Sobre a D’orus"
        title="Experiência técnica com atendimento próximo e responsável."
      >
        <p>
          A D’orus atende eletrodomésticos de linha branca em domicílio, com
          comunicação direta e diagnóstico explicado de forma clara.
        </p>
      </InternalHero>
      <section className="section">
        <div className="container content-grid">
          <div>
            <span className="kicker">Nossa história</span>
            <h2>Mais de 10 anos cuidando dos equipamentos das famílias.</h2>
          </div>
          <div className="prose">
            <p>
              O trabalho combina conhecimento técnico, atenção aos sintomas
              relatados e orientação honesta sobre o serviço necessário.
            </p>
            <p>
              Atendemos {SITE.serviceArea}, conforme disponibilidade e categoria
              do equipamento.
            </p>
          </div>
        </div>
      </section>
      <section className="section section-soft">
        <div className="container values about-values">
          <article className="card">
            <h3>Clareza</h3>
            <p>Explicação direta sobre diagnóstico e serviço.</p>
          </article>
          <article className="card">
            <h3>Responsabilidade</h3>
            <p>Cuidados com o equipamento e o ambiente do cliente.</p>
          </article>
          <article className="card">
            <h3>Proximidade</h3>
            <p>Contato direto antes e depois do atendimento.</p>
          </article>
          <article className="card">
            <h3>Garantia</h3>
            <p>Garantia mínima de 90 dias conforme a ordem de serviço.</p>
          </article>
        </div>
      </section>
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
        eyebrow="Fale conosco"
        title="Conte o que está acontecendo com seu aparelho."
      >
        <p>
          Quanto mais detalhes você enviar, melhor conseguimos preparar o
          primeiro atendimento.
        </p>
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
        </div>
      </section>
    </>
  );
}

export function SchedulePage() {
  const [status, setStatus] = useState("");
  const minDate = useMemo(() => new Date().toISOString().slice(0, 10), []);
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
        eyebrow="Agendamento"
        title="Solicite o melhor horário para sua visita."
      >
        <p>
          Informe o aparelho, o problema e o endereço. A disponibilidade é
          confirmada pelo WhatsApp.
        </p>
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
            <div className="form-grid">
              <label>
                Nome completo
                <input name="nome" autoComplete="name" required />
              </label>
              <label>
                Seu WhatsApp
                <input name="telefone" type="tel" autoComplete="tel" required />
              </label>
              <label>
                Bairro
                <input name="bairro" required />
              </label>
              <label>
                Endereço da visita
                <input name="endereco" autoComplete="street-address" required />
              </label>
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
            <label>
              Descreva o problema
              <textarea name="problema" required />
            </label>
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
              A visita só fica confirmada depois da resposta da D’orus.
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

export function PrivacyPage() {
  return (
    <>
      <InternalHero
        eyebrow="Privacidade"
        title="Seus dados são usados somente para atender sua solicitação."
      >
        <p>
          Esta política explica quais informações são tratadas durante a
          navegação e o contato com a D’orus.
        </p>
      </InternalHero>
      <section className="section">
        <div className="container prose">
          <h2>Dados fornecidos por você</h2>
          <p>
            Nome, telefone, endereço, equipamento e descrição do problema são
            enviados ao WhatsApp somente quando você decide continuar o
            atendimento.
          </p>
          <h2>Cookies e métricas</h2>
          <p>
            Cookies necessários guardam preferências. Métricas opcionais só são
            ativadas conforme seu consentimento.
          </p>
          <h2>Agenda</h2>
          <p>
            Dados de agendamento são utilizados para consultar disponibilidade e
            preparar o atendimento solicitado.
          </p>
          <h2>Contato</h2>
          <p>
            Para esclarecer dúvidas, fale diretamente com a D’orus pelo
            WhatsApp.
          </p>
        </div>
      </section>
    </>
  );
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
