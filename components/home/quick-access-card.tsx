import Link from "next/link";
import type { ComponentType } from "react";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type QuickAccessTone = "violet" | "blue" | "amber" | "green";

const TONE_CLASSES: Record<QuickAccessTone, string> = {
  violet: "bg-avenida-violet-light text-avenida-violet",
  blue: "bg-avenida-blue-light text-avenida-blue",
  amber: "bg-amber-50 text-amber-600",
  green: "bg-emerald-50 text-emerald-600",
};

export function QuickAccessCard({
  href,
  label,
  description,
  icon: Icon,
  tone = "violet",
}: {
  href: string;
  label: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  tone?: QuickAccessTone;
}) {
  return (
    <Link href={href} className="group block h-full">
      <Card className="flex h-full flex-col gap-3 p-5 transition-all group-hover:-translate-y-0.5 group-hover:border-avenida-violet/40 group-hover:shadow-md group-hover:shadow-avenida-violet/10">
        <div className="flex items-center justify-between">
          <span
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-xl",
              TONE_CLASSES[tone],
            )}
          >
            <Icon className="h-5 w-5" />
          </span>
          <ArrowRight className="h-4 w-4 text-border transition-colors group-hover:text-avenida-violet" />
        </div>
        <div>
          <p className="text-sm font-semibold text-avenida-black">{label}</p>
          <p className="mt-1 text-sm text-muted">{description}</p>
        </div>
      </Card>
    </Link>
  );
}
