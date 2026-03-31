"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Role, Tier } from "@prisma/client";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  ClipboardList,
  Salad,
  Activity,
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
      { href: "/admin/users", label: "Users", icon: Users },
    ];
  }
  if (role === "COACH") {
    return [
      { href: "/coach", label: "Dashboard", icon: LayoutDashboard },
      { href: "/coach/sessions", label: "Sessions", icon: CalendarCheck },
      { href: "/coach/sessions/new", label: "Mark", icon: ClipboardList },
    ];
  }
  const items: NavItem[] = [
    { href: "/member", label: "Home", icon: LayoutDashboard },
    { href: "/member/sessions", label: "Sessions", icon: CalendarCheck },
  ];
  if (tier === "GOLD") {
    items.push({ href: "/member/diet", label: "Diet", icon: Salad });
    items.push({ href: "/member/bca", label: "BCA", icon: Activity });
  }
  return items;
}

interface MobileNavProps {
  role: Role;
  tier: Tier;
}

export function MobileNav({ role, tier }: MobileNavProps) {
  const pathname = usePathname();
  const items = getNavItems(role, tier);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background">
      <div className="flex items-center justify-around">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition-colors",
              pathname === item.href
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
