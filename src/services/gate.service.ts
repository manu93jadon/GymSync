import type { Tier } from "@prisma/client";
import type { GoldFeature } from "@/types";

const GOLD_ONLY_FEATURES: GoldFeature[] = ["DIET_CHART", "BCA_RESULTS"];

export function canAccessFeature(tier: Tier, feature: GoldFeature): boolean {
  if (GOLD_ONLY_FEATURES.includes(feature)) {
    return tier === "GOLD";
  }
  return true;
}
