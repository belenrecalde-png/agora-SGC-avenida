"use client";

import { Trash2 } from "lucide-react";
import { eliminarRegistroAction } from "@/lib/actions/gestion";

/** Solo se renderiza si el que ve la página es `admin` — ver `page.tsx`. */
export function DeleteRecordButton({ code, title }: { code: string; title: string }) {
  return (
    <form
      action={eliminarRegistroAction}
      onSubmit={(event) => {
        const sure = window.confirm(
          `¿Borrar definitivamente "${title}" (${code})?\n\nEsto elimina el registro, su historial, evidencias y vínculos con otros registros. No se puede deshacer.`,
        );
        if (!sure) event.preventDefault();
      }}
    >
      <input type="hidden" name="code" value={code} />
      <button
        type="submit"
        className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
      >
        <Trash2 className="h-3.5 w-3.5" />
        Eliminar registro
      </button>
    </form>
  );
}
