import {
  Home,
  User,
  Flag,
  ListChecks,
  Ticket,
  AlertTriangle,
  Wrench,
  ShieldAlert,
  Lightbulb,
  MessageSquareWarning,
  MessageSquare,
  FileWarning,
  Target,
  AlertOctagon,
  Compass,
  Users,
  Award,
  Network,
  Map,
  FileText,
  Gauge,
  LineChart,
  ShieldCheck,
  ThumbsUp,
  TrendingUp,
  FolderOpen,
  BookOpen,
  FileStack,
  ExternalLink,
  GraduationCap,
  Layers,
  Sparkles,
  GitCompare,
  HelpCircle,
  Settings,
  Building2,
  Workflow,
  Tag,
  CircleDot,
  UserCog,
  KeyRound,
  Plug,
  ScrollText,
  Boxes,
  type LucideIcon,
} from "lucide-react";

import navData from "./nav-data.json";

const ICONS: Record<string, LucideIcon> = {
  Home,
  User,
  Flag,
  ListChecks,
  Ticket,
  AlertTriangle,
  Wrench,
  ShieldAlert,
  Lightbulb,
  MessageSquareWarning,
  MessageSquare,
  FileWarning,
  Target,
  AlertOctagon,
  Compass,
  Users,
  Award,
  Network,
  Map,
  FileText,
  Gauge,
  LineChart,
  ShieldCheck,
  ThumbsUp,
  TrendingUp,
  FolderOpen,
  BookOpen,
  FileStack,
  ExternalLink,
  GraduationCap,
  Layers,
  Sparkles,
  GitCompare,
  HelpCircle,
  Settings,
  Building2,
  Workflow,
  Tag,
  CircleDot,
  UserCog,
  KeyRound,
  Plug,
  ScrollText,
  Boxes,
};

export type NavItem = {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  phase?: string;
  description?: string;
  highlight?: boolean;
};

export type NavSection = {
  id: string;
  label: string;
  icon: LucideIcon;
  items: NavItem[];
};

function resolveIcon(name: string): LucideIcon {
  return ICONS[name] ?? Home;
}

type RawItem = {
  id: string;
  label: string;
  href: string;
  icon: string;
  phase?: string;
  description?: string;
  highlight?: boolean;
};

type RawSection = {
  id: string;
  label: string;
  icon: string;
  items: RawItem[];
};

const raw = navData as {
  top: RawItem[];
  sections: RawSection[];
};

export const NAV_TOP: NavItem[] = raw.top.map((item) => ({
  ...item,
  icon: resolveIcon(item.icon),
}));

export const NAV_SECTIONS: NavSection[] = raw.sections.map((section) => ({
  id: section.id,
  label: section.label,
  icon: resolveIcon(section.icon),
  items: section.items.map((item) => ({
    ...item,
    icon: resolveIcon(item.icon),
  })),
}));

/** Todas las rutas de navegación, aplanadas, útil para breadcrumbs y buscador. */
export const ALL_NAV_ITEMS: (NavItem & { sectionLabel?: string })[] = [
  ...NAV_TOP,
  ...NAV_SECTIONS.flatMap((section) =>
    section.items.map((item) => ({ ...item, sectionLabel: section.label })),
  ),
];

export function findNavItemByHref(href: string) {
  return ALL_NAV_ITEMS.find((item) => item.href === href);
}

export function findSectionByHref(href: string) {
  return NAV_SECTIONS.find((section) =>
    section.items.some((item) => item.href === href),
  );
}
