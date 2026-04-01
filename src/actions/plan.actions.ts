"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import {
  createFeature,
  deleteFeature,
  createPlan,
  updatePlan,
  togglePlanStatus,
  togglePlanFeature,
  assignPlanToMember,
  recordPayment,
} from "@/services/plan.service";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { PaymentMethod } from "@prisma/client";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") throw new Error("Unauthorized");
  return session;
}

// ─── Features ────────────────────────────────────────────────────────────────

export async function createFeatureAction(formData: FormData) {
  await requireAdmin();
  const name = formData.get("name") as string;
  const description = (formData.get("description") as string) || undefined;

  if (!name?.trim()) return { error: "Feature name is required" };

  try {
    await createFeature(name.trim(), description?.trim());
    revalidatePath("/admin/features");
    revalidatePath("/admin/plans");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to create feature" };
  }
}

export async function deleteFeatureAction(featureId: string) {
  await requireAdmin();
  try {
    await deleteFeature(featureId);
    revalidatePath("/admin/features");
    revalidatePath("/admin/plans");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to delete feature" };
  }
}

// ─── Plans ───────────────────────────────────────────────────────────────────

const planSchema = z.object({
  name: z.string().min(1),
  price: z.coerce.number().positive(),
  durationDays: z.coerce.number().int().positive(),
  description: z.string().optional(),
});

export async function createPlanAction(formData: FormData) {
  await requireAdmin();

  const parsed = planSchema.safeParse({
    name: formData.get("name"),
    price: formData.get("price"),
    durationDays: formData.get("durationDays"),
    description: formData.get("description") || undefined,
  });

  if (!parsed.success) return { error: "Invalid plan data" };

  try {
    await createPlan(parsed.data);
    revalidatePath("/admin/plans");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to create plan" };
  }
}

export async function updatePlanAction(planId: string, formData: FormData) {
  await requireAdmin();

  const parsed = planSchema.partial().safeParse({
    name: formData.get("name") || undefined,
    price: formData.get("price") || undefined,
    durationDays: formData.get("durationDays") || undefined,
    description: formData.get("description") || undefined,
  });

  if (!parsed.success) return { error: "Invalid plan data" };

  try {
    await updatePlan(planId, parsed.data);
    revalidatePath("/admin/plans");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to update plan" };
  }
}

export async function togglePlanStatusAction(planId: string, isActive: boolean) {
  await requireAdmin();
  try {
    await togglePlanStatus(planId, isActive);
    revalidatePath("/admin/plans");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to update plan" };
  }
}

export async function togglePlanFeatureAction(planFeatureId: string, enabled: boolean) {
  await requireAdmin();
  try {
    await togglePlanFeature(planFeatureId, enabled);
    revalidatePath("/admin/plans");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to toggle feature" };
  }
}

// ─── Member Plans ─────────────────────────────────────────────────────────────

const assignPlanSchema = z.object({
  memberId: z.string().min(1),
  planId: z.string().min(1),
  discountPct: z.coerce.number().min(0).max(100).default(0),
  sessionsLeft: z.coerce.number().int().min(0),
  startDate: z.string().optional(),
});

export async function assignPlanAction(formData: FormData) {
  await requireAdmin();

  const parsed = assignPlanSchema.safeParse({
    memberId: formData.get("memberId"),
    planId: formData.get("planId"),
    discountPct: formData.get("discountPct") || "0",
    sessionsLeft: formData.get("sessionsLeft"),
    startDate: formData.get("startDate") || undefined,
  });

  if (!parsed.success) return { error: "Invalid data" };

  try {
    await assignPlanToMember({
      ...parsed.data,
      startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : undefined,
    });
    revalidatePath(`/admin/members/${parsed.data.memberId}`);
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to assign plan" };
  }
}

// ─── Payments ────────────────────────────────────────────────────────────────

const paymentSchema = z.object({
  memberPlanId: z.string().min(1),
  amount: z.coerce.number().positive(),
  discountPct: z.coerce.number().min(0).max(100).default(0),
  method: z.enum(["CASH", "UPI", "CARD"]),
  notes: z.string().optional(),
  memberId: z.string().min(1),
});

export async function recordPaymentAction(formData: FormData) {
  await requireAdmin();

  const parsed = paymentSchema.safeParse({
    memberPlanId: formData.get("memberPlanId"),
    amount: formData.get("amount"),
    discountPct: formData.get("discountPct") || "0",
    method: formData.get("method"),
    notes: formData.get("notes") || undefined,
    memberId: formData.get("memberId"),
  });

  if (!parsed.success) return { error: "Invalid payment data" };

  try {
    await recordPayment({
      memberPlanId: parsed.data.memberPlanId,
      amount: parsed.data.amount,
      discountPct: parsed.data.discountPct,
      method: parsed.data.method as PaymentMethod,
      notes: parsed.data.notes,
    });
    revalidatePath(`/admin/members/${parsed.data.memberId}`);
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to record payment" };
  }
}
