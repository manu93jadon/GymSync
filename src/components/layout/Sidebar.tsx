import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Role, Tier } from "@prisma/client";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  ClipboardList,
  Dumbbell,
  Salad,
  Activity,
  UserCheck,
  CreditCard,
  ListChecks,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

function getNavItems(role: Role, tier: Tier): NavItem[] {
  if (role === "ADMIN") {
    return [
      { href: "/admin", label: "Overview", icon: LayoutDashboard },
      { href: "/admin/coaches", label: "Coaches", icon: UserCheck },
      { href: "/admin/members", label: "Members", icon: Users },
      { href: "/admin/plans", label: "Plans", icon: CreditCard },
      { href: "/admin/features", label: "Features", icon: ListChecks },
    ];
  }
  if (role === "COACH") {
    return [
      { href: "/coach", label: "Dashboard", icon: LayoutDashboard },
      { href: "/coach/sessions", label: "Sessions", icon: CalendarCheck },
      { href: "/coach/sessions/new", label: "Mark Session", icon: ClipboardList },
    ];
  }
  // MEMBER
  const items: NavItem[] = [
    { href: "/member", label: "Dashboard", icon: LayoutDashboard },
    { href: "/member/sessions", label: "My Sessions", icon: CalendarCheck },
  ];
  if (tier === "GOLD") {
    items.push({ href: "/member/diet", label: "Diet Chart", icon: Salad });
    items.push({ href: "/member/bca", label: "BCA Results", icon: Activity });
  }
  return items;
}

interface SidebarProps {
  role: Role;
  tier: Tier;
  currentPath: string;
}

export function Sidebar({ role, tier, currentPath }: SidebarProps) {
  const items = getNavItems(role, tier);

  return (
    <aside className="hidden md:flex flex-col w-60 border-r bg-card min-h-screen px-3 py-4">
      <div className="flex items-center gap-2 px-2 mb-8">
        <Dumbbell className="h-6 w-6 text-primary" />
        <span className="font-bold text-lg">GymSync</span>
      </div>
      <nav className="flex flex-col gap-1">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              currentPath === item.href
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
