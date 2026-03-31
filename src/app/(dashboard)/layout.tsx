import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { SidebarWrapper } from "@/components/layout/SidebarWrapper";
import { MobileNav } from "@/components/layout/MobileNav";
import { UserMenu } from "@/components/layout/UserMenu";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-screen">
      <SidebarWrapper role={session.user.role} tier={session.user.tier} />
      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-sm">
          <div className="flex items-center justify-between px-4 py-2">
            <div className="md:hidden font-bold text-lg">GymSync</div>
            <div className="ml-auto">
              <UserMenu
                name={session.user.name ?? "User"}
                email={session.user.email ?? ""}
                role={session.user.role}
              />
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">{children}</main>
      </div>
      <MobileNav role={session.user.role} tier={session.user.tier} />
    </div>
  );
}
