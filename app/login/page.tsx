import Image from "next/image";
import { ShieldCheck, Sparkles, TrendingUp, Users2 } from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import { isGoogleConfigured } from "@/lib/auth/google";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Iniciar sesión | Ágora",
};

const ERROR_MESSAGES: Record<string, string> = {
  config: "El login con Google todavía no está configurado en este entorno.",
  state: "La sesión de login expiró o no es válida — probá de nuevo.",
  inactive: "Tu cuenta está desactivada en Ágora. Pedile a un administrador que la reactive.",
};

function errorMessage(code: string | undefined): string | null {
  if (!code) return null;
  return ERROR_MESSAGES[code] ?? code;
}

const BADGES: { icon: typeof ShieldCheck; label: string; className: string }[] = [
  { icon: ShieldCheck, label: "Calidad", className: "left-[8%] top-[12%] rotate-[-6deg]" },
  { icon: Users2, label: "Personas", className: "right-[10%] top-[28%] rotate-[4deg]" },
  { icon: TrendingUp, label: "Mejora", className: "left-[14%] bottom-[22%] rotate-[3deg]" },
  { icon: Sparkles, label: "Conocimiento", className: "right-[14%] bottom-[10%] rotate-[-4deg]" },
];

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  const configured = isGoogleConfigured();
  const loginHref = `/api/auth/login${next ? `?next=${encodeURIComponent(next)}` : ""}`;
  const message = errorMessage(error);

  return (
    <div className="hero-gradient flex min-h-screen items-center justify-center p-4 sm:p-8">
      <div className="grid w-full max-w-4xl grid-cols-1 overflow-hidden rounded-3xl border border-border bg-white shadow-xl shadow-avenida-violet/10 lg:grid-cols-2">
        {/* Columna izquierda: login */}
        <div className="flex flex-col justify-center gap-6 p-8 sm:p-12">
          <Image
            src="/brand/agora-logo-full.png"
            alt="Ágora — Gestión · Conocimiento · Mejora"
            width={220}
            height={90}
            priority
            className="h-auto w-44"
          />

          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold text-avenida-black">¡Qué bueno verte!</h1>
            <p className="text-sm text-muted">
              Ágora es el espacio donde cualquiera en Avenida+ puede entender, aportar y hacer
              seguimiento de la calidad de nuestro trabajo. Iniciá sesión con tu cuenta de Google
              de la empresa para entrar.
            </p>
          </div>

          {message && (
            <p className="w-full rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {message}
            </p>
          )}

          {configured ? (
            <LinkButton href={loginHref} size="md" className="w-full justify-center gap-2">
              <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.43.34-2.09V7.07H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a11 11 0 0 0-9.82 6.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
                />
              </svg>
              Continuar con Google
            </LinkButton>
          ) : (
            <p className="w-full rounded-xl border border-dashed border-avenida-violet/30 bg-avenida-violet-light/40 px-3 py-2 text-xs text-avenida-black">
              Faltan configurar <code>GOOGLE_CLIENT_ID</code>, <code>GOOGLE_CLIENT_SECRET</code> y{" "}
              <code>APP_URL</code> — ver <code>.env.example</code>.
            </p>
          )}

          <p className="text-xs text-muted">
            Portal interno de Avenida+ — el acceso queda restringido a cuentas de la empresa.
          </p>
        </div>

        {/* Columna derecha: panel ilustrado, oculto en mobile */}
        <div className="relative hidden overflow-hidden bg-gradient-to-br from-avenida-blue to-avenida-violet p-10 lg:flex lg:flex-col lg:justify-between">
          <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 -right-10 h-64 w-64 rounded-full bg-white/10 blur-2xl" />

          <div className="relative flex-1">
            {BADGES.map(({ icon: Icon, label, className }) => (
              <div key={label} className={`absolute flex flex-col items-center gap-2 ${className}`}>
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur-sm">
                  <Icon className="h-6 w-6" />
                </span>
                <span className="text-xs font-medium text-white/80">{label}</span>
              </div>
            ))}
          </div>

          <div className="relative flex flex-col gap-2 text-white">
            <p className="text-lg font-semibold leading-snug">
              La calidad no pertenece solo al área de Calidad.
            </p>
            <p className="text-sm text-white/75">
              Es la forma en que Avenida+ trabaja, mide, aprende y mejora — entre todos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
