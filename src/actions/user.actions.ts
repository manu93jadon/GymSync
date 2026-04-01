"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { assignCoach, updateUserTier, createUser } from "@/services/user.service";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Tier } from "@prisma/client";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return { error: "Unauthorized" };
  return null;
}

export async function assignCoachAction(memberId: string, coachId: string | null) {
  const err = await requireAdmin();
  if (err) return err;

  try {
    await assignCoach(memberId, coachId);
    revalidatePath("/admin/users");
    revalidatePath("/admin/members");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to assign coach" };
  }
}

export async function updateTierAction(userId: string, tier: Tier) {
  const err = await requireAdmin();
  if (err) return err;

  try {
    await updateUserTier(userId, tier);
    revalidatePath("/admin/users");
    revalidatePath("/admin/members");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to update tier" };
  }
}

const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["COACH", "MEMBER"]),
  coachId: z.string().optional(),
});

export async function createUserAction(formData: FormData) {
  const err = await requireAdmin();
  if (err) return err;

  const parsed = createUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
    coachId: formData.get("coachId") || undefined,
  });

  if (!parsed.success) return { error: parsed.error.errors[0].message };

  try {
    await createUser(parsed.data);
    revalidatePath("/admin/coaches");
    revalidatePath("/admin/members");
    revalidatePath("/admin/users");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to create user" };
  }
}
