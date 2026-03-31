import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock } from "lucide-react";

interface GoldPlanGateProps {
  children: React.ReactNode;
  hasAccess: boolean;
  featureName: string;
}

export function GoldPlanGate({ children, hasAccess, featureName }: GoldPlanGateProps) {
  if (hasAccess) return <>{children}</>;

  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
          <Lock className="h-6 w-6 text-yellow-600" />
        </div>
        <CardTitle className="text-lg">{featureName}</CardTitle>
        <Badge className="mx-auto w-fit bg-yellow-400 text-yellow-900 hover:bg-yellow-400">
          Gold Plan Required
        </Badge>
      </CardHeader>
      <CardContent className="text-center text-sm text-muted-foreground">
        <p>This feature is available exclusively for Gold plan members.</p>
        <p className="mt-1">Contact your gym admin to upgrade your plan.</p>
      </CardContent>
    </Card>
  );
}
