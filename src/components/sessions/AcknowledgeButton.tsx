"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { acknowledgeSessionAction } from "@/actions/session.actions";
import { CheckCircle, XCircle, Star } from "lucide-react";

interface AcknowledgeButtonProps {
  sessionId: string;
}

export function AcknowledgeButton({ sessionId }: AcknowledgeButtonProps) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isPending, startTransition] = useTransition();

  function handleDeny() {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("sessionId", sessionId);
      fd.set("status", "DENIED");
      const result = await acknowledgeSessionAction(fd);
      if (result.error) toast.error(result.error);
      else toast.success("Session marked as denied");
    });
  }

  function handleApprove(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("sessionId", sessionId);
    formData.set("status", "APPROVED");
    if (rating > 0) formData.set("rating", String(rating));

    startTransition(async () => {
      const result = await acknowledgeSessionAction(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Session approved!");
        setOpen(false);
        setRating(0);
      }
    });
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        className="text-destructive hover:bg-destructive/10"
        onClick={handleDeny}
        disabled={isPending}
      >
        <XCircle className="h-4 w-4" />
        <span className="hidden sm:inline">Deny</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm" disabled={isPending}>
            <CheckCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Approve</span>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <form onSubmit={handleApprove}>
            <DialogHeader>
              <DialogTitle>Approve Session</DialogTitle>
              <DialogDescription>
                Rate your session and leave optional feedback.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Rating (optional)</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-0.5"
                    >
                      <Star
                        className={`h-7 w-7 transition-colors ${
                          star <= (hoverRating || rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="feedback">Feedback (optional)</Label>
                <Textarea
                  id="feedback"
                  name="feedback"
                  placeholder="How was the session?"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                Confirm Approval
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
