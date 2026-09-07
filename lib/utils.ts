import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina clases de Tailwind resolviendo conflictos (ej. bg-surface vs bg-avenida-black)
 * a favor de la última clase indicada, en vez de dejarlo librado al orden del CSS generado.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
