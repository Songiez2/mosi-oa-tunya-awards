import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Loader2, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { createPayment, uploadFile } from '@/lib/api';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import type { Nominee } from '@/types/types';

const VOTE_PACKS = [1, 5, 10, 20];

interface VoteModalProps {
  nominee: Nominee | null;
  open: boolean;
  onClose: () => void;
}

export default function VoteModal({ nominee, open, onClose }: VoteModalProps) {
  const { user } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [votes, setVotes] = useState('1');
  const [proof, setProof] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const fee = Number(settings.voting_fee ?? 10);
  const currency = settings.currency ?? 'K';
  const total = parseInt(votes || '1') * fee;

  const handleSubmit = async () => {
    if (!user) { navigate('/login'); return; }
    if (!nominee) return;
    if (!proof) { toast.error('Please upload payment proof'); return; }

    setLoading(true);
    try {
      const proofUrl = await uploadFile('payments', `votes/${user.id}/${Date.now()}_${proof.name}`, proof);
      if (!proofUrl) { toast.error('Failed to upload payment proof'); return; }

      const result = await createPayment({
        payment_type: 'voting',
        nominee_id: nominee.id,
        amount: total,
        votes_count: parseInt(votes),
        payment_proof_url: proofUrl,
        status: 'pending',
      });

      if (result) {
        toast.success(`Vote submitted! Reference: ${result.transaction_ref}`, {
          description: 'Your payment is being verified. Votes will be added within 24 hours.',
          duration: 6000,
        });
        onClose();
      } else {
        toast.error('Failed to submit vote. Please try again.');
      }
    } catch {
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!nominee) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md glass-card border-primary/30">
        <DialogHeader>
          <DialogTitle className="text-gradient-gold flex items-center gap-2">
            <Star className="w-5 h-5 text-primary" />
            Vote for {nominee.stage_name || nominee.full_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Nominee Info */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted border border-border">
            {nominee.profile_picture_url ? (
              <img src={nominee.profile_picture_url} alt={nominee.full_name} className="w-12 h-12 rounded-full object-cover border border-primary/30" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-gold flex items-center justify-center text-primary-foreground font-bold">
                {nominee.full_name[0]}
              </div>
            )}
            <div className="min-w-0">
              <div className="font-semibold text-sm truncate">{nominee.full_name}</div>
              <div className="text-xs text-muted-foreground truncate">{(nominee.categories as { name?: string } | null)?.name ?? ''}</div>
              <div className="text-xs text-primary font-medium">{nominee.vote_count.toLocaleString()} votes</div>
            </div>
          </div>

          {/* Vote count */}
          <div className="space-y-1.5">
            <Label className="text-sm">Number of Votes</Label>
            <Select value={votes} onValueChange={setVotes}>
              <SelectTrigger className="bg-input border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VOTE_PACKS.map(v => (
                  <SelectItem key={v} value={String(v)}>
                    {v} vote{v > 1 ? 's' : ''} — {currency}{(v * fee).toLocaleString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/30 text-center">
            <div className="text-xs text-muted-foreground mb-1">{votes} vote{parseInt(votes) > 1 ? 's' : ''} × {currency}{fee} each</div>
            <div className="text-2xl font-bold text-gradient-gold">{currency}{total.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-1">Total Amount to Pay</div>
          </div>

          {/* Payment Instructions */}
          <div className="p-3 rounded-lg bg-muted border border-border text-xs text-muted-foreground space-y-1">
            <div className="font-medium text-foreground text-xs">Payment Instructions</div>
            <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed">
              {settings.payment_instructions ?? `Send ${currency}${total} to ${settings.mobile_money_number ?? '0962267118'} (${settings.account_name ?? 'TUNYA AWARDS'})`}
            </pre>
          </div>

          {/* Proof Upload */}
          <div className="space-y-1.5">
            <Label className="text-sm">Payment Proof *</Label>
            <label className="flex flex-col items-center justify-center h-20 rounded-lg border-2 border-dashed border-primary/30 cursor-pointer hover:border-primary/60 transition-colors bg-muted">
              <Upload className="w-5 h-5 text-primary mb-1" />
              <span className="text-xs text-muted-foreground">{proof ? proof.name : 'Upload screenshot'}</span>
              <input type="file" className="hidden" accept="image/*" onChange={e => setProof(e.target.files?.[0] ?? null)} />
            </label>
          </div>

          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button
              className="flex-1 bg-gradient-gold text-primary-foreground font-semibold"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Star className="w-4 h-4 mr-2" />}
              Submit Vote
            </Button>
          </div>

          {!user && (
            <p className="text-xs text-center text-muted-foreground">
              You need to <button onClick={() => navigate('/login')} className="text-primary underline">login</button> to vote.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
