import Link from "next/link";
import { ArrowRight, Circle } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { MIS_PENDIENTES_HOME } from "@/lib/mock-dashboard";

export function PendingChecklist() {
  return (
    <Card className="flex flex-col gap-4 p-5">
      <CardHeader className="flex-row items-center justify-between p-0">
        <CardTitle className="text-base">Mis pendientes</CardTitle>
        <Link
          href="/mi-sgc"
          className="flex items-center gap-1 text-xs font-medium text-avenida-violet hover:underline"
        >
          Ver todos <ArrowRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      <div className="flex flex-col gap-3">
        {MIS_PENDIENTES_HOME.map((item, index) => (
          <div key={index} className="flex items-start gap-3">
            <Circle className="mt-0.5 h-4 w-4 shrink-0 text-border" />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-avenida-black">{item.text}</p>
              <p className="text-xs text-muted">{item.meta}</p>
            </div>
            <span
              className={cn(
                "shrink-0 text-xs font-medium",
                item.urgent ? "text-red-500" : "text-muted",
              )}
            >
              {item.due}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
