"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { assignCoach, updateUserTier } from "@/services/user.service";
import { revalidatePath } from "next/cache";
import type { Tier } from "@prisma/client";

export async function assignCoachAction(memberId: string, coachId: string | null) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  try {
    await assignCoach(memberId, coachId);
    revalidatePath("/admin/users");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to assign coach" };
  }
}

export async function updateTierAction(userId: string, tier: Tier) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  try {
    await updateUserTier(userId, tier);
    revalidatePath("/admin/users");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to update tier" };
  }
}
