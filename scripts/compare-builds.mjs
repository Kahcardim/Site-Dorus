import assert from "node:assert/strict";
import { resolve } from "node:path";
import { buildManifest } from "./build-manifest.mjs";

assert(process.argv[2] && process.argv[3], "Informe os dois diretórios de build.");
const [before, after] = await Promise.all(process.argv.slice(2, 4).map((path) => buildManifest(resolve(path))));
const paths = new Set([...Object.keys(before.files), ...Object.keys(after.files)]);
const differences = [...paths].filter((path) => before.files[path] !== after.files[path]);
assert.deepEqual(differences, [], "A refatoração alterou arquivos entregues ao visitante.");
console.log("OK: " + paths.size + " arquivos equivalentes; conteúdo, estilos, scripts e mídias preservados. Ignorados apenas revisão de deploy, nomes com hash e mapas de código.");
