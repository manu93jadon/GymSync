import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, User, Dumbbell } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  const [userCounts, sessionCounts] = await Promise.all([
    prisma.user.groupBy({ by: ["role"], _count: true }),
    prisma.session.groupBy({ by: ["status"], _count: true }),
  ]);

  const countMap = Object.fromEntries(userCounts.map((u) => [u.role, u._count]));
  const sessionMap = Object.fromEntries(sessionCounts.map((s) => [s.status, s._count]));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Overview</h1>
          <p className="text-muted-foreground">Manage your gym</p>
        </div>
        <Button asChild>
          <Link href="/admin/users">Manage Users</Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Members</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{countMap.MEMBER ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Coaches</CardTitle>
              <User className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{countMap.COACH ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Sessions</CardTitle>
              <Dumbbell className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {Object.values(sessionMap).reduce((a, b) => a + b, 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Session Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {(["PENDING", "APPROVED", "DENIED", "AUTO_APPROVED"] as const).map((status) => (
              <div key={status} className="text-center">
                <p className="text-2xl font-bold">{sessionMap[status] ?? 0}</p>
                <p className="text-muted-foreground capitalize">{status.toLowerCase().replace("_", " ")}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
