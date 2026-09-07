/**
 * Tipos mínimos para el módulo experimental `node:sqlite` (disponible en Node 22.5+
 * sin flags, ver https://nodejs.org/api/sqlite.html). @types/node en esta versión
 * del proyecto todavía no lo incluye, así que se declara acá lo que se usa.
 */
declare module "node:sqlite" {
  export interface StatementResultingChanges {
    changes: number | bigint;
    lastInsertRowid: number | bigint;
  }

  export class StatementSync {
    run(...params: unknown[]): StatementResultingChanges;
    get(...params: unknown[]): Record<string, unknown> | undefined;
    all(...params: unknown[]): Record<string, unknown>[];
  }

  export class DatabaseSync {
    constructor(path: string, options?: { open?: boolean });
    exec(sql: string): void;
    prepare(sql: string): StatementSync;
    close(): void;
  }
}
