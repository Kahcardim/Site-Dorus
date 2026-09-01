import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createHash } from "node:crypto";

const digest = (body) => createHash("sha256").update(body).digest("hex");

async function filesIn(directory, prefix = "") {
  const result = [];
  for (const entry of await readdir(resolve(directory, prefix), { withFileTypes: true })) {
    const path = prefix + entry.name;
    if (entry.isDirectory()) result.push(...await filesIn(directory, path + "/"));
    else if (entry.isFile() && !path.endsWith(".map") && path !== "build-fingerprint.json") result.push(path);
  }
  return result.sort();
}

export async function buildManifest(directory) {
  const paths = await filesIn(directory);
  const names = new Map();
  for (const path of paths) {
    const file = path.split("/").at(-1);
    const match = file.match(/^(.+)-[a-zA-Z0-9_-]{8}\.(js|css)$/);
    if (path.startsWith("assets/") && match) names.set(file, match[1] + "." + match[2]);
  }
  const canonical = (path) => {
    const parts = path.split("/");
    parts[parts.length - 1] = names.get(parts.at(-1)) || parts.at(-1);
    return parts.join("/");
  };
  const entries = {};
  for (const path of paths) {
    let body = await readFile(resolve(directory, path));
    if (/\.(html|css|js)$/.test(path)) {
      let text = body.toString("utf8")
        .replace(/(<meta name="dorus-revision" content=")[^"]*(">)/g, "$1__REVISION__$2")
        .replace(/\/\/# sourceMappingURL=[^\r\n]*/g, "");
      for (const [original, stable] of names) text = text.replaceAll(original, stable);
      body = Buffer.from(text);
    }
    const key = canonical(path);
    if (Object.hasOwn(entries, key)) throw new Error("Colisão de arquivos no manifesto: " + key);
    entries[key] = digest(body);
  }
  const sorted = Object.fromEntries(Object.entries(entries).sort(([a], [b]) => a.localeCompare(b, "en")));
  return { algorithm: 1, sha256: digest(JSON.stringify(sorted)), files: sorted };
}
