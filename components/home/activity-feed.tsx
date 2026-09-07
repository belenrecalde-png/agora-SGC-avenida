import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import type { ActivityFeedItem } from "@/lib/dashboard-data";

function formatRelative(iso: string): string {
  return new Date(iso).toLocaleString("es-AR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function ActivityFeed({ items }: { items: ActivityFeedItem[] }) {
  return (
    <Card className="flex flex-col gap-4 p-5">
      <CardHeader className="flex-row items-center justify-between p-0">
        <CardTitle className="text-base">Actividad reciente</CardTitle>
        <Link
          href="/gestion-calidad/registro"
          className="flex items-center gap-1 text-xs font-medium text-avenida-violet hover:underline"
        >
          Ver todo <ArrowRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      {items.length === 0 ? (
        <p className="text-sm text-muted">Todavía no hay actividad registrada.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((item) => (
            <div key={item.id} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-avenida-violet-light text-avenida-violet">
                <Clock className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0">
                <p className="text-sm text-avenida-black">
                  <span className="font-medium">{item.event}</span>
                  {" · "}
                  <Link href={item.href} className="text-avenida-violet hover:underline">
                    {item.entityLabel}
                  </Link>
                </p>
                <p className="mt-0.5 text-xs text-muted">{formatRelative(item.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
