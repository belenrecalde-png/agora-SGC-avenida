import type { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "bg-avenida-violet text-white hover:bg-avenida-violet/90 shadow-sm shadow-avenida-violet/20",
  secondary:
    "bg-white text-avenida-black border border-border hover:bg-avenida-violet-light/60",
  ghost: "text-avenida-black hover:bg-avenida-violet-light/60",
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
};

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none";

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return (
    <button
      className={cn(BASE, VARIANT_CLASSES[variant], SIZE_CLASSES[size], className ?? "")}
      {...props}
    />
  );
}

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
}: {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(BASE, VARIANT_CLASSES[variant], SIZE_CLASSES[size], className ?? "")}
    >
      {children}
    </Link>
  );
}
