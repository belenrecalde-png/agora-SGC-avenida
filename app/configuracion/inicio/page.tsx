import { ImageIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { requireRole } from "@/lib/auth/dal";
import { getHomePhotoUrl } from "@/lib/db/queries";
import { removeHomePhotoAction, uploadHomePhotoAction } from "@/lib/actions/site-settings";

export const dynamic = "force-dynamic";

export const metadata = {
  title: `Página de inicio | Ágora`,
};

export default async function PaginaDeInicioPage() {
  await requireRole(["admin"]);
  const photoUrl = getHomePhotoUrl();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 pb-12">
      <div className="flex items-start gap-4">
        <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-avenida-violet-light text-avenida-violet">
          <ImageIcon className="h-6 w-6" />
        </span>
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Configuración</p>
          <h1 className="text-2xl font-semibold text-avenida-black">Página de inicio</h1>
        </div>
      </div>

      <p className="text-sm text-avenida-black">
        Subí una foto del equipo para que aparezca en el Home, en el espacio que hoy muestra un cartel
        de &ldquo;espacio para una foto&rdquo;. Formatos aceptados: JPG, PNG o WEBP, hasta 5 MB.
      </p>

      <Card className="flex flex-col gap-4 p-5">
        <p className="text-sm font-semibold text-avenida-black">Vista previa actual</p>
        {photoUrl ? (
          <div className="aspect-[4/3] w-full max-w-sm overflow-hidden rounded-2xl border border-border">
            {/* <img> a propósito, no next/image: la ruta es dinámica y exige sesión
                (la sirve app/api/uploads/[filename], detrás de proxy.ts) — el
                optimizador de next/image la pediría con un fetch propio del
                servidor, sin la cookie de sesión del navegador, y rompería. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photoUrl} alt="Foto del equipo Avenida+" className="h-full w-full object-cover" />
          </div>
        ) : (
          <div className="flex aspect-[4/3] w-full max-w-sm flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-avenida-violet/30 bg-avenida-violet-light/20 text-center">
            <ImageIcon className="h-8 w-8 text-avenida-violet/50" />
            <p className="max-w-[220px] text-xs text-muted">Todavía no se cargó ninguna foto — se muestra el cartel por defecto.</p>
          </div>
        )}
      </Card>

      <Card className="flex flex-col gap-3 p-5">
        <p className="text-sm font-semibold text-avenida-black">{photoUrl ? "Cambiar la foto" : "Subir una foto"}</p>
        <form action={uploadHomePhotoAction} className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="file"
            name="photo"
            accept="image/jpeg,image/png,image/webp"
            required
            className="flex-1 text-sm text-avenida-black file:mr-3 file:rounded-lg file:border-0 file:bg-avenida-violet-light file:px-3 file:py-2 file:text-sm file:font-medium file:text-avenida-violet hover:file:bg-avenida-violet-light/70"
          />
          <SubmitButton size="sm" pendingText="Subiendo…" className="shrink-0">
            Guardar foto
          </SubmitButton>
        </form>
      </Card>

      {photoUrl && (
        <form action={removeHomePhotoAction}>
          <Button type="submit" variant="ghost" size="sm" className="w-fit text-red-600 hover:bg-red-50">
            Quitar la foto y volver al cartel por defecto
          </Button>
        </form>
      )}
    </div>
  );
}
