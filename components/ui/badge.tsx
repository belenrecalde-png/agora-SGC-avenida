import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type BadgeTone = "violet" | "blue" | "gray" | "green" | "amber" | "red";

const TONE_CLASSES: Record<BadgeTone, string> = {
  violet: "bg-avenida-violet-light text-avenida-violet",
  blue: "bg-blue-50 text-avenida-blue",
  gray: "bg-avenida-gray/40 text-avenida-black",
  green: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  red: "bg-red-50 text-red-600",
};

export function Badge({
  tone = "violet",
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
        TONE_CLASSES[tone],
        className ?? "",
      )}
      {...props}
    />
  );
}
