import Image from "next/image";
import { LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
    <div className="hero-gradient flex min-h-screen items-center justify-center px-4">
      <Card className="flex w-full max-w-sm flex-col items-center gap-6 p-8 text-center">
        <Image
          src="/brand/agora-logo-full.png"
          alt="Ágora — Gestión · Conocimiento · Mejora"
          width={220}
          height={90}
          priority
          className="h-auto w-48"
        />

        <p className="text-sm text-muted">
          Portal de Gestión de Calidad de Avenida+. Iniciá sesión con tu cuenta de Google de la
          empresa.
        </p>

        {message && (
          <p className="w-full rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {message}
          </p>
        )}

        {configured ? (
          <LinkButton href={loginHref} size="md" className="w-full justify-center">
            Continuar con Google
          </LinkButton>
        ) : (
          <p className="w-full rounded-xl border border-dashed border-avenida-violet/30 bg-avenida-violet-light/40 px-3 py-2 text-xs text-avenida-black">
            Faltan configurar <code>GOOGLE_CLIENT_ID</code>, <code>GOOGLE_CLIENT_SECRET</code> y{" "}
            <code>APP_URL</code> — ver <code>.env.example</code>.
          </p>
        )}
      </Card>
    </div>
  );
}
