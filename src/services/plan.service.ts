import { prisma } from "@/lib/prisma";
import type { PaymentMethod } from "@prisma/client";
import type {
  SerializedFeature,
  SerializedPlan,
  SerializedMemberPlan,
} from "@/types";

function serializePlan(plan: {
  id: string;
  name: string;
  description: string | null;
  price: { toNumber(): number };
  durationDays: number;
  isActive: boolean;
  createdAt: Date;
  planFeatures: Array<{
    id: string;
    featureId: string;
    enabled: boolean;
    feature: { id: string; name: string; description: string | null };
  }>;
}): SerializedPlan {
  return {
    ...plan,
    price: plan.price.toNumber(),
    createdAt: plan.createdAt.toISOString(),
  };
}

// ─── Features ────────────────────────────────────────────────────────────────

export async function createFeature(name: string, description?: string): Promise<SerializedFeature> {
  const feature = await prisma.$transaction(async (tx) => {
    const feat = await tx.feature.create({ data: { name, description } });
    const allPlans = await tx.plan.findMany({ select: { id: true } });
    if (allPlans.length > 0) {
      await tx.planFeature.createMany({
        data: allPlans.map((p) => ({ planId: p.id, featureId: feat.id, enabled: false })),
      });
    }
    return feat;
  });

  return { ...feature, createdAt: feature.createdAt.toISOString() };
}

export async function deleteFeature(featureId: string): Promise<void> {
  await prisma.feature.delete({ where: { id: featureId } });
}

export async function getAllFeatures(): Promise<
  Array<SerializedFeature & { enabledInPlans: number }>
> {
  const features = await prisma.feature.findMany({
    include: {
      _count: { select: { planFeatures: { where: { enabled: true } } } },
    },
    orderBy: { name: "asc" },
  });

  return features.map((f) => ({
    id: f.id,
    name: f.name,
    description: f.description,
    createdAt: f.createdAt.toISOString(),
    enabledInPlans: f._count.planFeatures,
  }));
}

// ─── Plans ───────────────────────────────────────────────────────────────────

export async function createPlan(data: {
  name: string;
  price: number;
  durationDays: number;
  description?: string;
}): Promise<SerializedPlan> {
  const plan = await prisma.$transaction(async (tx) => {
    const p = await tx.plan.create({
      data: {
        name: data.name,
        price: data.price,
        durationDays: data.durationDays,
        description: data.description,
      },
    });
    const allFeatures = await tx.feature.findMany({ select: { id: true } });
    if (allFeatures.length > 0) {
      await tx.planFeature.createMany({
        data: allFeatures.map((f) => ({ planId: p.id, featureId: f.id, enabled: false })),
      });
    }
    return tx.plan.findUniqueOrThrow({
      where: { id: p.id },
      include: { planFeatures: { include: { feature: true } } },
    });
  });

  return serializePlan(plan);
}

export async function updatePlan(
  planId: string,
  data: Partial<{ name: string; price: number; durationDays: number; description: string }>
): Promise<SerializedPlan> {
  const plan = await prisma.plan.update({
    where: { id: planId },
    data,
    include: { planFeatures: { include: { feature: true } } },
  });
  return serializePlan(plan);
}

export async function togglePlanStatus(planId: string, isActive: boolean): Promise<void> {
  await prisma.plan.update({ where: { id: planId }, data: { isActive } });
}

export async function togglePlanFeature(planFeatureId: string, enabled: boolean): Promise<void> {
  await prisma.planFeature.update({ where: { id: planFeatureId }, data: { enabled } });
}

export async function getPlansWithFeatures(activeOnly = false): Promise<SerializedPlan[]> {
  const plans = await prisma.plan.findMany({
    where: activeOnly ? { isActive: true } : undefined,
    include: { planFeatures: { include: { feature: true }, orderBy: { feature: { name: "asc" } } } },
    orderBy: { createdAt: "asc" },
  });
  return plans.map(serializePlan);
}

// ─── Member Plans ─────────────────────────────────────────────────────────────

export async function assignPlanToMember(data: {
  memberId: string;
  planId: string;
  discountPct?: number;
  startDate?: Date;
  sessionsLeft: number;
}): Promise<void> {
  const [member, plan] = await Promise.all([
    prisma.user.findUnique({ where: { id: data.memberId, role: "MEMBER" } }),
    prisma.plan.findUnique({ where: { id: data.planId, isActive: true } }),
  ]);

  if (!member) throw new Error("Member not found");
  if (!plan) throw new Error("Plan not found or inactive");

  const startDate = data.startDate ?? new Date();
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + plan.durationDays);

  // Deactivate any existing active plan
  await prisma.memberPlan.updateMany({
    where: { memberId: data.memberId, isActive: true },
    data: { isActive: false },
  });

  await prisma.memberPlan.create({
    data: {
      memberId: data.memberId,
      planId: data.planId,
      discountPct: data.discountPct ?? 0,
      startDate,
      endDate,
      sessionsLeft: data.sessionsLeft,
      isActive: true,
    },
  });
}

export async function getActiveMemberPlan(memberId: string): Promise<SerializedMemberPlan | null> {
  const mp = await prisma.memberPlan.findFirst({
    where: { memberId, isActive: true },
    include: {
      plan: { include: { planFeatures: { include: { feature: true } } } },
      payments: { orderBy: { paidAt: "desc" } },
    },
  });

  if (!mp) return null;

  return {
    id: mp.id,
    discountPct: mp.discountPct.toNumber(),
    startDate: mp.startDate.toISOString(),
    endDate: mp.endDate.toISOString(),
    sessionsLeft: mp.sessionsLeft,
    isActive: mp.isActive,
    plan: serializePlan(mp.plan),
    payments: mp.payments.map((p) => ({
      id: p.id,
      amount: p.amount.toNumber(),
      discountPct: p.discountPct.toNumber(),
      finalAmount: p.finalAmount.toNumber(),
      method: p.method,
      notes: p.notes,
      paidAt: p.paidAt.toISOString(),
    })),
  };
}

export async function getMemberPlanHistory(memberId: string): Promise<SerializedMemberPlan[]> {
  const plans = await prisma.memberPlan.findMany({
    where: { memberId },
    include: {
      plan: { include: { planFeatures: { include: { feature: true } } } },
      payments: { orderBy: { paidAt: "desc" } },
    },
    orderBy: { startDate: "desc" },
  });

  return plans.map((mp) => ({
    id: mp.id,
    discountPct: mp.discountPct.toNumber(),
    startDate: mp.startDate.toISOString(),
    endDate: mp.endDate.toISOString(),
    sessionsLeft: mp.sessionsLeft,
    isActive: mp.isActive,
    plan: serializePlan(mp.plan),
    payments: mp.payments.map((p) => ({
      id: p.id,
      amount: p.amount.toNumber(),
      discountPct: p.discountPct.toNumber(),
      finalAmount: p.finalAmount.toNumber(),
      method: p.method,
      notes: p.notes,
      paidAt: p.paidAt.toISOString(),
    })),
  }));
}

export async function decrementSessionsLeft(memberId: string): Promise<void> {
  const activePlan = await prisma.memberPlan.findFirst({
    where: { memberId, isActive: true, sessionsLeft: { gt: 0 } },
  });
  if (!activePlan) return;
  await prisma.memberPlan.update({
    where: { id: activePlan.id },
    data: { sessionsLeft: { decrement: 1 } },
  });
}

// ─── Payments ────────────────────────────────────────────────────────────────

export async function recordPayment(data: {
  memberPlanId: string;
  amount: number;
  discountPct: number;
  method: PaymentMethod;
  notes?: string;
}): Promise<void> {
  const finalAmount = data.amount * (1 - data.discountPct / 100);
  await prisma.payment.create({
    data: {
      memberPlanId: data.memberPlanId,
      amount: data.amount,
      discountPct: data.discountPct,
      finalAmount: Math.round(finalAmount * 100) / 100,
      method: data.method,
      notes: data.notes,
    },
  });
}
