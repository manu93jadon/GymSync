import type { Role, Tier } from "@prisma/client";
import type { DefaultSession } from "next-auth";

// Extend next-auth types to include role and tier
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

export type { Role, Tier } from "@prisma/client";
export { SessionStatus } from "@prisma/client";

export type GoldFeature = "DIET_CHART" | "BCA_RESULTS";

export type BcaEntry = {
  date: string; // ISO date string
  bodyFatPercent: number;
  muscleMassKg: number;
  weightKg: number;
  notes?: string;
};
