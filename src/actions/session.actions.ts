"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import {
  createSession,
  acknowledgeSession,
} from "@/services/session.service";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const markSessionSchema = z.object({
  memberId: z.string().min(1),
  date: z.string().min(1),
});

export async function markSessionAction(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "COACH") {
    return { error: "Unauthorized" };
  }

  const parsed = markSessionSchema.safeParse({
    memberId: formData.get("memberId"),
    date: formData.get("date"),
  });

  if (!parsed.success) {
    return { error: "Invalid form data" };
  }

  try {
    await createSession(
      session.user.id,
      parsed.data.memberId,
      new Date(parsed.data.date)
    );
    revalidatePath("/coach/sessions");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to mark session" };
  }
}

const acknowledgeSchema = z.object({
  sessionId: z.string().min(1),
  status: z.enum(["APPROVED", "DENIED"]),
  rating: z.coerce.number().min(1).max(5).optional(),
  feedback: z.string().optional(),
});

export async function acknowledgeSessionAction(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "MEMBER") {
    return { error: "Unauthorized" };
  }

  const parsed = acknowledgeSchema.safeParse({
    sessionId: formData.get("sessionId"),
    status: formData.get("status"),
    rating: formData.get("rating") || undefined,
    feedback: formData.get("feedback") || undefined,
  });

  if (!parsed.success) {
    return { error: "Invalid form data" };
  }

  try {
    await acknowledgeSession(
      parsed.data.sessionId,
      session.user.id,
      parsed.data.status,
      parsed.data.rating,
      parsed.data.feedback
    );
    revalidatePath("/member/sessions");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to acknowledge session" };
  }
}
