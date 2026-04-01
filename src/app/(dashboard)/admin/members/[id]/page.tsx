import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getMemberProfile } from "@/services/user.service";
import { getActiveMemberPlan, getMemberPlanHistory } from "@/services/plan.service";
import { getMemberSessionStats, getSessionsForMember } from "@/services/session.service";
import { getPlansWithFeatures } from "@/services/plan.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AssignPlanDialog } from "@/components/admin/AssignPlanDialog";
import { RecordPaymentDialog } from "@/components/admin/RecordPaymentDialog";
import { SessionCard } from "@/components/sessions/SessionCard";
import { formatDate, formatDateTime } from "@/lib/utils";
import Link from "next/link";
import {
  User, Mail, Calendar, Star, CheckCircle, XCircle, Clock,
  ChevronLeft, Check, X, IndianRupee,
} from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sessions?: string }>;
}

export default async function MemberProfilePage({ params, searchParams }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  const { id } = await params;
  const { sessions: showSessions } = await searchParams;

  const [member, activePlan, planHistory, sessionStats, availablePlans] = await Promise.all([
    getMemberProfile(id).catch(() => null),
    getActiveMemberPlan(id),
    getMemberPlanHistory(id),
    getMemberSessionStats(id),
    getPlansWithFeatures(true),
  ]);

  if (!member) notFound();

  const totalSessions = Object.values(sessionStats).reduce((a, b) => a + b, 0);
  const completedSessions = sessionStats.APPROVED + sessionStats.AUTO_APPROVED;

  let sessionList = null;
  if (showSessions === "true") {
    sessionList = await getSessionsForMember(id);
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Back + Header */}
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2">
          <Link href="/admin/members">
            <ChevronLeft className="h-4 w-4" /> Back to Members
          </Link>
        </Button>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">{member.name}</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Mail className="h-3.5 w-3.5" /> {member.email}
            </p>
          </div>
          <Badge
            variant={member.tier === "GOLD" ? "default" : "outline"}
            className={member.tier === "GOLD" ? "bg-yellow-400 text-yellow-900 hover:bg-yellow-400" : ""}
          >
            {member.tier}
          </Badge>
        </div>
      </div>

      {/* Basic Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4" /> Member Info
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Coach</p>
            <p className="font-medium">{member.coach?.name ?? "Unassigned"}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Member Since</p>
            <p className="font-medium">{formatDate(member.createdAt)}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Role</p>
            <p className="font-medium">{member.role}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Tier</p>
            <p className="font-medium">{member.tier}</p>
          </div>
        </CardContent>
      </Card>

      {/* Session Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" /> Session Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            {[
              { label: "Total", value: totalSessions, icon: Calendar, color: "" },
              { label: "Completed", value: completedSessions, icon: CheckCircle, color: "text-green-600" },
              { label: "Pending", value: sessionStats.PENDING, icon: Clock, color: "text-yellow-600" },
              { label: "Denied", value: sessionStats.DENIED, icon: XCircle, color: "text-red-600" },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-2 rounded-lg bg-muted/40">
                <stat.icon className={`h-4 w-4 mx-auto mb-1 ${stat.color}`} />
                <p className="text-xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-3">
            {showSessions === "true" ? (
              <Button asChild variant="outline" size="sm">
                <Link href={`/admin/members/${id}`}>Hide Session History</Link>
              </Button>
            ) : (
              <Button asChild variant="outline" size="sm" disabled={totalSessions === 0}>
                <Link href={`/admin/members/${id}?sessions=true`}>View Session History</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Session History (on request) */}
      {sessionList && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Session History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sessionList.length === 0 ? (
              <p className="text-sm text-muted-foreground">No sessions yet.</p>
            ) : (
              sessionList.map((s) => (
                <SessionCard
                  key={s.id}
                  id={s.id}
                  date={s.date}
                  status={s.status}
                  personName={s.coach.name}
                  personLabel="Coach"
                  rating={s.rating}
                  feedback={s.feedback}
                />
              ))
            )}
          </CardContent>
        </Card>
      )}

      {/* Current Plan */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Star className="h-4 w-4" /> Current Plan
            </CardTitle>
            <AssignPlanDialog
              memberId={id}
              plans={availablePlans}
              currentPlanId={activePlan?.plan.id}
            />
          </div>
        </CardHeader>
        <CardContent>
          {!activePlan ? (
            <p className="text-sm text-muted-foreground">No active plan assigned.</p>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Plan</p>
                  <p className="font-semibold">{activePlan.plan.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Price</p>
                  <p className="font-semibold">₹{activePlan.plan.price.toLocaleString("en-IN")}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Discount</p>
                  <p className="font-semibold">{activePlan.discountPct}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Sessions Left</p>
                  <p className="font-semibold">{activePlan.sessionsLeft}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Start Date</p>
                  <p className="font-semibold">{formatDate(activePlan.startDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Expires</p>
                  <p className="font-semibold">{formatDate(activePlan.endDate)}</p>
                </div>
              </div>

              {activePlan.plan.planFeatures.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Features</p>
                  <div className="grid grid-cols-2 gap-1">
                    {activePlan.plan.planFeatures.map((pf) => (
                      <div key={pf.id} className="flex items-center gap-2 text-sm">
                        {pf.enabled ? (
                          <Check className="h-4 w-4 text-green-600 shrink-0" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                        <span className={pf.enabled ? "" : "text-muted-foreground"}>
                          {pf.feature.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payments */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <IndianRupee className="h-4 w-4" /> Payment History
            </CardTitle>
            {activePlan && (
              <RecordPaymentDialog
                memberPlanId={activePlan.id}
                memberId={id}
                planPrice={activePlan.plan.price}
                discountPct={activePlan.discountPct}
              />
            )}
          </div>
        </CardHeader>
        <CardContent>
          {planHistory.flatMap((mp) => mp.payments).length === 0 ? (
            <p className="text-sm text-muted-foreground">No payments recorded yet.</p>
          ) : (
            <div className="space-y-2">
              {planHistory.map((mp) =>
                mp.payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between text-sm border rounded-lg px-3 py-2"
                  >
                    <div>
                      <p className="font-medium">₹{payment.finalAmount.toLocaleString("en-IN")}</p>
                      <p className="text-xs text-muted-foreground">
                        {mp.plan.name} · {payment.method}
                        {payment.discountPct > 0 && ` · ${payment.discountPct}% off`}
                        {payment.notes && ` · ${payment.notes}`}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground shrink-0">
                      {formatDateTime(payment.paidAt)}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
