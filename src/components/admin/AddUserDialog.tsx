"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { createUserAction } from "@/actions/user.actions";
import { Loader2, UserPlus } from "lucide-react";

interface Coach {
  id: string;
  name: string;
}

interface AddUserDialogProps {
  role: "COACH" | "MEMBER";
  coaches?: Coach[];
}

export function AddUserDialog({ role, coaches = [] }: AddUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [coachId, setCoachId] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("role", role);
    if (coachId) fd.set("coachId", coachId);

    startTransition(async () => {
      const result = await createUserAction(fd);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`${role === "COACH" ? "Coach" : "Member"} added successfully`);
        setOpen(false);
        setCoachId("");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <UserPlus className="h-4 w-4" />
          Add {role === "COACH" ? "Coach" : "Member"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add {role === "COACH" ? "Coach" : "Member"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="add-name">Full Name</Label>
              <Input id="add-name" name="name" placeholder="e.g. Ravi Sharma" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-email">Email</Label>
              <Input id="add-email" name="email" type="email" placeholder="ravi@gym.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-password">Password</Label>
              <Input id="add-password" name="password" type="password" placeholder="Min. 6 characters" required minLength={6} />
            </div>
            {role === "MEMBER" && coaches.length > 0 && (
              <div className="space-y-2">
                <Label>Assign Coach (optional)</Label>
                <Select value={coachId} onValueChange={setCoachId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a coach" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No coach</SelectItem>
                    {coaches.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="animate-spin" />}
              Create {role === "COACH" ? "Coach" : "Member"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
