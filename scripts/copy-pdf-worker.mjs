// Copies the PDF.js worker next to the app's static files so the in-portal
// document viewer can load it from /pdf.worker.min.mjs. Runs on npm install.
import { copyFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(root, "node_modules", "pdfjs-dist", "build", "pdf.worker.min.mjs");

if (existsSync(source)) {
  copyFileSync(source, join(root, "public", "pdf.worker.min.mjs"));
}
