import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Star, Smartphone } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { createLipilaPayment, pollPaymentStatus } from '@/lib/api';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import type { Nominee } from '@/types/types';

const VOTE_PACKS = [1, 2, 5, 10, 20, 50];

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
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);

  const fee = Number(settings.voting_fee ?? 10);
  const currency = settings.currency ?? 'K';
  const total = parseInt(votes || '1') * fee;

  const handleSubmit = async () => {
    if (!user) { navigate('/login'); return; }
    if (!nominee) return;
    if (!phone) { toast.error('Please enter your phone number'); return; }
    if (phone.replace(/\D/g, '').length < 9) { toast.error('Please enter a valid phone number'); return; }

    setLoading(true);
    try {
      const result = await createLipilaPayment({
        phone: phone.replace(/\D/g, ''),
        nominee_id: nominee.id,
        user_id: user.id,
        email: user.email,
        votes_count: parseInt(votes),
      });

      if (result) {
        toast.success('Payment initiated! Please complete the payment on your phone.', {
          description: 'Waiting for payment confirmation...',
          duration: 5000,
        });

        // Start polling for payment status
        setPolling(true);
        setLoading(false);

        try {
          const finalPayment = await pollPaymentStatus(result.payment.id, 40, 3000);
          setPolling(false);

          if (finalPayment.status === 'completed') {
            toast.success('Payment successful! Your votes have been added.', {
              duration: 5000,
            });
            onClose();
            // Refresh the page to show updated vote counts
            window.location.reload();
          } else if (finalPayment.status === 'failed') {
            toast.error('Payment failed. Please try again.');
          }
        } catch (pollError) {
          setPolling(false);
          toast.error('Payment verification timeout. Please check your payment status later.');
          console.error('Polling error:', pollError);
        }
      } else {
        toast.error('Failed to initiate payment. Please try again.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('An error occurred. Please try again.');
      setLoading(false);
      setPolling(false);
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
            </div>
          </div>

          {/* Vote count */}
          <div className="space-y-1.5">
            <Label className="text-sm">Number of Votes</Label>
            <Select value={votes} onValueChange={setVotes} disabled={loading || polling}>
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

          {/* Phone Input */}
          <div className="space-y-1.5">
            <Label className="text-sm">Mobile Money Number *</Label>
            <div className="relative">
              <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                className="bg-input border-border pl-10"
                placeholder="0962 267 118"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                disabled={loading || polling}
              />
            </div>
            <p className="text-xs text-muted-foreground">Enter your Airtel or MTN mobile money number</p>
          </div>

          {/* Amount */}
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/30 text-center">
            <div className="text-xs text-muted-foreground mb-1">{votes} vote{parseInt(votes) > 1 ? 's' : ''} × {currency}{fee} each</div>
            <div className="text-2xl font-bold text-gradient-gold">{currency}{total.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-1">Total Amount to Pay</div>
          </div>

          {/* Payment Info */}
          <div className="p-3 rounded-lg bg-muted border border-border text-xs text-muted-foreground space-y-1">
            <div className="font-medium text-foreground text-xs">Payment Information</div>
            <p>After clicking "Pay Now", you will receive a prompt on your phone to enter your PIN and complete the payment.</p>
          </div>

          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={onClose} disabled={loading || polling}>Cancel</Button>
            <Button
              className="flex-1 bg-gradient-gold text-primary-foreground font-semibold"
              onClick={handleSubmit}
              disabled={loading || polling}
            >
              {loading || polling ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Star className="w-4 h-4 mr-2" />
              )}
              {polling ? 'Processing...' : 'Pay Now'}
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
