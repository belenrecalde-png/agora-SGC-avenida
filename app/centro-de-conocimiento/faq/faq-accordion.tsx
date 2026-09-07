"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { FAQ_ITEMS } from "@/lib/faq-data";

function getInitialOpenId(): string | null {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash.replace("#", "");
  return hash && FAQ_ITEMS.some((item) => item.id === hash) ? hash : null;
}

export function FaqAccordion() {
  const [openId, setOpenId] = useState<string | null>(getInitialOpenId);

  useEffect(() => {
    if (!openId) return;
    document.getElementById(openId)?.scrollIntoView({ block: "center", behavior: "smooth" });
    // Solo al montar: sigue la posición inicial del hash, no cada cambio manual de acordeón.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col gap-3">
      {FAQ_ITEMS.map((item) => {
        const isOpen = openId === item.id;
        return (
          <Card key={item.id} id={item.id} className="overflow-hidden p-0">
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : item.id)}
              className="flex w-full items-center justify-between gap-3 p-4 text-left"
            >
              <span className="text-sm font-medium text-avenida-black">{item.question}</span>
              <ChevronDown
                className={cn("h-4 w-4 shrink-0 text-muted transition-transform", isOpen && "rotate-180")}
              />
            </button>
            {isOpen && (
              <div className="border-t border-border px-4 py-3">
                <p className="text-sm text-muted">{item.answer}</p>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
