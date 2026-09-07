import { Users2, ImageIcon } from "lucide-react";
import { GlobalSearch } from "@/components/layout/global-search";
import { LinkButton } from "@/components/ui/button";

const WORDS = ["Procesos", "Personas", "Conocimiento", "Resultados"];

export function Hero() {
  return (
    <div className="hero-gradient overflow-hidden rounded-3xl border border-border">
      <div className="grid grid-cols-1 gap-8 p-6 sm:p-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-10">
        <div className="flex flex-col gap-5">
          <span className="text-xs font-semibold uppercase tracking-widest text-avenida-violet">
            Juntos hacemos mejora
          </span>
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-avenida-black sm:text-4xl">
            Calidad que <em className="text-avenida-violet not-italic">conecta</em> personas,
            procesos y mejora
          </h1>
          <p className="max-w-lg text-base text-muted">
            Un espacio común para aprender, aportar y hacer seguimiento del Sistema de Gestión de
            Calidad de Avenida+.
          </p>

          <GlobalSearch />

          <div>
            <LinkButton href="/reportar" size="md" className="h-11 px-5">
              + Reportar una situación
            </LinkButton>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-avenida-violet/30 bg-white/60 text-center">
            <ImageIcon className="h-8 w-8 text-avenida-violet/50" />
            <p className="max-w-[220px] text-xs text-muted">
              Espacio para una foto del equipo Avenida+
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {WORDS.map((word) => (
              <span
                key={word}
                className="rounded-full border border-avenida-violet/20 bg-white/70 px-3 py-1 text-xs font-medium text-avenida-black"
              >
                {word}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-avenida-violet/20 bg-white/70 p-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-avenida-violet-light text-avenida-violet">
              <Users2 className="h-4 w-4" />
            </span>
            <p className="text-sm font-medium text-avenida-black">
              Un equipo, un mismo propósito.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
