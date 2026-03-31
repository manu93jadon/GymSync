import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clear existing data
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  const hash = (pw: string) => bcrypt.hash(pw, 12);

  // Admin
  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@gymsync.com",
      password: await hash("admin123"),
      role: "ADMIN",
    },
  });

  // Coaches
  const [coach1, coach2] = await Promise.all([
    prisma.user.create({
      data: {
        name: "Ravi Sharma",
        email: "ravi@gymsync.com",
        password: await hash("coach123"),
        role: "COACH",
      },
    }),
    prisma.user.create({
      data: {
        name: "Priya Nair",
        email: "priya@gymsync.com",
        password: await hash("coach123"),
        role: "COACH",
      },
    }),
  ]);

  // Members
  const [m1, m2, m3, m4] = await Promise.all([
    prisma.user.create({
      data: {
        name: "Amit Kumar",
        email: "amit@example.com",
        password: await hash("member123"),
        role: "MEMBER",
        tier: "GOLD",
        coachId: coach1.id,
        dietChart: "# Amit's Diet Plan\n\n## Breakfast\n- Oats with banana\n- 4 egg whites\n- Green tea\n\n## Lunch\n- Brown rice 150g\n- Grilled chicken 200g\n- Salad\n\n## Dinner\n- Dal 1 cup\n- Roti x2\n- Vegetables",
        bcaResults: [
          { date: "2026-01-15", bodyFatPercent: 22.5, muscleMassKg: 38.2, weightKg: 78, notes: "Initial measurement" },
          { date: "2026-02-15", bodyFatPercent: 20.8, muscleMassKg: 39.1, weightKg: 77.2, notes: "Good progress!" },
          { date: "2026-03-15", bodyFatPercent: 19.2, muscleMassKg: 40.0, weightKg: 76.5 },
        ],
      },
    }),
    prisma.user.create({
      data: {
        name: "Sneha Patel",
        email: "sneha@example.com",
        password: await hash("member123"),
        role: "MEMBER",
        tier: "GOLD",
        coachId: coach1.id,
      },
    }),
    prisma.user.create({
      data: {
        name: "Rahul Verma",
        email: "rahul@example.com",
        password: await hash("member123"),
        role: "MEMBER",
        tier: "BASIC",
        coachId: coach2.id,
      },
    }),
    prisma.user.create({
      data: {
        name: "Deepa Menon",
        email: "deepa@example.com",
        password: await hash("member123"),
        role: "MEMBER",
        tier: "BASIC",
        coachId: coach2.id,
      },
    }),
  ]);

  // Sessions
  const now = new Date();
  const daysAgo = (n: number) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000);

  await prisma.session.createMany({
    data: [
      // Amit - mix of statuses
      { memberId: m1.id, coachId: coach1.id, date: daysAgo(10), status: "APPROVED", rating: 5, feedback: "Amazing session, felt great!" },
      { memberId: m1.id, coachId: coach1.id, date: daysAgo(7), status: "APPROVED", rating: 4 },
      { memberId: m1.id, coachId: coach1.id, date: daysAgo(4), status: "AUTO_APPROVED" },
      { memberId: m1.id, coachId: coach1.id, date: daysAgo(1), status: "PENDING" },
      // Sneha
      { memberId: m2.id, coachId: coach1.id, date: daysAgo(5), status: "APPROVED", rating: 5 },
      { memberId: m2.id, coachId: coach1.id, date: daysAgo(2), status: "DENIED" },
      { memberId: m2.id, coachId: coach1.id, date: daysAgo(0), status: "PENDING" },
      // Rahul
      { memberId: m3.id, coachId: coach2.id, date: daysAgo(6), status: "APPROVED", rating: 3 },
      { memberId: m3.id, coachId: coach2.id, date: daysAgo(1), status: "PENDING" },
      // Deepa
      { memberId: m4.id, coachId: coach2.id, date: daysAgo(3), status: "APPROVED" },
    ],
  });

  console.log("Seed complete!");
  console.log("\nTest accounts:");
  console.log("  Admin:   admin@gymsync.com  / admin123");
  console.log("  Coach 1: ravi@gymsync.com   / coach123");
  console.log("  Coach 2: priya@gymsync.com  / coach123");
  console.log("  Member (Gold): amit@example.com  / member123");
  console.log("  Member (Gold): sneha@example.com / member123");
  console.log("  Member (Basic): rahul@example.com / member123");
  console.log("  Member (Basic): deepa@example.com / member123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
