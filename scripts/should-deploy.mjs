import { readFile, appendFile } from "node:fs/promises";

const next = JSON.parse(await readFile("dist/build-fingerprint.json", "utf8"));
let changed = true;

try {
  const cacheBuster = Date.now();
  const [homeResponse, fingerprintResponse] = await Promise.all([
    fetch(`https://assistenciadorus.com.br/?health=${cacheBuster}`, {
      signal: AbortSignal.timeout(15000),
      headers: { "cache-control": "no-cache" },
    }),
    fetch(`https://assistenciadorus.com.br/build-fingerprint.json?check=${cacheBuster}`, {
      signal: AbortSignal.timeout(15000),
      headers: { "cache-control": "no-cache" },
    }),
  ]);

  if (!homeResponse.ok) {
    console.log(`Home publicada indisponível (${homeResponse.status}); forçando novo deploy.`);
  } else if (!fingerprintResponse.ok) {
    console.log(`Manifesto publicado indisponível (${fingerprintResponse.status}); forçando novo deploy.`);
  } else {
    const published = await fingerprintResponse.json();
    changed = published.algorithm !== next.algorithm || published.sha256 !== next.sha256;
  }
} catch (error) {
  console.log(`Falha ao validar produção; forçando novo deploy: ${error?.message || error}`);
}

if (process.env.GITHUB_OUTPUT) {
  await appendFile(process.env.GITHUB_OUTPUT, `changed=${changed}\n`);
}

console.log(changed
  ? "Publicação necessária: build alterado ou produção indisponível."
  : "Build idêntico e produção saudável: deploy desnecessário.");
