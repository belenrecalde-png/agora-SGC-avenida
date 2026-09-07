import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { REQUIEREN_ATENCION, statusTone, priorityTone } from "@/lib/mock-dashboard";

export function AttentionTable() {
  return (
    <Card className="flex flex-col gap-4 p-5">
      <CardHeader className="flex-row items-center justify-between p-0">
        <CardTitle className="text-base">Requieren atención</CardTitle>
        <Link
          href="/gestion-calidad/registro"
          className="flex items-center gap-1 text-xs font-medium text-avenida-violet hover:underline"
        >
          Ver todas <ArrowRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      <div className="-mx-1 overflow-x-auto">
        <table className="w-full min-w-[480px] border-collapse text-sm">
          <thead>
            <tr className="text-left text-xs text-muted">
              <th className="px-1 pb-2 font-medium">Código</th>
              <th className="px-1 pb-2 font-medium">Responsable</th>
              <th className="px-1 pb-2 font-medium">Vencimiento</th>
              <th className="px-1 pb-2 font-medium">Estado</th>
              <th className="px-1 pb-2 font-medium">Prioridad</th>
            </tr>
          </thead>
          <tbody>
            {REQUIEREN_ATENCION.map((row) => (
              <tr key={row.code} className="border-t border-border">
                <td className="whitespace-nowrap px-1 py-2">
                  <p className="font-medium text-avenida-black">{row.code}</p>
                  <p className="text-xs text-muted">{row.type}</p>
                </td>
                <td className="whitespace-nowrap px-1 py-2 text-muted">{row.owner}</td>
                <td className="whitespace-nowrap px-1 py-2 text-muted">{row.due}</td>
                <td className="whitespace-nowrap px-1 py-2">
                  <Badge tone={statusTone(row.status)}>{row.status}</Badge>
                </td>
                <td className="whitespace-nowrap px-1 py-2">
                  <Badge tone={priorityTone(row.priority)}>{row.priority}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
