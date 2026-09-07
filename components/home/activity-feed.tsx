import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ACTIVIDAD_RECIENTE } from "@/lib/mock-dashboard";

const DOT_CLASSES: Record<string, string> = {
  blue: "bg-avenida-blue-light text-avenida-blue",
  green: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  violet: "bg-avenida-violet-light text-avenida-violet",
};

export function ActivityFeed() {
  return (
    <Card className="flex flex-col gap-4 p-5">
      <CardHeader className="flex-row items-center justify-between p-0">
        <CardTitle className="text-base">Actividad reciente</CardTitle>
        <Link
          href="/mi-sgc"
          className="flex items-center gap-1 text-xs font-medium text-avenida-violet hover:underline"
        >
          Ver todo <ArrowRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      <div className="flex flex-col gap-4">
        {ACTIVIDAD_RECIENTE.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className="flex items-start gap-3">
              <span
                className={cn(
                  "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                  DOT_CLASSES[item.tone],
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0">
                <p className="text-sm text-avenida-black">
                  <span className="font-medium">{item.who}</span> {item.text}
                </p>
                <p className="mt-0.5 text-xs text-muted">{item.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
