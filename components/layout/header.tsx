"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, ChevronDown, LogOut, Menu } from "lucide-react";
import { GlobalSearch } from "./global-search";
import { LinkButton } from "@/components/ui/button";
import { logoutAction } from "@/lib/actions/auth";
import { markNotificationsSeenAction } from "@/lib/actions/notifications";
import type { NotificationItem } from "@/lib/notifications-data";
import type { Crumb } from "./breadcrumbs";
import { Breadcrumbs } from "./breadcrumbs";

/** DTO liviano para el header — armado en `app/layout.tsx` (Server Component) a partir del usuario real de la sesión. */
export type HeaderUser = {
  name: string;
  email: string;
  initials: string;
  roleLabel: string;
  role: string;
};

export function Header({
  crumbs,
  onOpenMobileMenu,
  user,
  notifications,
}: {
  crumbs?: Crumb[];
  onOpenMobileMenu?: () => void;
  user: HeaderUser | null;
  notifications: NotificationItem[];
}) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  async function handleToggleNotifications() {
    const willOpen = !notifOpen;
    setNotifOpen(willOpen);
    if (willOpen && unreadCount > 0) {
      await markNotificationsSeenAction();
      router.refresh();
    }
  }

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

        <div className="relative hidden shrink-0 sm:block">
          <button
            type="button"
            onClick={handleToggleNotifications}
            className="relative rounded-lg border border-border bg-white p-2.5 text-avenida-black hover:bg-avenida-violet-light/60"
            aria-label={unreadCount > 0 ? `Notificaciones (${unreadCount} sin leer)` : "Notificaciones"}
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-none text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <>
              <button
                type="button"
                aria-label="Cerrar notificaciones"
                className="fixed inset-0 z-40 cursor-default"
                onClick={() => setNotifOpen(false)}
              />
              <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-border bg-white p-1 shadow-lg">
                <div className="px-3 py-2">
                  <p className="text-sm font-semibold text-avenida-black">Notificaciones</p>
                </div>
                <div className="my-1 border-t border-border" />
                {notifications.length === 0 ? (
                  <p className="px-3 py-4 text-center text-sm text-muted">
                    No tenés notificaciones — van a aparecer acá cuando haya novedades en algo que reportaste o
                    gestionás.
                  </p>
                ) : (
                  <div className="flex max-h-96 flex-col gap-0.5 overflow-y-auto">
                    {notifications.map((notif) => (
                      <Link
                        key={notif.id}
                        href={notif.href}
                        onClick={() => setNotifOpen(false)}
                        className="flex items-start gap-2 rounded-lg px-3 py-2 text-left hover:bg-avenida-violet-light/60"
                      >
                        {!notif.read && (
                          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-avenida-violet" aria-hidden />
                        )}
                        <span className={notif.read ? "ml-4 flex-1" : "flex-1"}>
                          <span className="block text-sm text-avenida-black">{notif.text}</span>
                          <span className="text-xs text-muted">{notif.time}</span>
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <LinkButton href="/reportar" className="shrink-0 whitespace-nowrap px-3 sm:px-4">
          <span className="sm:hidden">+ Reportar</span>
          <span className="hidden sm:inline">+ Reportar una situación</span>
        </LinkButton>

        {user && (
          <div className="relative hidden shrink-0 sm:block">
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="flex items-center gap-2 rounded-lg px-1.5 py-1 hover:bg-avenida-violet-light/60"
              title="Tu cuenta"
            >
              <span className="avatar-gradient flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white">
                {user.initials}
              </span>
              <span className="hidden flex-col items-start leading-tight md:flex">
                <span className="text-sm font-semibold text-avenida-black">{user.name}</span>
                <span className="text-xs text-muted">{user.roleLabel}</span>
              </span>
              <ChevronDown className="hidden h-4 w-4 text-muted md:block" />
            </button>

            {menuOpen && (
              <>
                <button
                  type="button"
                  aria-label="Cerrar menú"
                  className="fixed inset-0 z-40 cursor-default"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-border bg-white p-1 shadow-lg">
                  <div className="px-3 py-2">
                    <p className="text-sm font-semibold text-avenida-black">{user.name}</p>
                    <p className="text-xs text-muted">{user.email}</p>
                  </div>
                  <div className="my-1 border-t border-border" />
                  <form action={logoutAction}>
                    <button
                      type="submit"
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-avenida-black hover:bg-avenida-violet-light/60"
                    >
                      <LogOut className="h-4 w-4" />
                      Cerrar sesión
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {crumbs && crumbs.length > 0 && <Breadcrumbs items={crumbs} />}
    </header>
  );
}
