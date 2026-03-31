import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getSessionsForMember } from "@/services/session.service";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarCheck, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function MemberDashboard() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "MEMBER") redirect("/login");

  const [sessions, user] = await Promise.all([
    getSessionsForMember(session.user.id),
    prisma.user.findUnique({
      where: { id: session.user.id },
      include: { coach: { select: { name: true, email: true } } },
    }),
  ]);

  const pending = sessions.filter((s) => s.status === "PENDING").length;
  const completed = sessions.filter((s) =>
    ["APPROVED", "AUTO_APPROVED"].includes(s.status)
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {session.user.name}</p>
      </div>

      {session.user.tier === "GOLD" && (
        <Badge className="bg-yellow-400 text-yellow-900 hover:bg-yellow-400">
          Gold Member
        </Badge>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{completed}</p>
          </CardContent>
        </Card>
      </div>

      {user?.coach && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">My Coach</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{user.coach.name}</p>
            <p className="text-sm text-muted-foreground">{user.coach.email}</p>
          </CardContent>
        </Card>
      )}

      {pending > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-yellow-600" />
              <span className="text-sm font-medium">
                You have {pending} session{pending > 1 ? "s" : ""} awaiting acknowledgement
              </span>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href="/member/sessions">Review</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
