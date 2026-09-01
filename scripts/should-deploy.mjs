import { readFile, appendFile } from "node:fs/promises";

const next = JSON.parse(await readFile("dist/build-fingerprint.json", "utf8"));
let changed = true;
try {
  const response = await fetch("https://assistenciadorus.com.br/build-fingerprint.json?check=" + Date.now(), {
    signal: AbortSignal.timeout(15000), headers: { "cache-control": "no-cache" },
  });
  if (response.ok) {
    const published = await response.json();
    changed = published.algorithm !== next.algorithm || published.sha256 !== next.sha256;
  }
} catch {
  console.log("Manifesto publicado indisponível; a publicação seguirá com validação posterior.");
}
if (process.env.GITHUB_OUTPUT) await appendFile(process.env.GITHUB_OUTPUT, "changed=" + changed + "\n");
console.log(changed ? "Build possui alterações: publicar." : "Build idêntico ao publicado: deploy desnecessário.");
