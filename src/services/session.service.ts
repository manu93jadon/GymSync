import { prisma } from "@/lib/prisma";
import { decrementSessionsLeft } from "@/services/plan.service";
import type { SessionStatus } from "@prisma/client";

export async function createSession(coachId: string, memberId: string, date: Date) {
  const member = await prisma.user.findUnique({
    where: { id: memberId },
    select: { coachId: true },
  });

  if (!member || member.coachId !== coachId) {
    throw new Error("Member is not assigned to this coach");
  }

  return prisma.session.create({
    data: { coachId, memberId, date, status: "PENDING" },
  });
}

export async function acknowledgeSession(
  sessionId: string,
  memberId: string,
  status: "APPROVED" | "DENIED",
  rating?: number,
  feedback?: string
) {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: { memberId: true, status: true },
  });

  if (!session) throw new Error("Session not found");
  if (session.memberId !== memberId) throw new Error("Unauthorized");
  if (session.status !== "PENDING") throw new Error("Session is no longer pending");

  const updated = await prisma.session.update({
    where: { id: sessionId },
    data: {
      status,
      ...(status === "APPROVED" && { rating, feedback }),
    },
  });

  if (status === "APPROVED") {
    await decrementSessionsLeft(memberId);
  }

  return updated;
}

export async function autoApproveExpiredSessions() {
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);

  const pending = await prisma.session.findMany({
    where: { status: "PENDING", createdAt: { lt: cutoff } },
    select: { id: true, memberId: true },
  });

  if (pending.length === 0) return 0;

  await prisma.session.updateMany({
    where: { id: { in: pending.map((s) => s.id) } },
    data: { status: "AUTO_APPROVED" },
  });

  // Decrement sessions left for each approved member
  await Promise.all(pending.map((s) => decrementSessionsLeft(s.memberId)));

  return pending.length;
}

export async function getSessionsForMember(memberId: string) {
  return prisma.session.findMany({
    where: { memberId },
    include: {
      coach: { select: { id: true, name: true, email: true } },
    },
    orderBy: { date: "desc" },
  });
}

export async function getSessionsForCoach(coachId: string) {
  return prisma.session.findMany({
    where: { coachId },
    include: {
      member: { select: { id: true, name: true, email: true } },
    },
    orderBy: { date: "desc" },
  });
}

export async function getSessionStats(coachId: string) {
  const counts = await prisma.session.groupBy({
    by: ["status"],
    where: { coachId },
    _count: true,
  });

  const map: Record<SessionStatus, number> = {
    PENDING: 0,
    APPROVED: 0,
    DENIED: 0,
    AUTO_APPROVED: 0,
  };

  for (const item of counts) {
    map[item.status] = item._count;
  }

  return map;
}

export async function getMemberSessionStats(memberId: string) {
  const counts = await prisma.session.groupBy({
    by: ["status"],
    where: { memberId },
    _count: true,
  });

  const map: Record<SessionStatus, number> = {
    PENDING: 0,
    APPROVED: 0,
    DENIED: 0,
    AUTO_APPROVED: 0,
  };

  for (const item of counts) {
    map[item.status] = item._count;
  }

  return map;
}
