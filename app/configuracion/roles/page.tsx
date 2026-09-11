import type { ComponentType } from "react";
import { KeyRound, ShieldCheck, Award, Building2, Eye, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";

export const metadata = {
  title: `Roles | Ágora`,
};

type RoleBlock = {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  tone: BadgeTone;
  dataAccess: string;
  editing: string;
  gestion: string;
  configuracion: string;
};

const ROLE_BLOCKS: RoleBlock[] = [
  {
    id: "admin",
    label: "Administrador SGC",
    icon: ShieldCheck,
    tone: "violet",
    dataAccess: "Todo el portal, de todas las áreas, sin ningún filtro.",
    editing: "Puede editar y cerrar cualquier registro, riesgo, oportunidad, objetivo o indicador.",
    gestion:
      "Navega sin restricciones el Registro SGC, Riesgos y Oportunidades, Objetivos de Calidad, Indicadores y Tickets Plane.",
    configuracion:
      "Es el único rol que entra a Configuración → Usuarios y Página de inicio. También accede al resto de Configuración (Áreas, Tipos, Estados, Plane, Procesos, Roles, Apps Script, Integraciones, Logs).",
  },
  {
    id: "calidad",
    label: "Calidad",
    icon: Award,
    tone: "blue",
    dataAccess: "Todo el portal, de todas las áreas, sin ningún filtro — igual que Administrador SGC.",
    editing: "Puede editar y cerrar cualquier registro, riesgo, oportunidad, objetivo o indicador.",
    gestion:
      "Navega sin restricciones el Registro SGC, Riesgos y Oportunidades, Objetivos de Calidad, Indicadores y Tickets Plane.",
    configuracion:
      "Accede a Configuración (Áreas, Tipos, Estados, Plane, Procesos, Roles, Apps Script, Integraciones, Logs), salvo Usuarios y Página de inicio — esas dos quedan reservadas solo para Administrador SGC.",
  },
  {
    id: "responsable_area",
    label: "Responsable de Área",
    icon: Building2,
    tone: "green",
    dataAccess:
      "Solo lo de su propia área (la que le asignó un Administrador SGC en Configuración → Usuarios) — el resto de la empresa no aparece en sus listados.",
    editing: "Puede crear, editar y cerrar lo que pertenece a su área.",
    gestion:
      "Navega el Registro SGC, Riesgos y Oportunidades, Objetivos de Calidad, Indicadores y Tickets Plane, siempre recortados a su área.",
    configuracion: "No accede a Configuración.",
  },
  {
    id: "consulta",
    label: "Consulta",
    icon: Eye,
    tone: "gray",
    dataAccess: "El mismo alcance que Responsable de Área (una única área), pero de solo lectura.",
    editing: "No puede crear, editar ni cerrar nada.",
    gestion:
      "Navega el Registro SGC, Riesgos y Oportunidades, Objetivos de Calidad e Indicadores de su área en modo lectura. No accede a Tickets Plane (esa pantalla es una cola de trabajo, no tiene sentido en modo consulta).",
    configuracion: "No accede a Configuración.",
  },
  {
    id: "colaborador",
    label: "Colaborador",
    icon: User,
    tone: "amber",
    dataAccess:
      "No navega los listados completos de gestión — solo ve, en \"Mi SGC\", lo que reportó o lo que tiene asignado como responsable.",
    editing:
      "Puede reportar una situación nueva en cualquier momento. Puede ver el detalle de un registro puntual si es quien lo reportó o el responsable de su corrección/verificación (para que los links desde Mi SGC funcionen), pero no puede editarlo.",
    gestion: "Si intenta entrar al Registro SGC, Riesgos, Objetivos o Indicadores, se lo redirige a Mi SGC.",
    configuracion: "No accede a Configuración.",
  },
];

export default function RolesPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 pb-12">
      <div className="flex items-start gap-4">
        <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-avenida-violet-light text-avenida-violet">
          <KeyRound className="h-6 w-6" />
        </span>
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Configuración</p>
          <h1 className="text-2xl font-semibold text-avenida-black">Roles</h1>
        </div>
      </div>

      <p className="text-sm text-avenida-black">
        Los 5 roles del portal y qué puede hacer cada uno hoy. Para asignarle un rol (y un área, si
        corresponde) a una persona, ir a{" "}
        <span className="font-medium">Configuración → Usuarios</span>. Cada persona se da de alta sola
        la primera vez que entra con su cuenta de Google de Avenida+, con el rol Colaborador por
        defecto, hasta que un Administrador SGC se lo cambie.
      </p>

      <div className="flex flex-col gap-4">
        {ROLE_BLOCKS.map((role) => {
          const Icon = role.icon;
          return (
            <Card key={role.id} className="flex flex-col gap-4 p-5">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-avenida-blue-light text-avenida-blue">
                  <Icon className="h-4 w-4" />
                </span>
                <h3 className="text-base font-semibold text-avenida-black">{role.label}</h3>
                <Badge tone={role.tone}>{role.id}</Badge>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">¿Qué datos ve?</p>
                  <p className="text-sm text-avenida-black">{role.dataAccess}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">¿Qué puede editar?</p>
                  <p className="text-sm text-avenida-black">{role.editing}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">Gestión de Calidad</p>
                  <p className="text-sm text-avenida-black">{role.gestion}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">Configuración</p>
                  <p className="text-sm text-avenida-black">{role.configuracion}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
