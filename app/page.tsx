import Image from "next/image";
import {
  Target,
  Flag,
  ClipboardList,
  FileStack,
  Layers,
  AlertOctagon,
  Map,
  BookOpen,
  FolderOpen,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import { Hero } from "@/components/home/hero";
import { QuickAccessCard, type QuickAccessTone } from "@/components/home/quick-access-card";
import { StatCard } from "@/components/home/stat-card";
import { AttentionTable } from "@/components/home/attention-table";
import { ActivityFeed } from "@/components/home/activity-feed";
import { PendingChecklist } from "@/components/home/pending-checklist";
import { LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ESTADO_GENERAL } from "@/lib/mock-dashboard";

const QUICK_ACCESS: {
  href: string;
  label: string;
  description: string;
  icon: typeof Flag;
  tone: QuickAccessTone;
}[] = [
  {
    href: "/reportar",
    label: "Reportar una situación",
    description: "Contanos qué pasó, sin necesidad de conocer siglas de ISO.",
    icon: Flag,
    tone: "violet",
  },
  {
    href: "/centro-de-conocimiento/faq",
    label: "¿Qué tengo que cargar?",
    description: "Guía rápida para saber qué información sumar a tu reporte.",
    icon: HelpCircle,
    tone: "blue",
  },
  {
    href: "/mi-sgc",
    label: "Mis reportes",
    description: "Seguí el estado de todo lo que reportaste.",
    icon: ClipboardList,
    tone: "green",
  },
  {
    href: "/centro-de-conocimiento/conceptos",
    label: "Conceptos de Calidad",
    description: "Entendé qué significa cada término, en simple.",
    icon: Layers,
    tone: "violet",
  },
  {
    href: "/planificacion/riesgos-y-oportunidades",
    label: "Riesgos y oportunidades",
    description: "Situaciones que podrían afectarnos, antes de que ocurran.",
    icon: AlertOctagon,
    tone: "amber",
  },
  {
    href: "/procesos/mapa",
    label: "Nuestros procesos",
    description: "Cómo se organiza el trabajo en Avenida+.",
    icon: Map,
    tone: "blue",
  },
  {
    href: "/documentacion/instructivos",
    label: "Instructivos",
    description: "Paso a paso para tareas frecuentes del SGC.",
    icon: BookOpen,
    tone: "violet",
  },
  {
    href: "/documentacion/documentos",
    label: "Documentación SGC",
    description: "Políticas, procedimientos y formularios vigentes.",
    icon: FolderOpen,
    tone: "blue",
  },
  {
    href: "/centro-de-conocimiento/calidad-en-2-minutos",
    label: "Calidad en 2 minutos",
    description: "Cápsulas breves para entender un concepto en el momento.",
    icon: Sparkles,
    tone: "green",
  },
  {
    href: "/centro-de-conocimiento/faq",
    label: "Preguntas frecuentes",
    description: "Respuestas directas a las dudas más comunes.",
    icon: FileStack,
    tone: "amber",
  },
];

export default function Home() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-10 pb-12">
      <Hero />

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-avenida-black">Accesos rápidos</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK_ACCESS.map((item) => (
            <QuickAccessCard key={item.label} {...item} />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-avenida-black">Estado general del SGC</h2>
          <Badge tone="gray">Datos de ejemplo — Fase 11/14</Badge>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {ESTADO_GENERAL.map((stat) => (
            <StatCard key={stat.label} data={stat} />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <Badge tone="gray" className="w-fit">
          Vista previa con datos de ejemplo — se conecta a registros reales en fases posteriores
        </Badge>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <AttentionTable />
          </div>
          <ActivityFeed />
          <PendingChecklist />
        </div>
      </section>

      <section>
        <Card className="flex flex-col items-start gap-4 bg-avenida-black p-8 text-white sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white">
              <Target className="h-5 w-5" />
            </span>
            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-semibold">
                La mejora no es un destino, es una forma de trabajar.
              </h3>
              <p className="max-w-xl text-sm text-white/70">
                Ágora es el espacio del SGC de Avenida+ — donde cualquiera puede entender,
                aprender y participar de la mejora continua, sin necesidad de ser experto en ISO
                9001.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <LinkButton
              href="/centro-de-conocimiento/iso-9001"
              variant="secondary"
              className="whitespace-nowrap bg-white text-avenida-black hover:bg-white/90"
            >
              Ver mapa de ISO 9001
            </LinkButton>
            <Image
              src="/brand/avenida-logo.png"
              alt="Avenida+"
              width={100}
              height={26}
              className="hidden h-5 w-auto brightness-0 invert sm:block"
            />
          </div>
        </Card>
      </section>
    </div>
  );
}
