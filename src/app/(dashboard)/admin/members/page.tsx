import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAllMembers, getAllCoaches } from "@/services/user.service";
import { AddUserDialog } from "@/components/admin/AddUserDialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

export default async function AdminMembersPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  const [members, coaches] = await Promise.all([getAllMembers(), getAllCoaches()]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Members</h1>
          <p className="text-sm text-muted-foreground">{members.length} total members</p>
        </div>
        <AddUserDialog role="MEMBER" coaches={coaches} />
      </div>

      {members.length === 0 ? (
        <p className="text-muted-foreground text-sm">No members yet.</p>
      ) : (
        <div className="space-y-2">
          {members.map((member) => {
            const activePlan = member.memberPlans[0] ?? null;
            return (
              <Card key={member.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium">{member.name}</p>
                        <Badge
                          variant={member.tier === "GOLD" ? "default" : "outline"}
                          className={
                            member.tier === "GOLD"
                              ? "bg-yellow-400 text-yellow-900 hover:bg-yellow-400 text-xs"
                              : "text-xs"
                          }
                        >
                          {member.tier}
                        </Badge>
                        {!activePlan && (
                          <span className="flex items-center gap-1 text-xs text-destructive">
                            <AlertCircle className="h-3 w-3" />
                            No plan
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground flex-wrap">
                        <span>Coach: {member.coach?.name ?? "Unassigned"}</span>
                        {activePlan && (
                          <>
                            <span>{activePlan.plan.name}</span>
                            <span>{activePlan.sessionsLeft} sessions left</span>
                            <span>Expires {formatDate(activePlan.endDate)}</span>
                          </>
                        )}
                        <span>Joined {formatDate(member.createdAt)}</span>
                      </div>
                    </div>
                    <Button asChild variant="outline" size="sm" className="shrink-0">
                      <Link href={`/admin/members/${member.id}`}>View Profile</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
