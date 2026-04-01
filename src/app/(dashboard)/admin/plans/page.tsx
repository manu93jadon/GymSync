import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getPlansWithFeatures } from "@/services/plan.service";
import { PlanCard } from "@/components/admin/PlanCard";
import { CreatePlanDialog } from "@/components/admin/CreatePlanDialog";

export default async function AdminPlansPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  const plans = await getPlansWithFeatures();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Plans</h1>
          <p className="text-sm text-muted-foreground">
            Click any feature row to toggle it on/off for that plan.
          </p>
        </div>
        <CreatePlanDialog />
      </div>

      {plans.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No plans yet. Create your first plan to get started.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      )}
    </div>
  );
}
