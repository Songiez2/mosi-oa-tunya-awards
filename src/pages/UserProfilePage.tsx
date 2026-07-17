import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getUserPayments, getUserVotes, updateProfile } from '@/lib/api';
import PublicLayout from '@/components/layouts/PublicLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Star, CreditCard, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { Payment, Vote } from '@/types/types';

export default function UserProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ full_name: profile?.full_name ?? '', phone: profile?.phone ?? '' });

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (user) {
      getUserPayments(user.id).then(setPayments);
      getUserVotes(user.id).then(setVotes);
    }
  }, [user, navigate]);

  useEffect(() => {
    if (profile) setForm({ full_name: profile.full_name, phone: profile.phone ?? '' });
  }, [profile]);

  if (!user || !profile) return (
    <PublicLayout>
      <div className="pt-20 text-center p-12 text-muted-foreground">Please login to view your profile.</div>
    </PublicLayout>
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await updateProfile(user.id, form);
    await refreshProfile();
    setSaving(false);
    toast.success('Profile updated!');
  };

  const totalVotes = votes.reduce((s, v) => s + v.votes_count, 0);
  const totalSpent = payments.filter(p => p.status === 'approved').reduce((s, p) => s + p.amount, 0);

  return (
    <PublicLayout>
      <div className="pt-20 min-h-screen">
        <div className="container mx-auto px-4 py-12 max-w-3xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="bg-gradient-gold text-primary-foreground text-2xl font-black">
                {profile.full_name[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-black text-gradient-gold">{profile.full_name}</h1>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
              <Badge className="mt-1 bg-primary/15 text-primary border-primary/30 text-xs capitalize">{profile.role}</Badge>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Total Votes', value: totalVotes.toLocaleString(), icon: <Star className="w-4 h-4" /> },
              { label: 'Total Payments', value: payments.length, icon: <CreditCard className="w-4 h-4" /> },
              { label: 'Amount Spent', value: `K${totalSpent.toLocaleString()}`, icon: <CheckCircle className="w-4 h-4" /> },
            ].map(s => (
              <div key={s.label} className="glass-card rounded-xl p-4 text-center">
                <div className="text-primary flex justify-center mb-1">{s.icon}</div>
                <div className="text-xl font-black text-gradient-gold">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>

          <Tabs defaultValue="profile">
            <TabsList className="w-full bg-muted mb-6">
              <TabsTrigger value="profile" className="flex-1"><User className="w-4 h-4 mr-1.5" />Profile</TabsTrigger>
              <TabsTrigger value="votes" className="flex-1"><Star className="w-4 h-4 mr-1.5" />Votes ({votes.length})</TabsTrigger>
              <TabsTrigger value="payments" className="flex-1"><CreditCard className="w-4 h-4 mr-1.5" />Payments ({payments.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <form onSubmit={handleSave} className="glass-card rounded-xl p-5 space-y-4">
                <div className="space-y-1.5">
                  <Label>Full Name</Label>
                  <Input className="bg-input border-border" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Phone</Label>
                  <Input className="bg-input border-border" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input className="bg-input border-border" value={profile.email} disabled />
                </div>
                <Button type="submit" className="bg-gradient-gold text-primary-foreground font-bold" disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null} Save Changes
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="votes">
              <div className="space-y-3">
                {votes.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground"><Star className="w-10 h-10 mx-auto mb-2 text-primary/20" />No votes cast yet</div>
                ) : votes.map(v => (
                  <div key={v.id} className="glass-card rounded-xl p-4 flex items-center gap-4">
                    <Star className="w-5 h-5 text-primary shrink-0 fill-primary" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{(v.nominees as { full_name?: string } | null)?.full_name ?? 'Unknown'}</div>
                      <div className="text-xs text-muted-foreground">{(v.categories as { name?: string } | null)?.name ?? ''}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-primary">{v.votes_count}</div>
                      <div className="text-xs text-muted-foreground">votes</div>
                    </div>
                    <div className="text-xs text-muted-foreground shrink-0 hidden md:block">{new Date(v.created_at).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="payments">
              <div className="space-y-3">
                {payments.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground"><CreditCard className="w-10 h-10 mx-auto mb-2 text-primary/20" />No payments yet</div>
                ) : payments.map(p => (
                  <div key={p.id} className="glass-card rounded-xl p-4 flex items-center gap-4">
                    <CreditCard className="w-5 h-5 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm capitalize">{p.payment_type}</div>
                      <div className="text-xs text-muted-foreground font-mono">{p.transaction_ref}</div>
                    </div>
                    <div className="font-bold text-sm">K{p.amount.toLocaleString()}</div>
                    <StatusBadge status={p.status} />
                    <div className="text-xs text-muted-foreground shrink-0 hidden md:block">{new Date(p.created_at).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PublicLayout>
  );
}
