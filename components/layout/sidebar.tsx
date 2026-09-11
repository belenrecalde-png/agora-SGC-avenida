"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, type ComponentType } from "react";
import { ChevronDown, X } from "lucide-react";
import { NAV_TOP, NAV_SECTIONS } from "@/lib/nav-config";
import { AgoraMark } from "@/components/brand/agora-mark";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({
  href,
  label,
  icon: Icon,
  active,
  highlight,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  active: boolean;
  highlight?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-2.5 px-3 py-2 text-sm font-medium transition-colors",
        highlight
          ? "rounded-full bg-avenida-violet text-white shadow-sm shadow-avenida-violet/20 hover:bg-avenida-violet/90"
          : active
            ? "rounded-full bg-avenida-violet text-white shadow-sm shadow-avenida-violet/20"
            : "rounded-lg text-avenida-black/70 hover:bg-sidebar-hover hover:text-avenida-black",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{label}</span>
    </Link>
  );
}

// Pantallas de gestión con datos reales por área — un Colaborador no las
// navega (ve solo "Mi SGC" y puede reportar), ver `lib/auth/access.ts`
// (`canBrowseGestion`). Las páginas "glosario" del mismo menú (No
// Conformidades, Contexto, etc.) siguen visibles — son solo informativas.
const RESTRICTED_FOR_COLABORADOR = new Set([
  "registro-sgc",
  "tickets-plane",
  "riesgos-y-oportunidades",
  "objetivos-de-calidad",
  "indicadores",
]);

function visibleItems(items: (typeof NAV_SECTIONS)[number]["items"], role?: string) {
  if (role !== "colaborador") return items;
  return items.filter((item) => !RESTRICTED_FOR_COLABORADOR.has(item.id));
}

// Configuración es solo para Administrador SGC y Calidad (ver
// `app/configuracion/layout.tsx`, que aplica el mismo corte del lado del
// servidor) — para el resto de los roles ni siquiera tiene sentido mostrar
// el menú, ya que cualquier pantalla de ahí adentro los redirige a "/".
function visibleSections(sections: typeof NAV_SECTIONS, role?: string) {
  if (role === "admin" || role === "calidad") return sections;
  return sections.filter((section) => section.id !== "configuracion");
}

function SectionGroup({
  section,
  pathname,
  onNavigate,
  role,
}: {
  section: (typeof NAV_SECTIONS)[number];
  pathname: string;
  onNavigate?: () => void;
  role?: string;
}) {
  const items = visibleItems(section.items, role);
  const containsActive = items.some((item) => isActive(pathname, item.href));
  const [open, setOpen] = useState(containsActive);
  const Icon = section.icon;

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          containsActive
            ? "text-avenida-black"
            : "text-avenida-black/50 hover:text-avenida-black",
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span className="flex-1 truncate text-left">{section.label}</span>
        <ChevronDown
          className={cn("h-3.5 w-3.5 shrink-0 transition-transform", open ? "rotate-180" : "")}
        />
      </button>
      {open && (
        <div className="mt-0.5 ml-3.5 flex flex-col gap-0.5 border-l border-sidebar-border pl-3">
          {items.map((item) => (
            <NavLink
              key={item.id}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={isActive(pathname, item.href)}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function SidebarContent({
  onNavigate,
  onClose,
  role,
}: {
  onNavigate?: () => void;
  onClose?: () => void;
  role?: string;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-72 flex-col border-r border-sidebar-border bg-sidebar-bg">
      <div className="flex items-center justify-between gap-2 px-5 py-5">
        <Link href="/" className="flex items-center gap-2.5" onClick={onNavigate}>
          <AgoraMark className="h-8 w-8 shrink-0" />
          <span className="flex flex-col leading-tight">
            <span className="text-base font-semibold text-avenida-black">Ágora</span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted">
              Gestión · Conocimiento · Mejora
            </span>
          </span>
        </Link>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted hover:bg-sidebar-hover hover:text-avenida-black"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-6">
        <div className="flex flex-col gap-0.5 pb-4">
          {NAV_TOP.map((item) => (
            <NavLink
              key={item.id}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={isActive(pathname, item.href)}
              highlight={item.highlight}
              onNavigate={onNavigate}
            />
          ))}
        </div>

        <div className="flex flex-col gap-1 border-t border-sidebar-border pt-4">
          {visibleSections(NAV_SECTIONS, role).map((section) => (
            <SectionGroup
              key={section.id}
              section={section}
              pathname={pathname}
              onNavigate={onNavigate}
              role={role}
            />
          ))}
        </div>
      </nav>

      <div className="flex flex-col gap-2 border-t border-sidebar-border px-5 py-4">
        <Image
          src="/brand/avenida-logo.png"
          alt="Avenida+"
          width={140}
          height={40}
          className="h-4 w-auto self-start"
        />
        <p className="text-xs leading-snug text-muted">
          Personas que hacen mejores procesos, hoy y siempre.
        </p>
      </div>
    </div>
  );
}

export function Sidebar({ role }: { role?: string } = {}) {
  return (
    <aside className="sticky top-0 hidden h-screen lg:block">
      <SidebarContent role={role} />
    </aside>
  );
}

export function MobileSidebar({
  open,
  onClose,
  role,
}: {
  open: boolean;
  onClose: () => void;
  role?: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex lg:hidden">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative flex">
        <SidebarContent onNavigate={onClose} onClose={onClose} role={role} />
      </div>
    </div>
  );
}
