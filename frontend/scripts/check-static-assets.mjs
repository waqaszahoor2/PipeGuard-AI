import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, "..");
const pipelinesPath = path.join(rootDir, "public", "data", "pipelines.json");
const modelPath = path.join(rootDir, "public", "model", "evaluation-v1.2.json");

console.log("🔍 Running automated pre-build static asset checks...");

if (!fs.existsSync(pipelinesPath)) {
  console.error(`❌ ERROR: Missing required dataset artifact at ${pipelinesPath}`);
  process.exit(1);
}

if (!fs.existsSync(modelPath)) {
  console.error(`❌ ERROR: Missing required model evaluation artifact at ${modelPath}`);
  process.exit(1);
}

try {
  const pipelinesRaw = fs.readFileSync(pipelinesPath, "utf-8");
  const pipelines = JSON.parse(pipelinesRaw);
  if (!Array.isArray(pipelines)) {
    console.error("❌ ERROR: public/data/pipelines.json is not a valid JSON array");
    process.exit(1);
  }
  if (pipelines.length !== 50) {
    console.error(`❌ ERROR: public/data/pipelines.json contains ${pipelines.length} records, expected exactly 50`);
    process.exit(1);
  }
  console.log(`✅ Verified public/data/pipelines.json contains exactly 50 records.`);
} catch (err) {
  console.error("❌ ERROR: Failed to parse public/data/pipelines.json:", err);
  process.exit(1);
}

try {
  const modelRaw = fs.readFileSync(modelPath, "utf-8");
  const model = JSON.parse(modelRaw);
  if (!model.modelVersion || !model.metrics) {
    console.error("❌ ERROR: public/model/evaluation-v1.2.json missing required version or metrics fields");
    process.exit(1);
  }
  console.log(`✅ Verified public/model/evaluation-v1.2.json valid evaluation artifact.`);
} catch (err) {
  console.error("❌ ERROR: Failed to parse public/model/evaluation-v1.2.json:", err);
  process.exit(1);
}

console.log("🎉 All automated pre-build asset checks PASSED successfully!");
