import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { buildManifest } from "./build-manifest.mjs";

const directory = resolve(process.argv[2] || "dist");
const manifest = await buildManifest(directory);
await writeFile(resolve(directory, "build-fingerprint.json"), JSON.stringify({ algorithm: manifest.algorithm, sha256: manifest.sha256 }) + "\n");
console.log("Build: " + manifest.sha256);
