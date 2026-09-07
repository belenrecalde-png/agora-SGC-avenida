#!/usr/bin/env node
/**
 * Genera app/<ruta>/page.tsx para cada item de lib/nav-data.json que todavía
 * no tiene una página implementada a mano. Fuente única de verdad: nav-data.json.
 *
 * Uso: node scripts/generate-placeholders.cjs
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const navData = JSON.parse(fs.readFileSync(path.join(ROOT, "lib", "nav-data.json"), "utf8"));

// Rutas que ya tienen una implementación real y no deben pisarse.
const IMPLEMENTED = new Set([
  "/",
  "/mi-sgc",
  "/reportar",
  "/centro-de-conocimiento/conceptos",
  "/centro-de-conocimiento/iso-9001",
  "/centro-de-conocimiento/calidad-en-2-minutos",
  "/centro-de-conocimiento/comparador",
  "/centro-de-conocimiento/faq",
  "/gestion-calidad/registro",
  "/configuracion/areas",
  "/configuracion/tipos",
  "/configuracion/plane",
  "/configuracion/logs",
  "/gestion-calidad/tickets-plane",
]);

function toAppDir(href) {
  // "/gestion-calidad/registro" -> app/gestion-calidad/registro
  return path.join(ROOT, "app", ...href.split("/").filter(Boolean));
}

function escapeForTemplate(value) {
  return value.replace(/`/g, "\\`");
}

function renderPage({ icon, title, description, phase, sectionLabel }) {
  return `import { ${icon} } from "lucide-react";
import { PlaceholderPage } from "@/components/layout/placeholder-page";

export const metadata = {
  title: \`${escapeForTemplate(title)} | Ágora\`,
};

export default function Page() {
  return (
    <PlaceholderPage
      icon={${icon}}
      title="${escapeForTemplate(title)}"
      description="${escapeForTemplate(description)}"
      phase="${escapeForTemplate(phase ?? "")}"
      sectionLabel="${escapeForTemplate(sectionLabel ?? "")}"
    />
  );
}
`;
}

let created = 0;
let skipped = 0;

for (const section of navData.sections) {
  for (const item of section.items) {
    if (IMPLEMENTED.has(item.href)) {
      skipped++;
      continue;
    }
    const dir = toAppDir(item.href);
    fs.mkdirSync(dir, { recursive: true });
    const filePath = path.join(dir, "page.tsx");
    const content = renderPage({
      icon: item.icon,
      title: item.label,
      description: item.description ?? "",
      phase: item.phase,
      sectionLabel: section.label,
    });
    fs.writeFileSync(filePath, content, "utf8");
    created++;
  }
}

console.log(`Placeholders generados: ${created}. Rutas ya implementadas (omitidas): ${skipped}.`);
