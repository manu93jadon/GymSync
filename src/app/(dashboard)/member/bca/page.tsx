import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { canAccessFeature } from "@/services/gate.service";
import { GoldPlanGate } from "@/components/gates/GoldPlanGate";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { BcaEntry } from "@/types";
import { Activity } from "lucide-react";

export default async function BcaPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "MEMBER") redirect("/login");

  const hasAccess = canAccessFeature(session.user.tier, "BCA_RESULTS");

  let bcaResults: BcaEntry[] = [];
  if (hasAccess) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { bcaResults: true },
    });
    bcaResults = (user?.bcaResults as BcaEntry[]) ?? [];
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">BCA Results</h1>
      <p className="text-sm text-muted-foreground">Body Composition Analysis history</p>
      <GoldPlanGate hasAccess={hasAccess} featureName="BCA Results">
        {bcaResults.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No BCA results recorded yet. Your coach or admin will add them.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {bcaResults.map((entry, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-blue-600" />
                    <CardTitle className="text-sm font-medium">
                      {formatDate(entry.date)}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">Body Fat</p>
                      <p className="font-semibold">{entry.bodyFatPercent}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Muscle Mass</p>
                      <p className="font-semibold">{entry.muscleMassKg} kg</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Weight</p>
                      <p className="font-semibold">{entry.weightKg} kg</p>
                    </div>
                  </div>
                  {entry.notes && (
                    <p className="mt-2 text-xs text-muted-foreground italic">{entry.notes}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </GoldPlanGate>
    </div>
  );
}
