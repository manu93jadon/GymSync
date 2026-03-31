import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getMembersForCoach } from "@/services/user.service";
import { getSessionStats } from "@/services/session.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CheckCircle, Clock, XCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function CoachDashboard() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "COACH") redirect("/login");

  const [members, stats] = await Promise.all([
    getMembersForCoach(session.user.id),
    getSessionStats(session.user.id),
  ]);

  const statCards = [
    { label: "Members", value: members.length, icon: Users, color: "text-blue-600" },
    { label: "Pending", value: stats.PENDING, icon: Clock, color: "text-yellow-600" },
    { label: "Approved", value: stats.APPROVED + stats.AUTO_APPROVED, icon: CheckCircle, color: "text-green-600" },
    { label: "Denied", value: stats.DENIED, icon: XCircle, color: "text-red-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {session.user.name}</p>
        </div>
        <Button asChild>
          <Link href="/coach/sessions/new">Mark Session</Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">My Members</h2>
        {members.length === 0 ? (
          <p className="text-muted-foreground text-sm">No members assigned yet.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((member) => (
              <Card key={member.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.email}</p>
                  </div>
                  {member._count.sessions > 0 && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                      {member._count.sessions} pending
                    </span>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
