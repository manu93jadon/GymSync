"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import type { CoachTreeEntry } from "@/types";
import { ChevronDown, ChevronRight, Star, Dumbbell, Users } from "lucide-react";

interface CoachMemberTreeProps {
  coaches: CoachTreeEntry[];
}

export function CoachMemberTree({ coaches }: CoachMemberTreeProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  function toggle(coachId: string) {
    setExpanded((prev) => ({ ...prev, [coachId]: !prev[coachId] }));
  }

  if (coaches.length === 0) {
    return <p className="text-muted-foreground text-sm">No coaches found.</p>;
  }

  return (
    <div className="space-y-3">
      {coaches.map((coach) => (
        <Card key={coach.id}>
          <CardHeader className="pb-0">
            <button
              onClick={() => toggle(coach.id)}
              className="flex items-center justify-between w-full text-left"
            >
              <div className="flex items-center gap-3">
                {expanded[coach.id] ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
                <div>
                  <CardTitle className="text-base">{coach.name}</CardTitle>
                  <p className="text-xs text-muted-foreground">{coach.email}</p>
                </div>
              </div>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {coach.members.length}
              </Badge>
            </button>
          </CardHeader>

          {expanded[coach.id] && (
            <CardContent className="pt-3">
              {coach.members.length === 0 ? (
                <p className="text-sm text-muted-foreground pl-7">No members assigned.</p>
              ) : (
                <div className="space-y-2 pl-7">
                  {coach.members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">{member.name}</p>
                          <Badge
                            variant={member.tier === "GOLD" ? "default" : "outline"}
                            className={
                              member.tier === "GOLD"
                                ? "bg-yellow-400 text-yellow-900 hover:bg-yellow-400 text-xs py-0"
                                : "text-xs py-0"
                            }
                          >
                            {member.tier}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          {member.avgRating !== null ? (
                            <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              {member.avgRating.toFixed(1)}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">No ratings</span>
                          )}
                          {member.activePlan ? (
                            <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                              <Dumbbell className="h-3 w-3" />
                              {member.sessionsLeft ?? 0} sessions left
                            </span>
                          ) : (
                            <span className="text-xs text-destructive">No active plan</span>
                          )}
                          {member.activePlan && (
                            <span className="text-xs text-muted-foreground hidden sm:inline">
                              {member.activePlan.planName} · expires {formatDate(member.activePlan.endDate)}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button asChild variant="ghost" size="sm" className="shrink-0">
                        <Link href={`/admin/members/${member.id}`}>View</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}
