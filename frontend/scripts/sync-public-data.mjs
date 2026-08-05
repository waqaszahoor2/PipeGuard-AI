import { copyFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const currentDirectory = dirname(currentFile);
const root = resolve(currentDirectory, "..");

const pipelineSource = resolve(root, "data/pipelines.json");
const pipelineDestination = resolve(root, "public/data/pipelines.json");

const modelSource = resolve(root, "data/model/evaluation-v1.2.json");
const modelDestination = resolve(root, "public/model/evaluation-v1.2.json");

await mkdir(dirname(pipelineDestination), { recursive: true });
await copyFile(pipelineSource, pipelineDestination);

await mkdir(dirname(modelDestination), { recursive: true });
await copyFile(modelSource, modelDestination);

console.log("✅ Pipeline dataset and model evaluation artifact synchronized to public/");
