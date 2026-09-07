"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { SEARCH_INDEX } from "@/lib/search-index";
import { cn } from "@/lib/utils";

export function GlobalSearch({ size = "sm" }: { size?: "sm" | "lg" }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return SEARCH_INDEX.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.sectionLabel?.toLowerCase().includes(q),
    ).slice(0, 8);
  }, [query]);

  const isLarge = size === "lg";

  return (
    <div ref={containerRef} className={cn("relative w-full", isLarge ? "max-w-2xl" : "max-w-xl")}>
      <div className="relative">
        <Search
          className={cn(
            "pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted",
            isLarge ? "left-4 h-5 w-5" : "left-3 h-4 w-4",
          )}
        />
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          type="text"
          placeholder="¿Qué necesitás saber?"
          className={cn(
            "w-full rounded-xl border border-border bg-white text-avenida-black placeholder:text-muted focus:border-avenida-violet focus:outline-none focus:ring-2 focus:ring-avenida-violet/20",
            isLarge ? "h-14 pl-12 pr-12 text-base shadow-sm shadow-black/[0.03]" : "h-10 pl-9 pr-9 text-sm",
          )}
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setOpen(false);
            }}
            className={cn(
              "absolute top-1/2 -translate-y-1/2 text-muted hover:text-avenida-black",
              isLarge ? "right-4" : "right-3",
            )}
            aria-label="Limpiar búsqueda"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {open && query && (
        <div
          className={cn(
            "absolute left-0 right-0 z-40 max-h-96 overflow-y-auto rounded-xl border border-border bg-white p-2 shadow-lg shadow-black/5",
            isLarge ? "top-16" : "top-12",
          )}
        >
          {results.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted">
              No encontramos resultados para &ldquo;{query}&rdquo;. Probá con otra palabra o{" "}
              <Link href="/reportar" className="text-avenida-violet hover:underline">
                reportá una situación
              </Link>
              .
            </p>
          ) : (
            results.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => {
                  setOpen(false);
                  setQuery("");
                }}
                className="flex flex-col gap-0.5 rounded-lg px-3 py-2 hover:bg-avenida-violet-light/60"
              >
                <span className="flex items-center gap-2 text-sm font-medium text-avenida-black">
                  <item.icon className="h-4 w-4 text-avenida-violet" />
                  {item.label}
                </span>
                {item.sectionLabel && (
                  <span className="pl-6 text-xs text-muted">{item.sectionLabel}</span>
                )}
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
