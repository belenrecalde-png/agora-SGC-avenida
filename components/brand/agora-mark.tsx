import Image from "next/image";

/**
 * Isotipo real de Ágora (logo provisto por el usuario el 2026-09-07): dos manos
 * que se encuentran formando un círculo, en gradiente violeta → azul. Reemplaza
 * al SVG genérico que se había dibujado a mano como placeholder en la Fase 1
 * ("dos cabezas + brazos que convergen") mientras no existía un isotipo
 * definitivo — ver `claude/progreso-implementacion.md`.
 *
 * El archivo real es un lockup horizontal completo (ícono + "Ágora" +
 * "Gestión · Conocimiento · Mejora"); este componente usa solo el ícono
 * recortado (`public/brand/agora-icon.png`, fondo transparente) porque el
 * texto del lockup se sigue escribiendo con la tipografía real del sitio
 * (más nítido a estos tamaños chicos que un recorte rasterizado). El lockup
 * completo queda disponible en `public/brand/agora-logo-full.png` por si
 * hace falta en una pantalla que no tenga el sidebar al lado (ej. login).
 */
export function AgoraMark({ className }: { className?: string }) {
  return (
    <Image
      src="/brand/agora-icon.png"
      alt="Ágora"
      width={96}
      height={96}
      className={className}
      priority
    />
  );
}
