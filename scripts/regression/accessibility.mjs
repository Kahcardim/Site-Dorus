import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

export async function run({ browser, page, root, routePaths, accessibilityPaths, check, failures, accessibility, loadLazyImages }) {
  const axeSource = await readFile(
    resolve(root, "..", "node_modules", "axe-core", "axe.min.js"),
    "utf8",
  );
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of accessibilityPaths) {
      await page.goto(`http://127.0.0.1:4174${path}`, {
        waitUntil: "networkidle",
      });
      if (path === "/fale-conosco/")
        await page.locator(".contact-message > summary").click();
      const visualErrors = await page.evaluate(() => {
        const errors = [];
        for (const image of document.querySelectorAll(
          ".service-card-media img",
        )) {
          const box = image.getBoundingClientRect();
          const frame = image.parentElement.getBoundingClientRect();
          if (
            Math.abs(box.width - frame.width) > 2 ||
            Math.abs(box.height - frame.height) > 2
          )
            errors.push(
              `imagem não preenche moldura: ${image.getAttribute("src")} (${box.width}×${box.height} / ${frame.width}×${frame.height})`,
            );
          if (Math.abs(frame.width - frame.height) > 2)
            errors.push("moldura distorce proporção quadrada");
        }
        if (location.pathname !== "/links/") {
          for (const heading of document.querySelectorAll(
            ".internal h1, .section-head",
          )) {
            if (getComputedStyle(heading).textAlign !== "center")
              errors.push("cabeçalho descentralizado");
          }
        }
        for (const panel of document.querySelectorAll(".professional-cta")) {
          if (
            !panel.querySelector(".cta-trust")?.textContent.includes("90 dias")
          )
            errors.push("CTA sem garantia");
          if (
            getComputedStyle(panel.querySelector(".cta-copy")).textAlign !==
            "center"
          )
            errors.push("CTA descentralizado");
          const box = panel.getBoundingClientRect();
          if (Math.abs(box.left + box.width / 2 - innerWidth / 2) > 2)
            errors.push("painel CTA fora do centro");
        }
        if (
          location.pathname !== "/links/" &&
          !document
            .querySelector(".footer-credit")
            ?.textContent.includes("Kauan Cardim")
        )
          errors.push("rodapé sem autor");
        return errors;
      });
      check(
        visualErrors.length === 0,
        `${path} (${width}px): ${visualErrors.join(", ")}`,
      );
      await page.addScriptTag({ content: axeSource });
      const result = await page.evaluate(() =>
        axe.run(document, {
          runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
        }),
      );
      const severe = result.violations;
      const clippedImages = await page
        .locator(".service-card-media img")
        .evaluateAll(
          (images) =>
            images.filter((image) => {
              const imageBox = image.getBoundingClientRect();
              const frame = image.parentElement.getBoundingClientRect();
              return (
                imageBox.top < frame.top - 1 ||
                imageBox.bottom > frame.bottom + 1 ||
                imageBox.left < frame.left - 1 ||
                imageBox.right > frame.right + 1
              );
            }).length,
        );
      check(
        clippedImages === 0,
        `${path} (${width}px): imagem de serviço fora da moldura`,
      );
      accessibility.push({ path, width, violations: severe });
      check(
        severe.length === 0,
        `${path} (${width}px): axe ${severe.map((item) => item.id).join(", ")}`,
      );
      check(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
        `${path} (${width}px): overflow`,
      );
    }
  }

}
