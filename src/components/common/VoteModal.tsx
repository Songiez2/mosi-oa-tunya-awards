import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Star, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import type { Nominee } from "@/types/types";

interface VoteModalProps {
  nominee: Nominee | null;
  open: boolean;
  onClose: () => void;
}

const VOTE_OPTIONS = [1, 5, 10, 20];

export default function VoteModal({
  nominee,
  open,
  onClose,
}: VoteModalProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [votes, setVotes] = useState("1");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const votePrice = 10;
  const total = Number(votes) * votePrice;

  if (!nominee) return null;

  const handleVote = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!phone.trim()) {
      toast.error("Enter your mobile money number");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke(
        "create-payment",
        {
          body: {
            payment_type: "vote",
            nominee_id: nominee.id,
            user_id: user.id,
            phone,
            votes: Number(votes),
            email: user.email,
          },
        }
      );

      if (error) throw error;

      if (data?.success) {
        toast.success(
          "Payment request sent. Check your phone and enter your Mobile Money PIN."
        );

        onClose();
      } else {
        toast.error(data?.error || "Payment failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">

        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Vote for {nominee.stage_name || nominee.full_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">

          <div className="rounded-lg border p-3">
            <div className="font-semibold">
              {nominee.full_name}
            </div>

            <div className="text-sm text-muted-foreground">
              Current Votes: {nominee.vote_count}
            </div>
          </div>

          <div>
            <Label>Number of Votes</Label>

            <Select
              value={votes}
              onValueChange={setVotes}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                {VOTE_OPTIONS.map((v) => (
                  <SelectItem
                    key={v}
                    value={String(v)}
                  >
                    {v} Vote{v > 1 ? "s" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg bg-yellow-50 border p-3 text-center">

            <div className="text-sm">
              Total Payment
            </div>

            <div className="text-3xl font-bold">
              ZMW {total}
            </div>

          </div>

          <div>

            <Label>
              Mobile Money Number
            </Label>

            <Input
              placeholder="097xxxxxxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <p className="text-xs text-muted-foreground mt-1">
              Airtel Money, MTN Money or Zamtel Kwacha
            </p>

          </div>

          <Button
            onClick={handleVote}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Smartphone className="w-4 h-4 mr-2" />
                Pay with Mobile Money
              </>
            )}
          </Button>

        </div>

      </DialogContent>
    </Dialog>
  );
}