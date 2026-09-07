// Exercise the real frontend bridge protocol without writing to Google Calendar.
export async function run({ browser, check, failures }) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  page.on("pageerror", (error) => failures.push(`Agenda integrada: ${error.message}`));
  await context.route("**/*", (route) => {
    const url = new URL(route.request().url());
    if (url.hostname === "127.0.0.1") return route.continue();
    if (url.hostname === "script.google.com" && url.searchParams.get("action") === "bridge") {
      return route.fulfill({ contentType: "text/html", body: `<!doctype html><script>
        addEventListener('message', event => {
          const message = event.data;
          if (message.source !== 'dorus-site') return;
          const data = message.type === 'availability'
            ? { ok: true, periods: [{ value: 'manha', label: 'Manhã - 8h às 13h' }] }
            : { ok: true };
          parent.postMessage({ source: 'dorus-calendar-bridge', requestId: message.requestId, ok: true, data }, '*');
        });
        parent.postMessage({ source: 'dorus-calendar-bridge', type: 'ready' }, '*');
      </script>` });
    }
    return route.abort();
  });
  try {
    await page.goto("http://127.0.0.1:4174/agendamento/", { waitUntil: "networkidle" });
    await page.waitForFunction(() => {
      const form = document.querySelector('[data-schedule-form]');
      return form?.querySelector('[name="data"]').max &&
        form.querySelector('[name="periodo"]').dataset.calendarMode === 'slots';
    });
    await page.evaluate(() => { window.open = (url) => { window.__dorusOpened = url; }; });
    const form = page.locator('[data-schedule-form]');
    for (const [name, value] of Object.entries({ nome: "Teste QA", telefone: "11999999999", bairro: "Centro", endereco: "Rua de teste, 1", problema: "Não está gelando" })) {
      await form.locator(`[name="${name}"]`).fill(value);
    }
    await form.locator('[name="equipamento"]').selectOption({ label: "Geladeira" });
    const min = await form.locator('[name="data"]').getAttribute('min');
    const date = new Date(`${min}T12:00:00`);
    date.setDate(date.getDate() + (date.getDay() === 6 ? 2 : 1));
    await form.locator('[name="data"]').fill(date.toISOString().slice(0, 10));
    await page.waitForFunction(() => document.querySelector('[name="periodo"] option[value="manha"]'));
    await form.locator('[name="periodo"]').selectOption('manha');
    await form.locator('[name="ciencia_visita"]').check();
    await form.locator('[name="consentimento"]').check();
    await form.getByRole('button', { name: /WhatsApp/ }).click();
    await page.waitForFunction(() => Boolean(window.__dorusOpened));
    const url = new URL(await page.evaluate(() => window.__dorusOpened));
    const message = url.searchParams.get('text') || '';
    check(url.hostname === 'wa.me' && url.pathname === '/5511913573932', 'AGF-008: destino integrado incorreto');
    for (const term of ['deslocamento e diagnóstico', 'valor será informado antes da confirmação do agendamento', 'será abatido do serviço', 'valor pode variar conforme a localização', 'já foi registrada na agenda', 'Teste QA', 'Rua de teste, 1']) {
      check(message.includes(term), `AGF-008: mensagem integrada sem ${term}`);
    }
    check(await form.locator('[data-calendar-link]').isVisible(), 'AGF-008: link alternativo ausente quando popup é bloqueado');
  } finally {
    await context.close();
  }
}
