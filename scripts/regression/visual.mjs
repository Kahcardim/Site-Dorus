import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

export async function run({ browser, page, root, routePaths, accessibilityPaths, check, failures, accessibility, loadLazyImages }) {
  const screenshots = resolve(root, "..", "test-results");
  await mkdir(screenshots, { recursive: true });
  await writeFile(
    resolve(screenshots, "accessibility.json"),
    JSON.stringify(accessibility, null, 2),
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("http://127.0.0.1:4174/", { waitUntil: "networkidle" });
  await loadLazyImages(page);
  await page.screenshot({
    path: resolve(screenshots, "home-mobile.png"),
    fullPage: true,
  });
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  const desktop = await desktopContext.newPage();
  await desktop.goto("http://127.0.0.1:4174/", { waitUntil: "networkidle" });
  const desktopConsent = desktop.getByRole("button", {
    name: "Somente necessários",
  });
  if (await desktopConsent.isVisible()) await desktopConsent.click();
  await loadLazyImages(desktop);
  await desktop.screenshot({
    path: resolve(screenshots, "home-desktop.png"),
    fullPage: true,
  });
  for (const width of [390, 1440, 1920]) {
    await desktop.setViewportSize({ width, height: 1000 });
    await desktop.goto("http://127.0.0.1:4174/", { waitUntil: "networkidle" });
    const hero = await desktop.locator(".hero").evaluate((element) => {
      const title = element.querySelector("h1");
      const copy = element.querySelector(".hero-copy").getBoundingClientRect();
      const heading = title.getBoundingClientRect();
      const caption = element
        .querySelector("figcaption")
        .getBoundingClientRect();
      const media = element
        .querySelector(".hero-media")
        .getBoundingClientRect();
      return {
        centered:
          getComputedStyle(title).textAlign === "center" &&
          Math.abs(
            heading.left + heading.width / 2 - copy.left - copy.width / 2,
          ) < 2,
        captionInside:
          caption.left >= media.left &&
          caption.right <= media.right &&
          caption.top >= media.top &&
          caption.bottom <= media.bottom,
      };
    });
    check(hero.centered, `Home (${width}px): texto não centralizado`);
    check(
      hero.captionInside,
      `Home (${width}px): identificação multimarcas fora da foto`,
    );
    await desktop
      .locator(".hero")
      .screenshot({ path: resolve(screenshots, `hero-${width}.png`) });
  }
  for (const width of [390, 1440]) {
    await desktop.setViewportSize({ width, height: 1000 });
    for (const [name, path] of Object.entries({
      sobre: "/sobre/",
      servicos: "/servicos/",
      guias: "/curiosidades/",
      geladeira: "/servicos/geladeiras/",
      guia: "/curiosidades/geladeira-nao-gela/",
      contato: "/fale-conosco/",
      agendamento: "/agendamento/",
    })) {
      await desktop.goto(`http://127.0.0.1:4174${path}`, {
        waitUntil: "networkidle",
      });
      await loadLazyImages(desktop);
      const brokenImages = await desktop
        .locator(".service-card-media img")
        .evaluateAll(
          (images) =>
            images.filter(
              (image) => !image.complete || image.naturalWidth === 0,
            ).length,
        );
      check(brokenImages === 0, `${path} (${width}px): imagem não carregou`);
      await desktop.screenshot({
        path: resolve(screenshots, `${name}-${width}.png`),
        fullPage: true,
      });
      if (name === "servicos") {
        await desktop
          .locator(".service-card")
          .first()
          .screenshot({ path: resolve(screenshots, `produto-${width}.png`) });
        await desktop
          .locator(".brands-section")
          .screenshot({ path: resolve(screenshots, `carrossel-${width}.png`) });
      }
    }
  }
  await desktop.close();
  await desktopContext.close();

  return screenshots;
}
