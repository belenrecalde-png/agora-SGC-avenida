import { Tag } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { listRecordTypes } from "@/lib/db/queries";
import { createRecordTypeAction, toggleRecordTypeAction } from "@/lib/actions/admin";

export const dynamic = "force-dynamic";

export const metadata = {
  title: `Tipos | Ágora`,
};

const COLOR_OPTIONS: BadgeTone[] = ["violet", "blue", "green", "amber", "red", "gray"];

export default function TiposPage() {
  const types = listRecordTypes();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 pb-12">
      <div className="flex items-start gap-4">
        <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-avenida-violet-light text-avenida-violet">
          <Tag className="h-6 w-6" />
        </span>
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Configuración</p>
          <h1 className="text-2xl font-semibold text-avenida-black">Tipos de registro</h1>
        </div>
      </div>

      <p className="text-sm text-avenida-black">
        Los tipos de registro del SGC (NC, AC, AP, OM, Q, S, R) y los que se agreguen — sin
        necesidad de tocar código. Cada uno define el prefijo del código automático (ej. NC-2026-001).
      </p>

      <Card className="flex flex-col divide-y divide-border p-0">
        {types.map((type) => (
          <div key={type.id} className="flex items-center justify-between gap-3 p-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Badge tone={type.color as BadgeTone}>{type.code}</Badge>
                <span className="text-sm font-medium text-avenida-black">{type.name}</span>
                {!type.active && <Badge tone="gray">Inactivo</Badge>}
              </div>
              <p className="text-xs text-muted">{type.description}</p>
            </div>
            <form action={toggleRecordTypeAction}>
              <input type="hidden" name="id" value={type.id} />
              <Button type="submit" variant="secondary" size="sm">
                {type.active ? "Desactivar" : "Activar"}
              </Button>
            </form>
          </div>
        ))}
      </Card>

      <Card className="flex flex-col gap-3 p-5">
        <p className="text-sm font-semibold text-avenida-black">Agregar tipo</p>
        <form action={createRecordTypeAction} className="flex flex-col gap-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              name="code"
              type="text"
              required
              maxLength={6}
              placeholder="Sigla (ej: INC)"
              className="h-10 rounded-xl border border-border bg-white px-3 text-sm uppercase text-avenida-black placeholder:text-muted placeholder:normal-case focus:border-avenida-violet focus:outline-none focus:ring-2 focus:ring-avenida-violet/20"
            />
            <input
              name="name"
              type="text"
              required
              placeholder="Nombre (ej: Incidente)"
              className="h-10 rounded-xl border border-border bg-white px-3 text-sm text-avenida-black placeholder:text-muted focus:border-avenida-violet focus:outline-none focus:ring-2 focus:ring-avenida-violet/20"
            />
          </div>
          <input
            name="description"
            type="text"
            placeholder="Descripción breve"
            className="h-10 rounded-xl border border-border bg-white px-3 text-sm text-avenida-black placeholder:text-muted focus:border-avenida-violet focus:outline-none focus:ring-2 focus:ring-avenida-violet/20"
          />
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm text-avenida-black" htmlFor="color">
              Color
            </label>
            <select
              id="color"
              name="color"
              defaultValue="violet"
              className="h-10 rounded-xl border border-border bg-white px-3 text-sm text-avenida-black focus:border-avenida-violet focus:outline-none focus:ring-2 focus:ring-avenida-violet/20"
            >
              {COLOR_OPTIONS.map((color) => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
            </select>
            <SubmitButton className="ml-auto shrink-0" pendingText="Agregando…">
              Agregar
            </SubmitButton>
          </div>
        </form>
      </Card>
    </div>
  );
}
