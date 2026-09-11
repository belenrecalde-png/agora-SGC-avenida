"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

export const ROOT_CAUSE_CATEGORIES = [
  "Proceso no definido o incompleto",
  "Incumplimiento del procedimiento",
  "Falta de capacitación / competencia",
  "Error humano operativo",
  "Falla de comunicación",
  "Falla del sistema / herramienta",
  "Datos incorrectos o incompletos",
  "Falla de proveedor externo",
  "Falta de control / seguimiento",
  "Planificación insuficiente",
  "Cambio no gestionado",
  "Requisito externo no identificado",
  "Otro",
] as const;

function parseSelected(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

/**
 * Selector múltiple de causa raíz — reemplaza el input de texto libre a
 * pedido del usuario, que quería poder marcar más de una causa por NC desde
 * una lista fija de categorías. Se manda como un único input oculto con las
 * causas separadas por coma, así el Server Action (`guardarAnalisisAction`)
 * no necesita cambiar: sigue leyendo `rootCause` como un string normal.
 */
export function RootCauseSelect({ name, defaultValue }: { name: string; defaultValue: string | null }) {
  const [selected, setSelected] = useState<string[]>(() => parseSelected(defaultValue));
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function toggle(cause: string) {
    setSelected((prev) => (prev.includes(cause) ? prev.filter((c) => c !== cause) : [...prev, cause]));
  }

  return (
    <div ref={containerRef} className="relative flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted">
        Causa raíz <span className="normal-case text-muted/80">(podés seleccionar más de una)</span>
      </span>
      <input type="hidden" name={name} value={selected.join(", ")} />

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-xl border border-border bg-white px-3 py-2 text-left text-sm text-avenida-black focus:border-avenida-violet focus:outline-none focus:ring-2 focus:ring-avenida-violet/20"
      >
        {selected.length === 0 ? (
          <span className="text-muted">+ Agregar causa...</span>
        ) : (
          <>
            {selected.map((cause) => (
              <span
                key={cause}
                className="inline-flex items-center gap-1 rounded-full bg-avenida-violet-light px-2 py-0.5 text-xs font-medium text-avenida-violet"
              >
                {cause}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggle(cause);
                  }}
                />
              </span>
            ))}
            <span className="text-xs text-muted">+ Agregar</span>
          </>
        )}
        <ChevronDown className={cn("ml-auto h-4 w-4 shrink-0 text-muted transition-transform", open ? "rotate-180" : "")} />
      </button>

      {open && (
        <div className="absolute top-full z-10 mt-1 w-full overflow-hidden rounded-xl border border-border bg-white shadow-lg">
          <ul className="max-h-64 overflow-y-auto py-1">
            {ROOT_CAUSE_CATEGORIES.map((cause) => {
              const isSelected = selected.includes(cause);
              return (
                <li key={cause}>
                  <button
                    type="button"
                    onClick={() => toggle(cause)}
                    className={cn(
                      "flex w-full items-center gap-2 px-3 py-2 text-left text-sm",
                      isSelected ? "bg-avenida-violet-light/60 text-avenida-violet" : "text-avenida-black hover:bg-avenida-violet-light/20",
                    )}
                  >
                    <input type="checkbox" checked={isSelected} readOnly className="h-3.5 w-3.5 accent-avenida-violet" />
                    {cause}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
