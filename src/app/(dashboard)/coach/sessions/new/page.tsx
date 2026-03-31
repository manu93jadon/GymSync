import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getMembersForCoach } from "@/services/user.service";
import { MarkSessionForm } from "@/components/sessions/MarkSessionForm";

export default async function NewSessionPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "COACH") redirect("/login");

  const members = await getMembersForCoach(session.user.id);

  return (
    <div className="max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Mark a Session</h1>
      <MarkSessionForm members={members} />
    </div>
  );
}
