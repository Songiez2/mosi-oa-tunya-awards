import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Trophy, Mail, Lock, User, Phone, Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function RegisterPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.phone || !form.password) { toast.error('Please fill in all fields'); return; }
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    const { error } = await signUp(form.email, form.password, form.fullName, form.phone);
    setLoading(false);
    if (error) { toast.error(error); return; }
    setDone(true);
  };

  if (done) return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="glass-card border-primary/20 max-w-md w-full text-center p-8">
        <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-success" />
        </div>
        <h2 className="text-xl font-bold text-gradient-gold mb-2">Check Your Email</h2>
        <p className="text-muted-foreground text-sm mb-4">We've sent a verification link to <strong className="text-foreground">{form.email}</strong>. Please verify your email before logging in.</p>
        <Button className="bg-gradient-gold text-primary-foreground" onClick={() => navigate('/login')}>Go to Login</Button>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(201,162,39,0.14) 0%, transparent 70%)' }} />
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'repeating-linear-gradient(45deg, rgba(201,162,39,0.3) 0, rgba(201,162,39,0.3) 1px, transparent 0, transparent 50%)', backgroundSize: '20px 20px' }} />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        <Card className="glass-card border-primary/20">
          <CardHeader className="text-center pb-4">
            <div className="w-14 h-14 rounded-full bg-gradient-gold flex items-center justify-center mx-auto mb-3 gold-glow">
              <Trophy className="w-7 h-7 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl font-black text-gradient-gold" style={{ fontFamily: 'Cinzel, serif' }}>Create Account</CardTitle>
            <CardDescription>Join TUNYA AWARDS and start voting</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1.5">
                <Label>Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input className="pl-9 bg-input border-border" placeholder="Your full name" value={form.fullName} onChange={set('fullName')} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input type="email" className="pl-9 bg-input border-border" placeholder="you@example.com" value={form.email} onChange={set('email')} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input className="pl-9 bg-input border-border" placeholder="0962 267 118" value={form.phone} onChange={set('phone')} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input type={showPw ? 'text' : 'password'} className="pl-9 pr-9 bg-input border-border" placeholder="At least 6 characters" value={form.password} onChange={set('password')} />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input type="password" className="pl-9 bg-input border-border" placeholder="Repeat password" value={form.confirm} onChange={set('confirm')} />
                </div>
              </div>
              <Button type="submit" className="w-full bg-gradient-gold text-primary-foreground font-bold mt-2" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Create Account
              </Button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-4">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
            </p>
            <div className="text-center mt-2">
              <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">← Back to Home</Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
