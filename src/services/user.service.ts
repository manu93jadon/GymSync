import { prisma } from "@/lib/prisma";
import type { Tier } from "@prisma/client";
import bcrypt from "bcryptjs";
import type { CoachTreeEntry } from "@/types";

export async function getMembersForCoach(coachId: string) {
  return prisma.user.findMany({
    where: { coachId, role: "MEMBER" },
    select: {
      id: true,
      name: true,
      email: true,
      tier: true,
      _count: {
        select: { sessions: { where: { status: "PENDING" } } },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function getAllUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      tier: true,
      coach: { select: { id: true, name: true } },
    },
    orderBy: [{ role: "asc" }, { name: "asc" }],
  });
}

export async function getAllCoaches() {
  return prisma.user.findMany({
    where: { role: "COACH" },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });
}

export async function getAllMembers() {
  return prisma.user.findMany({
    where: { role: "MEMBER" },
    select: {
      id: true,
      name: true,
      email: true,
      tier: true,
      createdAt: true,
      coach: { select: { id: true, name: true } },
      memberPlans: {
        where: { isActive: true },
        select: {
          id: true,
          sessionsLeft: true,
          endDate: true,
          plan: { select: { name: true } },
        },
        take: 1,
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function getCoachMemberTree(): Promise<CoachTreeEntry[]> {
  const coaches = await prisma.user.findMany({
    where: { role: "COACH" },
    select: {
      id: true,
      name: true,
      email: true,
      members: {
        where: { role: "MEMBER" },
        select: {
          id: true,
          name: true,
          email: true,
          tier: true,
          memberPlans: {
            where: { isActive: true },
            select: {
              id: true,
              sessionsLeft: true,
              endDate: true,
              plan: { select: { name: true } },
            },
            take: 1,
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  const allMemberIds = coaches.flatMap((c) => c.members.map((m) => m.id));

  const ratings =
    allMemberIds.length > 0
      ? await prisma.session.groupBy({
          by: ["memberId"],
          where: {
            memberId: { in: allMemberIds },
            status: { in: ["APPROVED", "AUTO_APPROVED"] },
            rating: { not: null },
          },
          _avg: { rating: true },
        })
      : [];

  const ratingMap = Object.fromEntries(ratings.map((r) => [r.memberId, r._avg.rating]));

  return coaches.map((coach) => ({
    id: coach.id,
    name: coach.name,
    email: coach.email,
    members: coach.members.map((m) => {
      const activePlan = m.memberPlans[0] ?? null;
      return {
        id: m.id,
        name: m.name,
        email: m.email,
        tier: m.tier,
        avgRating: ratingMap[m.id] ?? null,
        sessionsLeft: activePlan?.sessionsLeft ?? null,
        activePlan: activePlan
          ? {
              id: activePlan.id,
              planName: activePlan.plan.name,
              endDate: activePlan.endDate.toISOString(),
            }
          : null,
      };
    }),
  }));
}

export async function getMemberProfile(memberId: string) {
  const user = await prisma.user.findUnique({
    where: { id: memberId, role: "MEMBER" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      tier: true,
      createdAt: true,
      coach: { select: { id: true, name: true, email: true } },
    },
  });
  if (!user) throw new Error("Member not found");
  return { ...user, createdAt: user.createdAt.toISOString() };
}

export async function assignCoach(memberId: string, coachId: string | null) {
  const member = await prisma.user.findUnique({ where: { id: memberId, role: "MEMBER" } });
  if (!member) throw new Error("Member not found");

  if (coachId) {
    const coach = await prisma.user.findUnique({ where: { id: coachId, role: "COACH" } });
    if (!coach) throw new Error("Coach not found");
  }

  return prisma.user.update({ where: { id: memberId }, data: { coachId } });
}

export async function updateUserTier(userId: string, tier: Tier) {
  return prisma.user.update({ where: { id: userId }, data: { tier } });
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role?: "ADMIN" | "COACH" | "MEMBER";
  coachId?: string;
}) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new Error("Email already in use");

  const hashed = await bcrypt.hash(data.password, 12);
  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashed,
      role: data.role ?? "MEMBER",
      coachId: data.coachId,
    },
  });
}
