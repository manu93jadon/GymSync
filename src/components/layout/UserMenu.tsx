"use client";

import { signOut } from "next-auth/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getInitials } from "@/lib/utils";
import { LogOut, User } from "lucide-react";
import type { Role } from "@prisma/client";

interface UserMenuProps {
  name: string;
  email: string;
  role: Role;
}

const ROLE_COLORS: Record<Role, string> = {
  ADMIN: "bg-red-100 text-red-800",
  COACH: "bg-blue-100 text-blue-800",
  MEMBER: "bg-green-100 text-green-800",
};

export function UserMenu({ name, email, role }: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-accent transition-colors outline-none">
          <Avatar className="h-8 w-8">
            <AvatarFallback className={ROLE_COLORS[role]}>
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:block text-sm font-medium">{name}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <p className="text-sm font-medium">{name}</p>
          <p className="text-xs text-muted-foreground">{email}</p>
          <span className={`mt-1 inline-block text-xs px-1.5 py-0.5 rounded ${ROLE_COLORS[role]}`}>
            {role}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
