import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type Crumb = {
  label: string;
  href?: string;
};

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={`${item.label}-${index}`} className="flex items-center gap-1.5">
            {item.href && !isLast ? (
              <Link href={item.href} className="hover:text-avenida-violet">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "font-medium text-avenida-black" : ""}>{item.label}</span>
            )}
            {!isLast && <ChevronRight className="h-3.5 w-3.5 text-border" />}
          </span>
        );
      })}
    </nav>
  );
}
