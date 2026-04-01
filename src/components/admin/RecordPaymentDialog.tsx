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
import { Textarea } from "@/components/ui/textarea";
import { recordPaymentAction } from "@/actions/plan.actions";
import { Loader2, IndianRupee } from "lucide-react";

interface RecordPaymentDialogProps {
  memberPlanId: string;
  memberId: string;
  planPrice: number;
  discountPct: number;
}

export function RecordPaymentDialog({
  memberPlanId,
  memberId,
  planPrice,
  discountPct,
}: RecordPaymentDialogProps) {
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState("CASH");
  const [isPending, startTransition] = useTransition();

  const finalAmount = planPrice * (1 - discountPct / 100);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("memberPlanId", memberPlanId);
    fd.set("memberId", memberId);
    fd.set("method", method);

    startTransition(async () => {
      const result = await recordPaymentAction(fd);
      if (result.error) toast.error(result.error);
      else {
        toast.success("Payment recorded");
        setOpen(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <IndianRupee className="h-4 w-4" />
          Record Payment
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="pay-amount">Amount (₹)</Label>
              <Input
                id="pay-amount"
                name="amount"
                type="number"
                min="0"
                step="0.01"
                defaultValue={planPrice}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pay-discount">Discount %</Label>
              <Input
                id="pay-discount"
                name="discountPct"
                type="number"
                min="0"
                max="100"
                step="0.01"
                defaultValue={discountPct}
              />
              <p className="text-xs text-muted-foreground">
                Final amount: ₹{finalAmount.toFixed(2)}
              </p>
            </div>
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="CARD">Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pay-notes">Notes (optional)</Label>
              <Textarea id="pay-notes" name="notes" placeholder="e.g. Partial payment" rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="animate-spin" />}
              Save Payment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
