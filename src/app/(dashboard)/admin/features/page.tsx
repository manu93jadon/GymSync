import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAllFeatures } from "@/services/plan.service";
import { FeatureManager } from "./FeatureManager";

export default async function AdminFeaturesPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  const features = await getAllFeatures();

  return (
    <div className="space-y-4 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Features</h1>
        <p className="text-sm text-muted-foreground">
          Define gym features that can be toggled per plan. Adding a new feature automatically
          adds it to all existing plans as disabled.
        </p>
      </div>
      <FeatureManager features={features} />
    </div>
  );
}
