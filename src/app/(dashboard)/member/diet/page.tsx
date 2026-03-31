import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { canAccessFeature } from "@/services/gate.service";
import { GoldPlanGate } from "@/components/gates/GoldPlanGate";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Salad } from "lucide-react";

export default async function DietPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "MEMBER") redirect("/login");

  const hasAccess = canAccessFeature(session.user.tier, "DIET_CHART");

  let dietChart: string | null = null;
  if (hasAccess) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { dietChart: true },
    });
    dietChart = user?.dietChart ?? null;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Diet Chart</h1>
      <GoldPlanGate hasAccess={hasAccess} featureName="Diet Chart">
        {dietChart ? (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Salad className="h-5 w-5 text-green-600" />
                <CardTitle className="text-base">Your Diet Plan</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm">
                {dietChart}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              Your diet chart hasn&apos;t been uploaded yet. Ask your admin.
            </CardContent>
          </Card>
        )}
      </GoldPlanGate>
    </div>
  );
}
