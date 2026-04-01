"use client";

import { useTransition, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { createFeatureAction, deleteFeatureAction } from "@/actions/plan.actions";
import { Loader2, Plus, Trash2 } from "lucide-react";
import type { SerializedFeature } from "@/types";
import { formatDate } from "@/lib/utils";

interface FeatureManagerProps {
  features: Array<SerializedFeature & { enabledInPlans: number }>;
}

export function FeatureManager({ features }: FeatureManagerProps) {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createFeatureAction(fd);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Feature created and added to all plans");
        formRef.current?.reset();
      }
    });
  }

  function handleDelete(featureId: string, name: string) {
    if (!confirm(`Delete feature "${name}"? It will be removed from all plans.`)) return;

    startTransition(async () => {
      const result = await deleteFeatureAction(featureId);
      if (result.error) toast.error(result.error);
      else toast.success("Feature deleted");
    });
  }

  return (
    <div className="space-y-4">
      {/* Add form */}
      <Card>
        <CardContent className="pt-4">
          <form ref={formRef} onSubmit={handleCreate} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="feat-name">Feature Name</Label>
              <Input
                id="feat-name"
                name="name"
                placeholder="e.g. Personal Trainer, Floor Access, Diet Plan"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="feat-desc">Description (optional)</Label>
              <Input
                id="feat-desc"
                name="description"
                placeholder="Brief description"
              />
            </div>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin" /> : <Plus className="h-4 w-4" />}
              Add Feature
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Feature list */}
      {features.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No features defined. Add one above to get started.
        </p>
      ) : (
        <div className="space-y-2">
          {features.map((f) => (
            <div
              key={f.id}
              className="flex items-center justify-between rounded-lg border bg-card px-4 py-3"
            >
              <div>
                <p className="font-medium text-sm">{f.name}</p>
                <p className="text-xs text-muted-foreground">
                  {f.description && <span>{f.description} · </span>}
                  Enabled in {f.enabledInPlans} plan{f.enabledInPlans !== 1 ? "s" : ""} ·
                  Added {formatDate(f.createdAt)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:bg-destructive/10 shrink-0"
                onClick={() => handleDelete(f.id, f.name)}
                disabled={isPending}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
