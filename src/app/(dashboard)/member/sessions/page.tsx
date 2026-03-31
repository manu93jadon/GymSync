import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getSessionsForMember } from "@/services/session.service";
import { SessionCard } from "@/components/sessions/SessionCard";
import { AcknowledgeButton } from "@/components/sessions/AcknowledgeButton";

export default async function MemberSessionsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "MEMBER") redirect("/login");

  const sessions = await getSessionsForMember(session.user.id);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">My Sessions</h1>
      <p className="text-sm text-muted-foreground">
        Approve or deny sessions marked by your coach. Sessions auto-approve after 48 hours.
      </p>

      {sessions.length === 0 ? (
        <p className="text-muted-foreground text-sm">No sessions yet.</p>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => (
            <SessionCard
              key={s.id}
              id={s.id}
              date={s.date}
              status={s.status}
              personName={s.coach.name}
              personLabel="Coach"
              rating={s.rating}
              feedback={s.feedback}
              actions={
                s.status === "PENDING" ? (
                  <AcknowledgeButton sessionId={s.id} />
                ) : undefined
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
