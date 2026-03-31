import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAllUsers, getAllCoaches } from "@/services/user.service";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { UserActionsCell } from "./UserActionsCell";

export default async function UsersPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  const [users, coaches] = await Promise.all([getAllUsers(), getAllCoaches()]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">User Management</h1>
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Coach</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{user.email}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      user.role === "ADMIN"
                        ? "destructive"
                        : user.role === "COACH"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.role === "MEMBER" && (
                    <Badge
                      className={
                        user.tier === "GOLD"
                          ? "bg-yellow-400 text-yellow-900 hover:bg-yellow-400"
                          : ""
                      }
                      variant={user.tier === "GOLD" ? "default" : "outline"}
                    >
                      {user.tier}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {user.coach?.name ?? "—"}
                </TableCell>
                <TableCell className="text-right">
                  {user.role === "MEMBER" && (
                    <UserActionsCell
                      userId={user.id}
                      currentTier={user.tier}
                      currentCoachId={user.coach?.id ?? null}
                      coaches={coaches}
                    />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
