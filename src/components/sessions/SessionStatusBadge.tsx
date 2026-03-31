import { Badge } from "@/components/ui/badge";
import type { SessionStatus } from "@prisma/client";

const STATUS_CONFIG: Record<
  SessionStatus,
  { label: string; variant: "warning" | "success" | "destructive" | "info" }
> = {
  PENDING: { label: "Pending", variant: "warning" },
  APPROVED: { label: "Approved", variant: "success" },
  DENIED: { label: "Denied", variant: "destructive" },
  AUTO_APPROVED: { label: "Auto-Approved", variant: "info" },
};

export function SessionStatusBadge({ status }: { status: SessionStatus }) {
  const config = STATUS_CONFIG[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
