"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import type { Role, Tier } from "@prisma/client";

interface SidebarWrapperProps {
  role: Role;
  tier: Tier;
}

export function SidebarWrapper({ role, tier }: SidebarWrapperProps) {
  const pathname = usePathname();
  return <Sidebar role={role} tier={tier} currentPath={pathname} />;
}
