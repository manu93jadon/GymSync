"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createPlanAction } from "@/actions/plan.actions";
import { Loader2, Plus } from "lucide-react";

export function CreatePlanDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createPlanAction(fd);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Plan created");
        setOpen(false);
        (e.target as HTMLFormElement).reset();
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4" />
          Create Plan
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Membership Plan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="plan-name">Plan Name</Label>
              <Input id="plan-name" name="name" placeholder="e.g. Gold Monthly" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="plan-price">Price (₹)</Label>
                <Input id="plan-price" name="price" type="number" min="0" step="0.01" placeholder="2999" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan-days">Duration (days)</Label>
                <Input id="plan-days" name="durationDays" type="number" min="1" placeholder="30" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan-desc">Description (optional)</Label>
              <Textarea id="plan-desc" name="description" placeholder="Brief description of the plan" rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="animate-spin" />}
              Create Plan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
