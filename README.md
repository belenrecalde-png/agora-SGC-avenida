# Ágora — Portal de Gestión de Calidad de Avenida+

Aplicación web interna del Sistema de Gestión de Calidad (ISO 9001) de Avenida+, con el nombre **Ágora**. Este repositorio contiene las **Fases 1 a 4**: estructura visual, Centro de Conocimiento, Reportes SGC (formulario real, código automático, Registro SGC y administración básica) e integración del portal con Plane (creación automática de work items, mapeo de proyectos por área, prueba de conexión y sincronización de estados) — más un script de Apps Script (`apps-script/plane-integracion-sgc.gs`, fuera de este repo Next.js, se pega en el proyecto de Apps Script real del usuario) que integra Plane directamente con el SGC real de Calidad en Sheets, ya que esa integración no existía antes de esta fase.

Ver la especificación funcional completa en el proyecto **SGC** de Claude (`claude/spec-sgc-avenida-plus.md`), la referencia técnica de la integración con Plane (`claude/integracion-plane-appsscript.md`) y el registro de decisiones/progreso (`claude/progreso-implementacion.md` — **leer primero**, tiene aclaraciones importantes sobre el nombre, el sistema visual, la decisión de base de datos y cómo se relaciona el portal con el Registro de Gestión de Calidad que ya existe en Apps Script).

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** (tokens de marca vía `@theme inline` en `app/globals.css`)
- **lucide-react** para iconografía
- **@fontsource-variable/inter** — Inter auto-hospedada (sin depender de Google Fonts en build time)
- `clsx` + `tailwind-merge` para composición segura de clases
- **`node:sqlite`** (driver de SQLite incluido en Node 22.5+) para la base de datos del portal — ver "Base de datos" abajo

## Cómo correr el proyecto

```bash
npm install
npm run dev       # http://localhost:3000
```

Otros comandos:

```bash
npm run build     # build de producción
npm run start     # sirve el build de producción
npm run lint      # eslint
```

## Variables de entorno (Plane)

Copiar `.env.example` a `.env.local` (ya está en `.gitignore`) y completar ahí los valores reales de tu instancia de Plane — `PLANE_BASE_URL`, `PLANE_WORKSPACE_SLUG`, `PLANE_API_KEY`. **Nunca se cargan en el código ni se comparten en el chat con Claude**: son credenciales del entorno de despliegue, las carga quien tenga acceso a la instancia real de Plane.

Sin estas variables, el portal funciona igual — los reportes se siguen creando y guardando en la base local, simplemente no se crea el work item en Plane. El estado en vivo de la configuración (qué variable falta, si el mapeo de áreas está cargado) se ve en **Configuración → Plane** dentro del portal.

## Base de datos

El portal usa **SQLite vía `node:sqlite`**, el driver que trae Node 22.5+ sin dependencias externas. Se eligió después de probar Prisma: su CLI necesita descargar binarios desde `binaries.prisma.sh` al generar el cliente, y esa red puede no estar disponible según el entorno (no lo estaba en el entorno donde se construyó esto). `node:sqlite` no descarga nada — viene con Node.

- El archivo vive en `data/agora.db` y **se crea y semilla solo** la primera vez que arranca el servidor (áreas y tipos de registro por defecto). No se versiona (está en `.gitignore`) — si lo borrás, se vuelve a crear semillado desde cero.
- Requiere **Node ≥ 22.5**. Es una API todavía marcada "experimental" por Node (aparece un warning en consola al arrancar) — si el hosting definitivo corre una versión de Node más vieja, hay que resolver esto antes de desplegar (actualizar Node, o migrar `lib/db/queries.ts` a otro motor).
- Toda la lectura/escritura pasa por `lib/db/queries.ts` — si más adelante hace falta Postgres (por ejemplo, para correr varias instancias del servidor a la vez), ese es el único archivo que habría que reescribir.

## Estructura de carpetas

```
app/                          Rutas (App Router). Cada carpeta = una ruta del sidebar.
  layout.tsx                  Layout raíz (fuente, metadata, AppShell)
  page.tsx                    Home (dashboard con datos de ejemplo)
  mi-sgc/page.tsx              Mi SGC (con datos mock — todavía no lee del Registro SGC real)
  reportar/page.tsx            Selector visual de categorías de reporte
  reportar/nuevo/               Formulario real de reporte (Fase 3)
  reportar/confirmacion/[code]/ Confirmación con código SGC generado (Fase 3)
  gestion-calidad/registro/      Registro SGC: listado + detalle (Fase 3, dato real; detalle muestra el ticket de Plane si existe)
  gestion-calidad/...             Resto: placeholders (Fase 6/7)
  planificacion/...              Placeholders (Fase 8/9/11)
  procesos/...                   Placeholders (Fase 10)
  evaluacion/...                  Placeholders (Fase 11/13/14)
  documentacion/...               Placeholders (Fase 12)
  centro-de-conocimiento/...       Conceptos, ISO 9001, Calidad en 2 minutos, Comparador, FAQ (Fase 2, dato real)
  configuracion/areas/             Administración de áreas (Fase 3, dato real)
  configuracion/tipos/             Administración de tipos de registro (Fase 3, dato real)
  configuracion/plane/             Estado de configuración, mapeo de áreas↔proyectos, probar conexión, sincronizar (Fase 4, dato real)
  configuracion/logs/              Historial de sincronizaciones con Plane (Fase 4, dato real)
  configuracion/...                 Resto: placeholders (Fase 5/6)

components/
  layout/                      Sidebar, Header, Breadcrumbs, AppShell, GlobalSearch, PlaceholderPage
  ui/                          Card, Badge, Button (primitivas reutilizables)
  home/                        Hero, QuickAccessCard, StatCard, AttentionTable, ActivityFeed,
                                PendingChecklist, ReportCategoryPicker
  gestion-calidad/              RegistroTable (listado con filtros del Registro SGC)
  brand/                       AgoraMark (isotipo placeholder — reemplazar si hay logo definitivo)

lib/
  nav-data.json                Fuente única de verdad de la navegación (sidebar + rutas + descripciones + fase)
  nav-config.ts                Versión tipada de nav-data.json (resuelve íconos de lucide-react)
  search-index.ts              Índice de búsqueda global (rutas + conceptos + FAQs)
  report-categories.ts         Contenido del selector "¿Qué querés reportar?"
  concepts-data.ts             Los 43 conceptos del Centro de Conocimiento
  two-minutes-data.ts, comparisons-data.ts, faq-data.ts, iso-map-data.ts
                                Contenido del resto del Centro de Conocimiento
  mock-mi-sgc.ts               Datos de ejemplo para Mi SGC (pendiente de conectar a datos reales)
  mock-dashboard.ts            Datos de ejemplo del Home (stat cards, tabla, actividad, pendientes)
  db/client.ts                 Conexión SQLite + migración + semilla (ver "Base de datos" arriba)
  db/queries.ts                Todo el acceso a datos (áreas, tipos, registros, código SGC, historial, mapeos y logs de Plane)
  db/node-sqlite.d.ts          Tipos TypeScript para node:sqlite (no incluidos todavía en @types/node)
  plane/client.ts              Cliente HTTP de Plane (auth, reintentos, estados, crear/leer/listar work items) — ver "Integración con Plane" abajo
  plane/sync.ts                Puente registro↔Plane: crear el work item al reportar, refrescar estados en lote
  actions/reports.ts           Server Action: crear un reporte (dispara la sincronización con Plane)
  actions/admin.ts             Server Actions: alta/activar/desactivar áreas y tipos
  actions/plane.ts             Server Actions: mapeo de proyectos, probar conexión, sincronizar ahora
  utils.ts                     Helper `cn()` (clsx + tailwind-merge)

scripts/
  generate-placeholders.cjs    Genera app/**/page.tsx para cada item de nav-data.json que no tenga
                                implementación real. Volver a correr con `node scripts/generate-placeholders.cjs`
                                si se agrega un ítem nuevo al menú y todavía no tiene página propia.
                                El set IMPLEMENTED lista las rutas que ya tienen código real y no hay
                                que pisar.

public/brand/avenida-logo.png  Isotipo Avenida+ (marca paraguas, se muestra en el pie del sidebar y en
                                el banner de cierre del Home)

apps-script/plane-a-registro-gestion.gs
                                NO es parte de esta app Next.js — es un archivo .gs para pegar en el
                                proyecto de Apps Script del usuario (el que ya tiene el Registro de
                                Gestión en Sheets). Trae a esa hoja los tickets creados directo en
                                Plane. Ver "Integración con Plane" abajo.
```

## Integración con Plane (Fase 4)

Cada reporte nuevo del portal, si su área tiene un proyecto de Plane mapeado y Plane está configurado, crea automáticamente un work item ahí (`lib/plane/sync.ts`). Si Plane no está configurado, o el área no tiene mapeo, o la llamada falla, **el reporte se crea igual** — nunca se bloquea el flujo de reportar por un problema de Plane. Lo que haya pasado queda en el historial del propio registro y en **Configuración → Logs**.

- **Configuración → Plane**: estado de las tres variables de entorno (sin exponer valores), mapeo de áreas a proyectos de Plane (UUID real, lo carga el usuario), botón "Probar conexión" por proyecto, y "Sincronizar ahora" para refrescar el estado de los tickets que el portal ya creó.
- **Configuración → Logs**: historial completo de intentos (creación de work items, pruebas de conexión, sincronizaciones), con su resultado y detalle.
- **Confirmación de reporte y detalle del Registro SGC**: muestran el link "Abrir en Plane" cuando existe un ticket vinculado, o una explicación breve de por qué no (Plane no configurado / área sin mapear / falló la creación).

**Nunca se cargaron credenciales reales de Plane en esta sesión** — el usuario indicó explícitamente que no puede compartirlas por confidencialidad. Todo lo de arriba se probó con Plane sin configurar (para confirmar que el portal se degrada bien) — falta probarlo contra una instancia real de Plane cuando el usuario cargue sus variables de entorno.

**Esta integración es la del portal con Plane, independiente de la del Apps Script real de Calidad.** El SGC real (`Codigo_final.gs`, Sheets) no tenía ninguna integración con Plane — se construyó desde cero en `apps-script/plane-integracion-sgc.gs`, un archivo aparte para pegar en el proyecto de Apps Script existente del usuario (100% aditivo, no toca ninguna hoja ni función real). Cubre las dos direcciones: crea tickets en Plane a partir de `no_conformidades`/`acciones_correctivas`/`r002_manual`, y trae a `r002_manual` los tickets cargados directo en Plane. Documentado en detalle en sus propios comentarios y en `claude/progreso-implementacion.md` (sección "Fase 5"). Por ahora esta integración y la del portal **no se cruzan entre sí** — son dos puentes independientes hacia Plane.

## Decisiones acumuladas

- **Nombre: Ágora.** Avenida+ se mantiene como marca paraguas. No hay un logo definitivo de Ágora todavía — `components/brand/agora-mark.tsx` es un isotipo propio simple a modo de placeholder.
- **Estética v2 tipo dashboard**: sidebar claro, header con buscador protagonista, hero de dos columnas, accesos rápidos con íconos de colores variados, fila de stat cards y una sección de 3 columnas. El contenido de esa sección usa **datos de ejemplo explícitamente etiquetados** porque corresponde a fases posteriores (Dashboard de Calidad es Fase 14).
- El hero de Home tiene un **placeholder de imagen** en lugar de una foto de stock inventada — reemplazar por una foto real del equipo cuando el usuario la provea.
- **Todo el árbol de navegación de la spec ya es clickeable.** Cada sección sin funcionalidad todavía muestra una página "próximamente" con su descripción y la fase en la que se implementará.
- **Centro de Conocimiento (Fase 2)** con contenido real pero marcado como borrador ("Borrador — a revisar por Calidad") — ver `claude/progreso-implementacion.md` para el detalle de qué revisar.
- **Reportes SGC (Fase 3)**: formulario real → base de datos (SQLite vía `node:sqlite`, ver arriba) → código automático → Registro SGC. La evidencia es un campo de texto/link por ahora (no carga de archivos), y los estados son un flujo genérico compartido entre tipos — el detalle de estos recortes de alcance está en `claude/progreso-implementacion.md`.
- **El buscador global** (header y Home) indexa rutas del menú, conceptos y FAQs.
- **No se usó `next/font/google`** porque este entorno de build no tiene salida a `fonts.googleapis.com`; se optó por `@fontsource-variable/inter`.
- **No se usó Prisma** porque su CLI necesita descargar binarios desde `binaries.prisma.sh`, bloqueado en este entorno; se optó por `node:sqlite` (ver "Base de datos" arriba).
- **Integración con Plane (Fase 4, portal)**: no había ninguna integración previa que replicar — se construyó desde cero contra la API pública documentada de Plane self-hosted (`claude/integracion-plane-appsscript.md`, corregido el 2026-09-06: describe convenciones de la API de Plane, no un sistema propio preexistente). El endpoint para *listar* todos los work items de un proyecto (`GET /work-items/` sin id) es una suposición no verificada. Ver el detalle completo en `claude/progreso-implementacion.md`.
- **Integración con Plane (Fase 5, Apps Script real)**: `apps-script/plane-integracion-sgc.gs`, construida contra el esquema real de `Codigo_final.gs` (hojas `no_conformidades`, `acciones_correctivas`, `r002_manual`), mapeando por **tipo** de registro en vez de por área porque solo `no_conformidades` tiene columna de área en el esquema real. Ver `claude/progreso-implementacion.md`, sección "Fase 5".

## Próximos pasos (Fase 5 en adelante)

Ver el detalle completo de las 14 fases en `claude/spec-sgc-avenida-plus.md`, sección "Forma de trabajo". Resumen:

1. ~~Estructura visual~~ ✅
2. ~~Centro de Conocimiento~~ ✅
3. ~~Reportes SGC~~ ✅
4. ~~Integración Plane en el portal (cliente API, test de conexión, sincronización)~~ ✅ — falta probar contra una instancia real cuando el usuario cargue sus credenciales
5. ~~Integración Plane en el Apps Script real (`plane-integracion-sgc.gs`)~~ ✅ — falta probar contra una instancia real; pendiente decidir si además se conecta portal ↔ Apps Script real directamente
6. Tipificación de tickets Plane
7. Gestión completa (análisis de causa, AC, verificación de eficacia)
8. Riesgos y oportunidades
9. Contexto (FODA/CAME, partes interesadas, cambio climático)
10. Procesos (mapa, fichas)
11. Objetivos e indicadores
12. Documentación (control documental, instructivos)
13. Auditorías
14. Dashboard ejecutivo
