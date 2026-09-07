"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink, Search, Undo2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Button, LinkButton } from "@/components/ui/button";
import type { TicketPlaneRow } from "@/lib/plane/tickets";
import { descartarTicketAction, revertirDescarteAction } from "@/lib/actions/plane-tickets";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" });
}

function priorityTone(priority: TicketPlaneRow["priority"]): BadgeTone {
  if (priority === "Alta") return "red";
  if (priority === "Media") return "amber";
  return "green";
}

function estadoPlaneLabel(row: TicketPlaneRow): string {
  if (row.statusName) return row.statusName;
  if (!row.statusGroup) return "Sin estado";
  return row.statusGroup;
}

function estadoPlaneTone(row: TicketPlaneRow): BadgeTone {
  switch (row.statusGroup) {
    case "completed":
      return "green";
    case "started":
      return "violet";
    case "cancelled":
      return "gray";
    case "backlog":
    case "unstarted":
      return "blue";
    default:
      return "gray";
  }
}

function estadoSgcTone(status: string): BadgeTone {
  if (status === "Cerrado") return "green";
  if (status === "Rechazado") return "gray";
  if (status === "En análisis" || status === "En curso") return "violet";
  return "blue";
}

const ESTADO_GROUPS: { value: string; label: string }[] = [
  { value: "backlog", label: "Por hacer" },
  { value: "started", label: "En curso" },
  { value: "completed", label: "Hecho" },
  { value: "cancelled", label: "Cancelado" },
];

const CLASIFICACION_OPTIONS: { value: string; label: string }[] = [
  { value: "pending", label: "Sin tipificar" },
  { value: "linked", label: "Tipificado / vinculado" },
  { value: "dismissed", label: "No aplica" },
];

export function TicketsPlaneTable({
  rows,
  projects,
}: {
  rows: TicketPlaneRow[];
  projects: { id: string; name: string }[];
}) {
  const [query, setQuery] = useState("");
  const [projectFilter, setProjectFilter] = useState("todos");
  const [estadoFilter, setEstadoFilter] = useState("todos");
  const [clasificacionFilter, setClasificacionFilter] = useState("todas");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesProject = projectFilter === "todos" || row.projectId === projectFilter;
      const matchesEstado =
        estadoFilter === "todos" ||
        row.statusGroup === estadoFilter ||
        (estadoFilter === "backlog" && row.statusGroup === "unstarted");
      const matchesClasificacion = clasificacionFilter === "todas" || row.classification === clasificacionFilter;
      const matchesQuery =
        !q ||
        row.title.toLowerCase().includes(q) ||
        row.projectName.toLowerCase().includes(q) ||
        String(row.sequenceId ?? "").includes(q);
      return matchesProject && matchesEstado && matchesClasificacion && matchesQuery;
    });
  }, [rows, query, projectFilter, estadoFilter, clasificacionFilter]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            type="text"
            placeholder="Buscar por ticket, título o proyecto"
            className="h-10 w-full rounded-xl border border-border bg-white pl-9 pr-3 text-sm text-avenida-black placeholder:text-muted focus:border-avenida-violet focus:outline-none focus:ring-2 focus:ring-avenida-violet/20"
          />
        </div>
        <select
          value={projectFilter}
          onChange={(event) => setProjectFilter(event.target.value)}
          className="h-10 rounded-xl border border-border bg-white px-3 text-sm text-avenida-black focus:border-avenida-violet focus:outline-none focus:ring-2 focus:ring-avenida-violet/20"
        >
          <option value="todos">Todos los proyectos</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
        <select
          value={estadoFilter}
          onChange={(event) => setEstadoFilter(event.target.value)}
          className="h-10 rounded-xl border border-border bg-white px-3 text-sm text-avenida-black focus:border-avenida-violet focus:outline-none focus:ring-2 focus:ring-avenida-violet/20"
        >
          <option value="todos">Estado Plane: todos</option>
          {ESTADO_GROUPS.map((group) => (
            <option key={group.value} value={group.value}>
              {group.label}
            </option>
          ))}
        </select>
        <select
          value={clasificacionFilter}
          onChange={(event) => setClasificacionFilter(event.target.value)}
          className="h-10 rounded-xl border border-border bg-white px-3 text-sm text-avenida-black focus:border-avenida-violet focus:outline-none focus:ring-2 focus:ring-avenida-violet/20"
        >
          <option value="todas">Clasificación SGC: todas</option>
          {CLASIFICACION_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 p-8 text-center">
          <p className="text-sm text-muted">
            {rows.length === 0
              ? "No hay tickets para mostrar en los proyectos de Plane mapeados."
              : "No encontramos tickets para los filtros elegidos."}
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-avenida-violet-light/20 text-left text-xs text-muted">
                  <th className="px-4 py-3 font-medium">Proyecto</th>
                  <th className="px-4 py-3 font-medium">Ticket</th>
                  <th className="px-4 py-3 font-medium">Título</th>
                  <th className="px-4 py-3 font-medium">Estado Plane</th>
                  <th className="px-4 py-3 font-medium">Prioridad</th>
                  <th className="px-4 py-3 font-medium">Clasificación SGC</th>
                  <th className="px-4 py-3 font-medium">Estado SGC</th>
                  <th className="px-4 py-3 font-medium">Fecha</th>
                  <th className="px-4 py-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr
                    key={`${row.projectId}:${row.workItemId}`}
                    className={
                      row.classification === "dismissed"
                        ? "border-b border-border bg-background/60 last:border-0"
                        : "border-b border-border last:border-0 hover:bg-avenida-violet-light/10"
                    }
                  >
                    <td className="px-4 py-3 text-muted">{row.projectName}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-muted">
                      {row.sequenceId ?? row.workItemId.slice(0, 8)}
                    </td>
                    <td className={row.classification === "dismissed" ? "max-w-[260px] truncate px-4 py-3 text-muted" : "max-w-[260px] truncate px-4 py-3 text-avenida-black"}>
                      {row.title}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={estadoPlaneTone(row)}>{estadoPlaneLabel(row)}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={priorityTone(row.priority)}>{row.priority}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      {row.classification === "linked" && row.linkedRecord ? (
                        <Badge tone="violet">{row.linkedRecord.typeCode}</Badge>
                      ) : row.classification === "dismissed" ? (
                        <Badge tone="gray">No aplica</Badge>
                      ) : (
                        <Badge tone="gray">Sin tipificar</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {row.classification === "linked" && row.linkedRecord ? (
                        <Badge tone={estadoSgcTone(row.linkedRecord.status)}>{row.linkedRecord.status}</Badge>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted">{formatDate(row.createdAt)}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex flex-nowrap items-center gap-1.5">
                        {row.classification === "pending" && (
                          <>
                            <LinkButton
                              href={`/gestion-calidad/tickets-plane/tipificar?projectId=${encodeURIComponent(row.projectId)}&workItemId=${encodeURIComponent(row.workItemId)}`}
                              size="sm"
                            >
                              Tipificar
                            </LinkButton>
                            <LinkButton
                              href={`/gestion-calidad/tickets-plane/vincular?projectId=${encodeURIComponent(row.projectId)}&workItemId=${encodeURIComponent(row.workItemId)}`}
                              variant="secondary"
                              size="sm"
                            >
                              Vincular
                            </LinkButton>
                            <form action={descartarTicketAction}>
                              <input type="hidden" name="planeProjectId" value={row.projectId} />
                              <input type="hidden" name="planeWorkItemId" value={row.workItemId} />
                              <input type="hidden" name="planeSequenceId" value={row.sequenceId ?? ""} />
                              <Button type="submit" variant="ghost" size="sm" className="text-muted">
                                No aplica
                              </Button>
                            </form>
                          </>
                        )}
                        {row.classification === "linked" && row.linkedRecord && (
                          <Link
                            href={`/gestion-calidad/registro/${row.linkedRecord.code}`}
                            className="text-xs font-medium text-avenida-violet hover:underline"
                          >
                            Ver {row.linkedRecord.code}
                          </Link>
                        )}
                        {row.classification === "dismissed" && (
                          <form action={revertirDescarteAction}>
                            <input type="hidden" name="planeWorkItemId" value={row.workItemId} />
                            <Button type="submit" variant="ghost" size="sm" className="gap-1.5 text-muted">
                              <Undo2 className="h-3.5 w-3.5" />
                              Deshacer
                            </Button>
                          </form>
                        )}
                        {row.planeUrl && (
                          <a
                            href={row.planeUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-border text-avenida-black hover:bg-avenida-violet-light/60"
                            title="Abrir en Plane"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
