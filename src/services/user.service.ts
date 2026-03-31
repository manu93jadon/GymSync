import { prisma } from "@/lib/prisma";
import type { Tier } from "@prisma/client";
import bcrypt from "bcryptjs";

export async function getMembersForCoach(coachId: string) {
  return prisma.user.findMany({
    where: { coachId, role: "MEMBER" },
    select: {
      id: true,
      name: true,
      email: true,
      tier: true,
      _count: {
        select: {
          sessions: {
            where: { status: "PENDING" },
          },
        },
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

export async function assignCoach(memberId: string, coachId: string | null) {
  // Validate member
  const member = await prisma.user.findUnique({
    where: { id: memberId, role: "MEMBER" },
  });
  if (!member) throw new Error("Member not found");

  // Validate coach if provided
  if (coachId) {
    const coach = await prisma.user.findUnique({
      where: { id: coachId, role: "COACH" },
    });
    if (!coach) throw new Error("Coach not found");
  }

  return prisma.user.update({
    where: { id: memberId },
    data: { coachId },
  });
}

export async function updateUserTier(userId: string, tier: Tier) {
  return prisma.user.update({
    where: { id: userId },
    data: { tier },
  });
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role?: "ADMIN" | "COACH" | "MEMBER";
}) {
  const hashed = await bcrypt.hash(data.password, 12);
  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashed,
      role: data.role ?? "MEMBER",
    },
  });
}
