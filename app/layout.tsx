import type { Metadata } from "next";
import "@fontsource-variable/inter";
import { AppShell } from "@/components/layout/app-shell";
import type { HeaderUser } from "@/components/layout/header";
import { getCurrentUser } from "@/lib/auth/dal";
import { ROLE_LABELS, isRole } from "@/lib/auth/roles";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ágora | Gestión de Calidad de Avenida+",
  description:
    "Un espacio común para aprender, aportar y hacer seguimiento del Sistema de Gestión de Calidad de Avenida+.",
};

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const initials = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "");
  return initials.join("") || "?";
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Sin redirect acá a propósito: este layout también envuelve /login, y
  // `getCurrentUser()` (a diferencia de `requireUser()`) nunca redirige —
  // el chequeo real de "hace falta estar logueado" lo hace `proxy.ts` antes
  // de llegar acá. Esto es solo para mostrar el usuario real en el header.
  //
  // Se arma acá un DTO liviano (HeaderUser) en vez de pasarle el `PortalUser`
  // completo de la base al componente cliente — mismo criterio de "Data
  // Transfer Objects" de la guía de autenticación de Next 16.
  const currentUser = await getCurrentUser();
  const user: HeaderUser | null = currentUser
    ? {
        name: currentUser.name,
        email: currentUser.email,
        initials: initialsOf(currentUser.name),
        roleLabel: isRole(currentUser.role) ? ROLE_LABELS[currentUser.role] : currentUser.role,
      }
    : null;

  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full bg-background text-foreground">
        <AppShell user={user}>{children}</AppShell>
      </body>
    </html>
  );
}
