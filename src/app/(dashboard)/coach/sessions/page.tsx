import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getSessionsForCoach } from "@/services/session.service";
import { SessionCard } from "@/components/sessions/SessionCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function CoachSessionsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "COACH") redirect("/login");

  const sessions = await getSessionsForCoach(session.user.id);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Sessions</h1>
        <Button asChild size="sm">
          <Link href="/coach/sessions/new">+ New</Link>
        </Button>
      </div>

      {sessions.length === 0 ? (
        <p className="text-muted-foreground text-sm">No sessions yet. Mark your first session.</p>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => (
            <SessionCard
              key={s.id}
              id={s.id}
              date={s.date}
              status={s.status}
              personName={s.member.name}
              personLabel="Member"
              rating={s.rating}
              feedback={s.feedback}
            />
          ))}
        </div>
      )}
    </div>
  );
}
