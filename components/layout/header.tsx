"use client";

import { Bell, ChevronDown, Menu } from "lucide-react";
import { GlobalSearch } from "./global-search";
import { LinkButton } from "@/components/ui/button";
import { CURRENT_USER, MOCK_UNREAD_NOTIFICATIONS } from "@/lib/mock-user";
import type { Crumb } from "./breadcrumbs";
import { Breadcrumbs } from "./breadcrumbs";

export function Header({
  crumbs,
  onOpenMobileMenu,
}: {
  crumbs?: Crumb[];
  onOpenMobileMenu?: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 flex flex-col gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="rounded-lg border border-border bg-white p-2 text-avenida-black lg:hidden"
          aria-label="Abrir menú"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex min-w-0 flex-1 justify-center lg:px-8">
          <GlobalSearch />
        </div>

        <button
          type="button"
          className="relative hidden rounded-lg border border-border bg-white p-2.5 text-avenida-black hover:bg-avenida-violet-light/60 sm:flex"
          aria-label={
            MOCK_UNREAD_NOTIFICATIONS > 0
              ? `Notificaciones (${MOCK_UNREAD_NOTIFICATIONS} sin leer)`
              : "Notificaciones"
          }
        >
          <Bell className="h-4 w-4" />
          {MOCK_UNREAD_NOTIFICATIONS > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-none text-white">
              {MOCK_UNREAD_NOTIFICATIONS}
            </span>
          )}
        </button>

        <LinkButton href="/reportar" className="shrink-0 whitespace-nowrap px-3 sm:px-4">
          <span className="sm:hidden">+ Reportar</span>
          <span className="hidden sm:inline">+ Reportar una situación</span>
        </LinkButton>

        <button
          type="button"
          className="hidden shrink-0 items-center gap-2 rounded-lg px-1.5 py-1 hover:bg-avenida-violet-light/60 sm:flex"
          title="Tu cuenta"
        >
          <span className="avatar-gradient flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white">
            {CURRENT_USER.initials}
          </span>
          <span className="hidden flex-col items-start leading-tight md:flex">
            <span className="text-sm font-semibold text-avenida-black">{CURRENT_USER.name}</span>
            <span className="text-xs text-muted">
              {CURRENT_USER.role} · {CURRENT_USER.org}
            </span>
          </span>
          <ChevronDown className="hidden h-4 w-4 text-muted md:block" />
        </button>
      </div>

      {crumbs && crumbs.length > 0 && <Breadcrumbs items={crumbs} />}
    </header>
  );
}
