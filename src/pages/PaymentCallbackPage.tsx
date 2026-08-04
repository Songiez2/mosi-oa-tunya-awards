import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PublicLayout from '@/components/layouts/PublicLayout';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { verifyVotingPayment } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

type Phase = 'loading' | 'success' | 'pending' | 'error' | 'failed';

export default function PaymentCallbackPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [phase, setPhase] = useState<Phase>('loading');
  const [message, setMessage] = useState('Confirming your Lipila payment…');
  const [ref, setRef] = useState<string | null>(null);
  const [votes, setVotes] = useState<number | null>(null);

  useEffect(() => {
    if (authLoading) return;

    const paymentId = params.get('payment_id') || undefined;
    const reference = params.get('reference') || undefined;

    if (!paymentId && !reference) {
      setPhase('error');
      setMessage('Missing payment reference.');
      return;
    }

    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 40;

    const check = async () => {
      try {
        const result = await verifyVotingPayment({ payment_id: paymentId, reference });
        if (cancelled) return;
        setRef(result.transaction_ref);
        setVotes(result.votes_count ?? null);

        if (result.status === 'approved') {
          setPhase('success');
          setMessage('Payment confirmed. Your votes have been added.');
          return true;
        }
        if (result.status === 'failed') {
          setPhase('failed');
          setMessage(result.error || 'Payment failed. Please try again.');
          return true;
        }

        setPhase('pending');
        setMessage('Waiting for Lipila confirmation. Approve the prompt on your phone if asked.');
        return false;
      } catch (err) {
        if (cancelled) return true;
        attempts += 1;
        if (attempts >= 3) {
          setPhase('error');
          setMessage(err instanceof Error ? err.message : 'Could not verify payment.');
          return true;
        }
        return false;
      }
    };

    let timer: ReturnType<typeof setTimeout> | undefined;
    const loop = async () => {
      const done = await check();
      attempts += 1;
      if (!done && !cancelled && attempts < maxAttempts) {
        timer = setTimeout(loop, 3000);
      } else if (!done && !cancelled) {
        setPhase('pending');
        setMessage('Still processing. Votes will appear automatically once Lipila confirms payment.');
      }
    };
    loop();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [authLoading, user, params, navigate]);

  const Icon =
    phase === 'success' ? CheckCircle :
    phase === 'pending' || phase === 'loading' ? (phase === 'loading' ? Loader2 : Clock) :
    XCircle;

  return (
    <PublicLayout>
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="glass-card rounded-xl p-8 text-center space-y-4">
          <Icon className={`w-12 h-12 mx-auto ${phase === 'loading' ? 'animate-spin text-primary' : phase === 'success' ? 'text-success' : phase === 'pending' ? 'text-warning' : 'text-destructive'}`} />
          <h1 className="text-xl font-bold text-gradient-gold">Payment Status</h1>
          <p className="text-sm text-muted-foreground">{message}</p>
          {ref && <p className="text-xs font-mono text-muted-foreground">Ref: {ref}</p>}
          {votes != null && phase === 'success' && (
            <p className="text-sm text-primary font-semibold">{votes} vote{votes === 1 ? '' : 's'} added</p>
          )}
          <div className="flex gap-2 justify-center pt-2">
            <Button variant="secondary" onClick={() => navigate('/vote')}>Back to Vote</Button>
            <Button className="bg-gradient-gold text-primary-foreground" onClick={() => navigate('/profile')}>My Profile</Button>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
