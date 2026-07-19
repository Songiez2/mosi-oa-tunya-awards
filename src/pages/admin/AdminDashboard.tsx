import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { getDashboardStats, getVotesByCategory, getTopNominees } from '@/lib/api';
import { supabase } from '@/db/supabase';
import { useSettings } from '@/contexts/SettingsContext';
import { CountUp } from '@/components/common/CountUp';
import GoldLoader from '@/components/common/GoldLoader';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  Users, Star, Tag, Trophy, TrendingUp, Calendar, CreditCard,
  Clock, CheckCircle, Building2, Handshake, RefreshCw
} from 'lucide-react';
import type { DashboardStats, Nominee } from '@/types/types';
import { Button } from '@/components/ui/button';

const GOLD_COLORS = ['#C9A227', '#F5D26B', '#8B6914', '#E8B94B', '#A07720'];

function StatCard({ icon, label, value, sub, color = 'text-primary' }: {
  icon: React.ReactNode; label: string; value: number; sub?: string; color?: string;
}) {
  return (
    <div className="glass-card rounded-xl p-4 flex items-start gap-3 hover-gold">
      <div className={`w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 ${color}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground truncate">{label}</div>
        <div className="text-xl font-black text-gradient-gold">
          <CountUp end={value} />
        </div>
        {sub && <div className="text-[10px] text-muted-foreground">{sub}</div>}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { settings } = useSettings();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [votesByCategory, setVotesByCategory] = useState<{ name: string; votes: number }[]>([]);
  const [topNominees, setTopNominees] = useState<Nominee[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const currency = settings.currency ?? 'K';

  const load = async () => {
    setLoading(true);
    const [s, vc, tn, rp] = await Promise.all([
      getDashboardStats(),
      getVotesByCategory(),
      getTopNominees(8),
      supabase.from('payments').select('*, profiles:user_id(full_name), nominees:nominee_id(full_name)').order('created_at', { ascending: false }).limit(5),
    ]);
    setStats(s);
    setVotesByCategory(vc);
    setTopNominees(tn);
    setRecentActivity(rp.data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // Generate mock trend data for demo charts
  const monthlyRevenue = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'].map((m, i) => ({
    month: m,
    revenue: Math.floor(Math.random() * 5000 + 1000 + i * 500),
  }));

  const dailyVotes = Array.from({ length: 7 }, (_, i) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
    votes: Math.floor(Math.random() * 200 + 50),
  }));

  if (loading) return <AdminLayout><GoldLoader /></AdminLayout>;

  const s = stats!;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-gradient-gold">Dashboard</h1>
            <p className="text-xs text-muted-foreground">TUNYA AWARDS 2026 — Live Overview</p>
          </div>
          <Button variant="secondary" size="sm" onClick={load} className="gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <StatCard icon={<Users className="w-5 h-5" />} label="Total Users" value={s.total_users} />
          <StatCard icon={<Star className="w-5 h-5" />} label="Total Nominees" value={s.total_nominees} />
          <StatCard icon={<Tag className="w-5 h-5" />} label="Active Categories" value={s.total_categories} />
          <StatCard icon={<Trophy className="w-5 h-5" />} label="Total Votes" value={s.total_votes} />
          <StatCard icon={<TrendingUp className="w-5 h-5" />} label="Total Revenue" value={s.total_revenue} sub={`${currency}${s.total_revenue.toLocaleString()}`} />
          <StatCard icon={<Calendar className="w-5 h-5" />} label="Today's Votes" value={s.today_votes} />
          <StatCard icon={<CreditCard className="w-5 h-5" />} label="Today's Revenue" value={s.today_revenue} sub={`${currency}${s.today_revenue.toLocaleString()}`} />
          <StatCard icon={<Clock className="w-5 h-5" />} label="Pending Payments" value={s.pending_payments} color="text-warning" />
          <StatCard icon={<CheckCircle className="w-5 h-5" />} label="Approved Payments" value={s.approved_payments} color="text-success" />
          <StatCard icon={<Building2 className="w-5 h-5" />} label="Sponsors" value={s.total_sponsors} />
          <StatCard icon={<Handshake className="w-5 h-5" />} label="Partners" value={s.total_partners} />
        </div>

        {/* Charts Row 1 */}
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Votes by Category */}
          <div className="glass-card rounded-xl p-4">
            <h2 className="font-bold text-sm mb-4 text-gradient-gold">Votes by Category</h2>
            <div className="w-full min-w-0 overflow-hidden">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={votesByCategory} margin={{ left: -20, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,162,39,0.1)" />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#9b8b6a' }} angle={-35} textAnchor="end" height={50} />
                  <YAxis tick={{ fontSize: 10, fill: '#9b8b6a' }} />
                  <Tooltip contentStyle={{ background: '#1C1C1C', border: '1px solid rgba(201,162,39,0.3)', borderRadius: 8, fontSize: 11 }} />
                  <Bar dataKey="votes" fill="#C9A227" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly Revenue */}
          <div className="glass-card rounded-xl p-4">
            <h2 className="font-bold text-sm mb-4 text-gradient-gold">Monthly Revenue ({currency})</h2>
            <div className="w-full min-w-0 overflow-hidden">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={monthlyRevenue} margin={{ left: -20, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,162,39,0.1)" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9b8b6a' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#9b8b6a' }} />
                  <Tooltip contentStyle={{ background: '#1C1C1C', border: '1px solid rgba(201,162,39,0.3)', borderRadius: 8, fontSize: 11 }} />
                  <Line type="monotone" dataKey="revenue" stroke="#C9A227" strokeWidth={2} dot={{ fill: '#C9A227', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Daily Votes */}
          <div className="glass-card rounded-xl p-4 lg:col-span-2">
            <h2 className="font-bold text-sm mb-4 text-gradient-gold">Daily Votes (This Week)</h2>
            <div className="w-full min-w-0 overflow-hidden">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={dailyVotes} margin={{ left: -20, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,162,39,0.1)" />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9b8b6a' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#9b8b6a' }} />
                  <Tooltip contentStyle={{ background: '#1C1C1C', border: '1px solid rgba(201,162,39,0.3)', borderRadius: 8, fontSize: 11 }} />
                  <Bar dataKey="votes" radius={[4, 4, 0, 0]}>
                    {dailyVotes.map((_, i) => <Cell key={i} fill={GOLD_COLORS[i % GOLD_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Distribution Pie */}
          <div className="glass-card rounded-xl p-4">
            <h2 className="font-bold text-sm mb-4 text-gradient-gold">Vote Distribution</h2>
            <div className="w-full min-w-0 overflow-hidden">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={votesByCategory.slice(0, 5)} dataKey="votes" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={false}>
                    {votesByCategory.slice(0, 5).map((_, i) => <Cell key={i} fill={GOLD_COLORS[i % GOLD_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1C1C1C', border: '1px solid rgba(201,162,39,0.3)', borderRadius: 8, fontSize: 11 }} />
                  <Legend layout="horizontal" wrapperStyle={{ paddingTop: 8, fontSize: 9 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Top Nominees */}
        <div className="glass-card rounded-xl p-4">
          <h2 className="font-bold text-sm mb-4 text-gradient-gold">Top Nominees Leaderboard</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b border-border">
                  <th className="pb-2 pr-4 whitespace-nowrap font-semibold">#</th>
                  <th className="pb-2 pr-4 whitespace-nowrap font-semibold">Nominee</th>
                  <th className="pb-2 pr-4 whitespace-nowrap font-semibold">Category</th>
                  <th className="pb-2 pr-4 whitespace-nowrap font-semibold">Votes</th>
                  <th className="pb-2 whitespace-nowrap font-semibold">Progress</th>
                </tr>
              </thead>
              <tbody>
                {topNominees.map((n, i) => {
                  const maxVotes = topNominees[0]?.vote_count || 1;
                  const pct = Math.round((n.vote_count / maxVotes) * 100);
                  return (
                    <tr key={n.id} className="border-b border-border/50 last:border-0">
                      <td className="py-2.5 pr-4 text-xs font-bold text-gradient-gold whitespace-nowrap">#{i + 1}</td>
                      <td className="py-2.5 pr-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full overflow-hidden bg-primary/20 shrink-0 flex items-center justify-center">
                            {n.profile_picture_url ? (
                              <img src={n.profile_picture_url} alt={n.full_name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-[10px] font-bold text-primary">{n.full_name[0]}</span>
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium">{n.full_name}</div>
                            {n.stage_name && <div className="text-[10px] text-muted-foreground">{n.stage_name}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 pr-4 text-xs text-muted-foreground whitespace-nowrap">{(n.categories as { name?: string } | null)?.name ?? '—'}</td>
                      <td className="py-2.5 pr-4 text-sm font-bold text-primary whitespace-nowrap">{n.vote_count.toLocaleString()}</td>
                      <td className="py-2.5 w-32">
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-gold rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity Logs */}
        <div className="glass-card rounded-xl p-4">
          <h2 className="font-bold text-sm mb-4 text-gradient-gold">Recent Transactions / Activity</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b border-border">
                  <th className="pb-2 pr-4 whitespace-nowrap font-semibold">Time</th>
                  <th className="pb-2 pr-4 whitespace-nowrap font-semibold">User</th>
                  <th className="pb-2 pr-4 whitespace-nowrap font-semibold">Action</th>
                  <th className="pb-2 pr-4 whitespace-nowrap font-semibold">Amount</th>
                  <th className="pb-2 whitespace-nowrap font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((log, i) => (
                  <tr key={i} className="border-b border-border/50 last:border-0">
                    <td className="py-2.5 pr-4 text-xs text-muted-foreground whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</td>
                    <td className="py-2.5 pr-4 text-sm whitespace-nowrap">{(log.profiles as any)?.full_name ?? 'Unknown'}</td>
                    <td className="py-2.5 pr-4 text-xs whitespace-nowrap">
                      {log.payment_type === 'voting' ? `Voted for ${(log.nominees as any)?.full_name ?? 'Nominee'}` : `Registered Nominee`}
                    </td>
                    <td className="py-2.5 pr-4 text-xs font-bold text-primary whitespace-nowrap">{currency}{log.amount.toLocaleString()}</td>
                    <td className="py-2.5 whitespace-nowrap">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${log.status === 'approved' ? 'bg-success/20 text-success' : log.status === 'rejected' ? 'bg-destructive/20 text-destructive' : 'bg-warning/20 text-warning'}`}>
                        {log.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentActivity.length === 0 && (
                  <tr><td colSpan={5} className="py-4 text-center text-xs text-muted-foreground">No recent activity found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
