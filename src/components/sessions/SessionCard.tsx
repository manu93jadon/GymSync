import { Card, CardContent } from "@/components/ui/card";
import { SessionStatusBadge } from "./SessionStatusBadge";
import { formatDate } from "@/lib/utils";
import type { SessionStatus } from "@prisma/client";
import { Star } from "lucide-react";

interface SessionCardProps {
  id: string;
  date: Date;
  status: SessionStatus;
  personName: string;
  personLabel: string;
  rating?: number | null;
  feedback?: string | null;
  actions?: React.ReactNode;
}

export function SessionCard({
  date,
  status,
  personName,
  personLabel,
  rating,
  feedback,
  actions,
}: SessionCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{personName}</p>
            <p className="text-xs text-muted-foreground">{personLabel}</p>
            <p className="text-sm text-muted-foreground mt-1">{formatDate(date)}</p>
            {rating && (
              <div className="flex items-center gap-1 mt-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                  />
                ))}
              </div>
            )}
            {feedback && (
              <p className="text-xs text-muted-foreground mt-1 italic">&quot;{feedback}&quot;</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <SessionStatusBadge status={status} />
            {actions}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
