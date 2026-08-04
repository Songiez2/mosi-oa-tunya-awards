import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/db/supabase';
import PublicLayout from '@/components/layouts/PublicLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Mail, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast.error('Please enter your email'); return; }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    setSent(true);
    toast.success('Password reset email sent!');
  };

  return (
    <PublicLayout>
      <div className="pt-20 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="glass-card rounded-2xl p-8 text-center">
            {sent ? (
              <>
                <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
                <h2 className="text-xl font-black text-gradient-gold mb-2">Email Sent!</h2>
                <p className="text-muted-foreground text-sm mb-6">
                  Check your inbox for a password reset link. It may take a few minutes.
                </p>
                <Button variant="secondary" className="w-full" onClick={() => navigate('/login')}>
                  Back to Login
                </Button>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-full bg-gradient-gold flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-7 h-7 text-primary-foreground" />
                </div>
                <Badge className="mb-3 bg-primary/15 text-primary border-primary/30">Account Recovery</Badge>
                <h2 className="text-xl font-black text-gradient-gold mb-2">Forgot Password?</h2>
                <p className="text-muted-foreground text-sm mb-6">
                  Enter your email address and we'll send you a reset link.
                </p>
                <form onSubmit={handleSubmit} className="space-y-4 text-left">
                  <div className="space-y-1.5">
                    <Label>Email Address</Label>
                    <Input
                      type="email"
                      className="bg-input border-border"
                      placeholder="you@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-gradient-gold text-primary-foreground font-bold" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4 mr-2" />}
                    Send Reset Link
                  </Button>
                </form>
                <button onClick={() => navigate('/login')} className="mt-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mx-auto">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
