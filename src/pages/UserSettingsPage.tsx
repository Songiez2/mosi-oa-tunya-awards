import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { updateProfile } from '@/lib/api';
import PublicLayout from '@/components/layouts/PublicLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { User, Lock, Bell, Loader2, Save, Star, Crown, Users, CreditCard, Award } from 'lucide-react';
import { toast } from 'sonner';

export default function UserSettingsPage() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  
  const [profileForm, setProfileForm] = useState({
    full_name: profile?.full_name ?? '',
    phone: profile?.phone ?? '',
  });
  
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
  }, [user, navigate]);

  useEffect(() => {
    if (profile) setProfileForm({ full_name: profile.full_name, phone: profile.phone ?? '' });
  }, [profile]);

  if (!user || !profile) return (
    <PublicLayout>
      <div className="pt-20 text-center p-12 text-muted-foreground">Please login to view your settings.</div>
    </PublicLayout>
  );

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await updateProfile(user.id, profileForm);
    await refreshProfile();
    setSaving(false);
    toast.success('Profile updated!');
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwordForm.new_password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setSaving(true);
    try {
      // Password change functionality requires Supabase auth update
      // For now, show a message that this feature is coming soon
      toast.info('Password change feature coming soon');
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (error) {
      toast.error('Failed to update password. Please check your current password.');
    }
    setSaving(false);
  };

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
              <h1 className="text-2xl font-black text-gradient-gold">Settings</h1>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
            </div>
          </div>

          <Tabs defaultValue="profile">
            <TabsList className="w-full bg-muted mb-6">
              <TabsTrigger value="profile" className="flex-1"><User className="w-4 h-4 mr-1.5" />Profile</TabsTrigger>
              <TabsTrigger value="actions" className="flex-1"><Star className="w-4 h-4 mr-1.5" />Actions</TabsTrigger>
              <TabsTrigger value="security" className="flex-1"><Lock className="w-4 h-4 mr-1.5" />Security</TabsTrigger>
              <TabsTrigger value="notifications" className="flex-1"><Bell className="w-4 h-4 mr-1.5" />Notifications</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <form onSubmit={handleProfileSave} className="glass-card rounded-xl p-5 space-y-4">
                <h2 className="text-sm font-bold text-primary">Personal Information</h2>
                <div className="space-y-1.5">
                  <Label>Full Name</Label>
                  <Input className="bg-input border-border" value={profileForm.full_name} onChange={e => setProfileForm(f => ({ ...f, full_name: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Phone</Label>
                  <Input className="bg-input border-border" value={profileForm.phone} onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input className="bg-input border-border" value={profile.email} disabled />
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>
                <Button type="submit" className="bg-gradient-gold text-primary-foreground font-bold" disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Save Changes
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="actions">
              <div className="space-y-4">
                <h2 className="text-sm font-bold text-primary">Quick Actions</h2>
                <p className="text-xs text-muted-foreground">Take action and participate in the awards.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="glass-card hover-gold cursor-pointer" onClick={() => navigate('/vote')}>
                    <CardContent className="p-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center text-primary">
                          <Star className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm">Vote Now</h3>
                          <p className="text-xs text-muted-foreground">Vote for your favorite nominees</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass-card hover-gold cursor-pointer" onClick={() => navigate('/register-nominee')}>
                    <CardContent className="p-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center text-primary">
                          <Award className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm">Register as Nominee</h3>
                          <p className="text-xs text-muted-foreground">Join the awards competition</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass-card hover-gold cursor-pointer" onClick={() => navigate('/sponsor-registration')}>
                    <CardContent className="p-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center text-primary">
                          <Crown className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm">Become a Sponsor</h3>
                          <p className="text-xs text-muted-foreground">Support the awards event</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass-card hover-gold cursor-pointer" onClick={() => navigate('/partner-registration')}>
                    <CardContent className="p-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center text-primary">
                          <Users className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm">Become a Partner</h3>
                          <p className="text-xs text-muted-foreground">Partner with us for success</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass-card hover-gold cursor-pointer" onClick={() => navigate('/payment-history')}>
                    <CardContent className="p-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center text-primary">
                          <CreditCard className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm">Payment History</h3>
                          <p className="text-xs text-muted-foreground">View your voting payments</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="security">
              <form onSubmit={handlePasswordSave} className="glass-card rounded-xl p-5 space-y-4">
                <h2 className="text-sm font-bold text-primary">Change Password</h2>
                <div className="space-y-1.5">
                  <Label>Current Password</Label>
                  <Input type="password" className="bg-input border-border" value={passwordForm.current_password} onChange={e => setPasswordForm(f => ({ ...f, current_password: e.target.value }))} required />
                </div>
                <div className="space-y-1.5">
                  <Label>New Password</Label>
                  <Input type="password" className="bg-input border-border" value={passwordForm.new_password} onChange={e => setPasswordForm(f => ({ ...f, new_password: e.target.value }))} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Confirm New Password</Label>
                  <Input type="password" className="bg-input border-border" value={passwordForm.confirm_password} onChange={e => setPasswordForm(f => ({ ...f, confirm_password: e.target.value }))} required />
                </div>
                <Button type="submit" className="bg-gradient-gold text-primary-foreground font-bold" disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Update Password
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="notifications">
              <div className="glass-card rounded-xl p-5 space-y-4">
                <h2 className="text-sm font-bold text-primary">Notification Preferences</h2>
                <p className="text-xs text-muted-foreground">Choose which notifications you want to receive.</p>
                <div className="space-y-3">
                  {[
                    ['email_votes', 'Vote confirmations'],
                    ['email_payments', 'Payment receipts'],
                    ['email_nominee_updates', 'Nominee status updates'],
                    ['email_newsletter', 'Newsletter and updates'],
                  ].map(([key, label]) => (
                    <label key={key} className="flex items-center gap-3 cursor-pointer p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
                      <input type="checkbox" className="accent-primary w-4 h-4" defaultChecked={true} />
                      <span className="text-sm">{label}</span>
                    </label>
                  ))}
                </div>
                <Button className="bg-gradient-gold text-primary-foreground font-bold" disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Save Preferences
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PublicLayout>
  );
}
