"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Sidebar, MobileSidebar } from "./sidebar";
import { Header, type HeaderUser } from "./header";
import type { Crumb } from "./breadcrumbs";
import { findNavItemByHref, findSectionByHref } from "@/lib/nav-config";
import { getConceptById } from "@/lib/concepts-data";
import type { NotificationItem } from "@/lib/notifications-data";

function buildCrumbs(pathname: string): Crumb[] {
  if (pathname === "/") return [];

  const conceptMatch = pathname.match(/^\/centro-de-conocimiento\/conceptos\/([^/]+)$/);
  if (conceptMatch) {
    const concept = getConceptById(conceptMatch[1]);
    return [
      { label: "Inicio", href: "/" },
      { label: "Centro de Conocimiento" },
      { label: "Conceptos", href: "/centro-de-conocimiento/conceptos" },
      { label: concept?.term ?? "Detalle" },
    ];
  }

  const navItem = findNavItemByHref(pathname);
  const section = findSectionByHref(pathname);

  const crumbs: Crumb[] = [{ label: "Inicio", href: "/" }];
  if (section) {
    crumbs.push({ label: section.label });
  }
  crumbs.push({ label: navItem?.label ?? "Detalle" });
  return crumbs;
}

export function AppShell({
  children,
  user,
  notifications,
}: {
  children: ReactNode;
  user: HeaderUser | null;
  notifications: NotificationItem[];
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // /login tiene su propia pantalla completa, sin sidebar/header — no tiene
  // sentido mostrar el shell del portal antes de que la persona se loguee.
  if (pathname === "/login") {
    return <>{children}</>;
  }

  const crumbs = buildCrumbs(pathname);

  return (
    <div className="flex min-h-screen">
      <Sidebar role={user?.role} />
      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} role={user?.role} />

      <div className="flex min-h-screen flex-1 flex-col">
        <Header crumbs={crumbs} onOpenMobileMenu={() => setMobileOpen(true)} user={user} notifications={notifications} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
