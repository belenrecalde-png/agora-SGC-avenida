/**
 * Índice de búsqueda global. Combina las rutas fijas del menú (ALL_NAV_ITEMS) con
 * el contenido del Centro de Conocimiento (conceptos y FAQs) para que el buscador
 * ya encuentre resultados de Fase 2, tal como promete el README ("se suman a los
 * resultados a medida que existan, desde Fase 2 en adelante").
 */
import { Layers, HelpCircle, type LucideIcon } from "lucide-react";
import { ALL_NAV_ITEMS, type NavItem } from "@/lib/nav-config";
import { CONCEPTS } from "@/lib/concepts-data";
import { FAQ_ITEMS } from "@/lib/faq-data";

export type SearchItem = NavItem & { sectionLabel?: string };

const conceptItems: SearchItem[] = CONCEPTS.map((concept) => ({
  id: `concepto-${concept.id}`,
  label: concept.acronym ? `${concept.term} (${concept.acronym})` : concept.term,
  href: `/centro-de-conocimiento/conceptos/${concept.id}`,
  icon: Layers as LucideIcon,
  description: concept.simpleDefinition,
  sectionLabel: "Centro de Conocimiento · Conceptos",
}));

const faqItems: SearchItem[] = FAQ_ITEMS.map((faq) => ({
  id: `faq-${faq.id}`,
  label: faq.question,
  href: `/centro-de-conocimiento/faq#${faq.id}`,
  icon: HelpCircle as LucideIcon,
  description: faq.answer,
  sectionLabel: "Centro de Conocimiento · Preguntas frecuentes",
}));

export const SEARCH_INDEX: SearchItem[] = [...ALL_NAV_ITEMS, ...conceptItems, ...faqItems];
