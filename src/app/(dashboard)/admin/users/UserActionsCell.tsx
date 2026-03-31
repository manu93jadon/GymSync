"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { assignCoachAction, updateTierAction } from "@/actions/user.actions";
import type { Tier } from "@prisma/client";

interface Coach {
  id: string;
  name: string;
}

interface UserActionsCellProps {
  userId: string;
  currentTier: Tier;
  currentCoachId: string | null;
  coaches: Coach[];
}

export function UserActionsCell({
  userId,
  currentTier,
  currentCoachId,
  coaches,
}: UserActionsCellProps) {
  const [isPending, startTransition] = useTransition();

  function handleTierChange(tier: string) {
    startTransition(async () => {
      const result = await updateTierAction(userId, tier as Tier);
      if (result.error) toast.error(result.error);
      else toast.success("Tier updated");
    });
  }

  function handleCoachChange(coachId: string) {
    startTransition(async () => {
      const result = await assignCoachAction(userId, coachId === "none" ? null : coachId);
      if (result.error) toast.error(result.error);
      else toast.success("Coach assigned");
    });
  }

  return (
    <div className="flex items-center gap-2 justify-end">
      <Select
        defaultValue={currentTier}
        onValueChange={handleTierChange}
        disabled={isPending}
      >
        <SelectTrigger className="w-24 h-7 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="BASIC">Basic</SelectItem>
          <SelectItem value="GOLD">Gold</SelectItem>
        </SelectContent>
      </Select>

      <Select
        defaultValue={currentCoachId ?? "none"}
        onValueChange={handleCoachChange}
        disabled={isPending}
      >
        <SelectTrigger className="w-36 h-7 text-xs">
          <SelectValue placeholder="Assign coach" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">No coach</SelectItem>
          {coaches.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
