"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { assignPlanAction } from "@/actions/plan.actions";
import { Loader2, CreditCard } from "lucide-react";
import type { SerializedPlan } from "@/types";

interface AssignPlanDialogProps {
  memberId: string;
  plans: SerializedPlan[];
  currentPlanId?: string;
}

export function AssignPlanDialog({ memberId, plans, currentPlanId }: AssignPlanDialogProps) {
  const [open, setOpen] = useState(false);
  const [planId, setPlanId] = useState(currentPlanId ?? "");
  const [isPending, startTransition] = useTransition();

  const selectedPlan = plans.find((p) => p.id === planId);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("memberId", memberId);
    fd.set("planId", planId);

    startTransition(async () => {
      const result = await assignPlanAction(fd);
      if (result.error) toast.error(result.error);
      else {
        toast.success("Plan assigned successfully");
        setOpen(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <CreditCard className="h-4 w-4" />
          {currentPlanId ? "Change Plan" : "Assign Plan"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Assign Membership Plan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Plan</Label>
              <Select value={planId} onValueChange={setPlanId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} — ₹{p.price} / {p.durationDays}d
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedPlan && (
                <p className="text-xs text-muted-foreground">
                  Duration: {selectedPlan.durationDays} days · Price: ₹{selectedPlan.price}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="discount">Discount %</Label>
              <Input
                id="discount"
                name="discountPct"
                type="number"
                min="0"
                max="100"
                step="0.01"
                defaultValue="0"
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sessions">Sessions Included</Label>
              <Input
                id="sessions"
                name="sessionsLeft"
                type="number"
                min="0"
                step="1"
                placeholder="e.g. 20"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                defaultValue={new Date().toISOString().slice(0, 10)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending || !planId}>
              {isPending && <Loader2 className="animate-spin" />}
              Assign Plan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
