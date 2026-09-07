
export async function run({ browser, page, root, routePaths, accessibilityPaths, check, failures, accessibility, loadLazyImages }) {
  await page.goto("http://127.0.0.1:4174/fale-conosco/", {
    waitUntil: "networkidle",
  });
  check(
    (await page.locator(".contact-message").getAttribute("open")) === null,
    "Contato: formulário deve ser opcional e recolhido inicialmente",
  );
  check(
    await page.locator('.contact-hero a[href^="tel:"]').isVisible(),
    "Contato: ligação direta ausente",
  );
  await page.locator(".contact-message > summary").click();
  await page.evaluate(() => {
    window.open = (url) => {
      window.__dorusOpened = url;
    };
  });
  await page.locator("#nome").fill("Teste QA");
  await page.locator("#problema").fill("Teste de regressão");
  await page.getByRole("button", { name: /Continuar no WhatsApp/ }).click();
  check(
    (await page.evaluate(() => window.__dorusOpened || "")).includes(
      "wa.me/5511913573932",
    ),
    "Contato: não abriu WhatsApp",
  );

  await page.goto("http://127.0.0.1:4174/agendamento/", {
    waitUntil: "domcontentloaded",
  });
  await page.evaluate(() => {
    window.open = (url) => {
      window.__dorusOpened = url;
    };
  });
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const form = page.locator("[data-schedule-form]");
  await page.waitForFunction(() => {
    const input = document.querySelector('[data-schedule-form] [name="data"]');
    return Boolean(input?.min && input?.max);
  });
  const periodLabels = await form
    .locator('[name="periodo"] option')
    .allTextContents();
  for (const expected of [
    "Manhã — 8h às 13h",
    "Tarde — 13h às 18h",
    "Dia inteiro — 8h às 18h",
  ])
    check(
      periodLabels.includes(expected),
      `Agenda: período divergente: ${expected}`,
    );
  const dateLimits = await form.locator('[name="data"]').evaluate((input) => ({
    min: input.min,
    max: input.max,
  }));
  const limitDays = Math.round(
    (new Date(`${dateLimits.max}T12:00:00`).getTime() -
      new Date(`${dateLimits.min}T12:00:00`).getTime()) /
      86400000,
  );
  check(
    limitDays === 60,
    `Agenda: limite esperado D+60, recebido D+${limitDays}`,
  );
  await form.locator('[name="nome"]').fill("Teste QA");
  await form.locator('[name="telefone"]').fill("11999999999");
  await form.locator('[name="bairro"]').fill("Centro");
  await form.locator('[name="endereco"]').fill("Rua de teste, 1");
  await form
    .locator('[name="equipamento"]')
    .selectOption({ label: "Geladeira" });
  await form.locator('[name="data"]').fill(tomorrow);
  await form.locator('[name="periodo"]').selectOption({ index: 1 });
  await form.locator('[name="problema"]').fill("Não está gelando");
  const visitConsent = form.locator('[name="ciencia_visita"]');
  const privacyConsent = form.locator('[name="consentimento"]');
  const submitSchedule = form.getByRole("button", { name: /WhatsApp/ });
  check(
    await visitConsent.evaluate((input) => input.required && !input.checked),
    "Agenda: ciência da visita deve ser obrigatória e desmarcada inicialmente",
  );
  await privacyConsent.check();
  await submitSchedule.click();
  check(
    (await visitConsent.evaluate((input) => input.validity.valueMissing)) &&
      !(await page.evaluate(() => window.__dorusOpened)),
    "Agenda: não deve abrir WhatsApp sem ciência das condições da visita",
  );
  await visitConsent.check();
  await privacyConsent.uncheck();
  await submitSchedule.click();
  check(
    (await privacyConsent.evaluate((input) => input.validity.valueMissing)) &&
      !(await page.evaluate(() => window.__dorusOpened)),
    "Agenda: ciência da visita não substitui o consentimento de privacidade",
  );
  await privacyConsent.check();
  await submitSchedule.click();
  const scheduleUrl = await page.evaluate(() => window.__dorusOpened || "");
  check(
    scheduleUrl.includes("wa.me/5511913573932"),
    "Agenda: fallback do WhatsApp falhou",
  );
  const scheduleMessage = scheduleUrl
    ? new URL(scheduleUrl).searchParams.get("text") || ""
    : "";
  for (const condition of [
    "Estou ciente",
    "deslocamento e diagnóstico",
    "valor será informado antes da confirmação do agendamento",
    "será abatido do serviço",
    "valor pode variar conforme a localização",
  ]) {
    check(
      scheduleMessage.includes(condition),
      `Agenda: mensagem sem condição da visita: ${condition}`,
    );
  }

}
