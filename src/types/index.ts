import type { Role, Tier } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      tier: Tier;
    } & DefaultSession["user"];
  }
  interface User {
    id: string;
    role: Role;
    tier: Tier;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    tier: Tier;
  }
}

export type { Role, Tier, PaymentMethod } from "@prisma/client";
export { SessionStatus } from "@prisma/client";

export type GoldFeature = "DIET_CHART" | "BCA_RESULTS";

export type BcaEntry = {
  date: string;
  bodyFatPercent: number;
  muscleMassKg: number;
  weightKg: number;
  notes?: string;
};

// ─── Plan types (serialized — Decimals converted to number) ─────────────────

export type SerializedFeature = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
};

export type SerializedPlanFeature = {
  id: string;
  featureId: string;
  enabled: boolean;
  feature: { id: string; name: string; description: string | null };
};

export type SerializedPlan = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  durationDays: number;
  isActive: boolean;
  createdAt: string;
  planFeatures: SerializedPlanFeature[];
};

export type SerializedPayment = {
  id: string;
  amount: number;
  discountPct: number;
  finalAmount: number;
  method: string;
  notes: string | null;
  paidAt: string;
};

export type SerializedMemberPlan = {
  id: string;
  discountPct: number;
  startDate: string;
  endDate: string;
  sessionsLeft: number;
  isActive: boolean;
  plan: SerializedPlan;
  payments: SerializedPayment[];
};

// ─── Coach tree types ────────────────────────────────────────────────────────

export type CoachMemberSummary = {
  id: string;
  name: string;
  email: string;
  tier: Tier;
  avgRating: number | null;
  sessionsLeft: number | null;
  activePlan: { id: string; planName: string; endDate: string } | null;
};

export type CoachTreeEntry = {
  id: string;
  name: string;
  email: string;
  members: CoachMemberSummary[];
};
