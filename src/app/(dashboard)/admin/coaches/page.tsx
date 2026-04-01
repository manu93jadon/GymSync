import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getCoachMemberTree } from "@/services/user.service";
import { CoachMemberTree } from "@/components/admin/CoachMemberTree";
import { AddUserDialog } from "@/components/admin/AddUserDialog";

export default async function AdminCoachesPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  const coaches = await getCoachMemberTree();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Coaches</h1>
          <p className="text-sm text-muted-foreground">
            {coaches.length} coach{coaches.length !== 1 ? "es" : ""}
            {" · "}
            {coaches.reduce((sum, c) => sum + c.members.length, 0)} members assigned
          </p>
        </div>
        <AddUserDialog role="COACH" />
      </div>

      <CoachMemberTree coaches={coaches} />
    </div>
  );
}
