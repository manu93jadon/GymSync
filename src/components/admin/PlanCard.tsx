"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { togglePlanStatusAction, togglePlanFeatureAction } from "@/actions/plan.actions";
import type { SerializedPlan } from "@/types";
import { Check, X, IndianRupee, Calendar } from "lucide-react";

interface PlanCardProps {
  plan: SerializedPlan;
}

export function PlanCard({ plan }: PlanCardProps) {
  const [isPending, startTransition] = useTransition();

  function handleToggleStatus() {
    startTransition(async () => {
      const result = await togglePlanStatusAction(plan.id, !plan.isActive);
      if (result.error) toast.error(result.error);
    });
  }

  function handleToggleFeature(planFeatureId: string, current: boolean) {
    startTransition(async () => {
      const result = await togglePlanFeatureAction(planFeatureId, !current);
      if (result.error) toast.error(result.error);
    });
  }

  return (
    <Card className={plan.isActive ? "" : "opacity-60"}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">{plan.name}</CardTitle>
            {plan.description && (
              <p className="text-xs text-muted-foreground mt-0.5">{plan.description}</p>
            )}
          </div>
          <Badge variant={plan.isActive ? "default" : "secondary"}>
            {plan.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
        <div className="flex items-center gap-4 text-sm mt-1">
          <span className="flex items-center gap-1 font-semibold">
            <IndianRupee className="h-3.5 w-3.5" />
            {plan.price.toLocaleString("en-IN")}
          </span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            {plan.durationDays} days
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {plan.planFeatures.length === 0 ? (
          <p className="text-xs text-muted-foreground">No features defined yet.</p>
        ) : (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Features</p>
            {plan.planFeatures.map((pf) => (
              <button
                key={pf.id}
                onClick={() => handleToggleFeature(pf.id, pf.enabled)}
                disabled={isPending}
                className="flex items-center justify-between w-full rounded px-2 py-1.5 text-sm hover:bg-muted transition-colors"
              >
                <span>{pf.feature.name}</span>
                {pf.enabled ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <X className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            ))}
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={handleToggleStatus}
          disabled={isPending}
        >
          {plan.isActive ? "Deactivate Plan" : "Activate Plan"}
        </Button>
      </CardContent>
    </Card>
  );
}
