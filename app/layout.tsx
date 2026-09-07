import type { Metadata } from "next";
import "@fontsource-variable/inter";
import { AppShell } from "@/components/layout/app-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ágora | Gestión de Calidad de Avenida+",
  description:
    "Un espacio común para aprender, aportar y hacer seguimiento del Sistema de Gestión de Calidad de Avenida+.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full bg-background text-foreground">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
