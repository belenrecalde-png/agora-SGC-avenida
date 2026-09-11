"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md";

/**
 * Botón de submit que se deshabilita mientras la Server Action del form está
 * en curso. Sin esto, un `<button type="submit">` normal sigue clickeable
 * mientras la acción corre — varios clicks (o un click doble por ansiedad de
 * no ver feedback inmediato) disparan la Server Action una vez por click, y
 * si esa acción crea algo (un registro, un work item en Plane), se duplica
 * una vez por click. Pasó de verdad: 3 clicks en "Reportar" crearon 3
 * registros reales y 3 tickets reales en Plane (2026-09-08).
 */
export function SubmitButton({
  children,
  pendingText,
  variant,
  size,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  pendingText?: ReactNode;
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant={variant} size={size} className={className} disabled={pending} {...props}>
      {pending ? (pendingText ?? "Guardando…") : children}
    </Button>
  );
}
