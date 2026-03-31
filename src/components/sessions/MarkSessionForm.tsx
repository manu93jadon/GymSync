"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { markSessionAction } from "@/actions/session.actions";
import { Loader2 } from "lucide-react";

interface Member {
  id: string;
  name: string;
  email: string;
}

interface MarkSessionFormProps {
  members: Member[];
}

export function MarkSessionForm({ members }: MarkSessionFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [memberId, setMemberId] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("memberId", memberId);

    startTransition(async () => {
      const result = await markSessionAction(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Session marked successfully!");
        router.push("/coach/sessions");
      }
    });
  }

  if (members.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No members assigned to you yet. Ask your admin to assign members.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mark a Session</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="member">Member</Label>
            <Select value={memberId} onValueChange={setMemberId} required>
              <SelectTrigger id="member">
                <SelectValue placeholder="Select a member" />
              </SelectTrigger>
              <SelectContent>
                {members.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                    <span className="ml-1 text-xs text-muted-foreground">({m.email})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Session Date & Time</Label>
            <Input
              id="date"
              name="date"
              type="datetime-local"
              required
              defaultValue={new Date().toISOString().slice(0, 16)}
            />
          </div>
          <Button type="submit" disabled={isPending || !memberId} className="w-full">
            {isPending && <Loader2 className="animate-spin" />}
            Mark Session
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
