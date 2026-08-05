import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const currentDirectory = dirname(currentFile);
const root = resolve(currentDirectory, "..");

const dataPath = resolve(root, "data/pipelines.json");

try {
  const content = await readFile(dataPath, "utf-8");
  const records = JSON.parse(content);

  if (!Array.isArray(records)) {
    throw new Error("Pipeline dataset must be a JSON array");
  }

  const receivedCount = records.length;
  let acceptedCount = 0;
  let rejectedCount = 0;
  let normalCount = 0;
  let warningCount = 0;
  let criticalCount = 0;

  const seenIds = new Set();

  for (const record of records) {
    if (!record.id || seenIds.has(record.id)) {
      rejectedCount++;
      continue;
    }
    seenIds.add(record.id);

    const risk = (record.risk_level || record.riskLevel || "").toLowerCase();
    if (risk === "low") {
      normalCount++;
      acceptedCount++;
    } else if (risk === "medium" || risk === "high") {
      warningCount++;
      acceptedCount++;
    } else if (risk === "critical") {
      criticalCount++;
      acceptedCount++;
    } else {
      acceptedCount++;
    }
  }

  console.log(`Pipeline rows received: ${receivedCount}`);
  console.log(`Pipeline rows accepted: ${acceptedCount}`);
  console.log(`Pipeline rows rejected: ${rejectedCount}`);
  console.log(`Normal: ${normalCount}`);
  console.log(`Warning: ${warningCount}`);
  console.log(`Critical: ${criticalCount}`);

  if (acceptedCount === 0 || receivedCount !== 50) {
    console.error("❌ Pipeline data validation failed: Record count mismatch or zero accepted rows.");
    process.exit(1);
  }

  console.log("✅ Pipeline data validation PASSED successfully!");
} catch (err) {
  console.error("❌ Validation script error:", err.message);
  process.exit(1);
}
