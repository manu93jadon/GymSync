import { prisma } from "@/lib/prisma";
import type { SessionStatus } from "@prisma/client";

export async function createSession(coachId: string, memberId: string, date: Date) {
  // Verify coach-member relationship
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

  return prisma.session.update({
    where: { id: sessionId },
    data: {
      status,
      ...(status === "APPROVED" && { rating, feedback }),
    },
  });
}

export async function autoApproveExpiredSessions() {
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000); // 48 hours ago

  const result = await prisma.session.updateMany({
    where: {
      status: "PENDING",
      createdAt: { lt: cutoff },
    },
    data: { status: "AUTO_APPROVED" },
  });

  return result.count;
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
