import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { getDashboardStats, getAllNomineesAdmin, getAllPaymentsAdmin, getAllVotesAdmin, getAllUsersAdmin, getAllSponsorsAdmin, getAllPartnersAdmin } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import { Loader2, Download, TrendingUp, Users, Star, CreditCard, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import type { DashboardStats } from '@/types/types';

const GOLD = 'hsl(43 82% 47%)';
const GOLD2 = 'hsl(43 82% 65%)';
const COLORS = [GOLD, GOLD2, '#a78027', '#d4b05a', '#f0d080'];

function exportCSV(rows: Record<string, unknown>[], filename: string) {
  if (!rows.length) { toast.error('No data to export'); return; }
  const headers = Object.keys(rows[0]);
  const csv = [headers.join(','), ...rows.map(r => headers.map(h => JSON.stringify(r[h] ?? '')).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
  toast.success('Exported!');
}

export default function AdminReports() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState('');
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    getDashboardStats().then(s => { setStats(s); setLoading(false); });
  }, []);

  const handleExport = async (type: string) => {
    setExporting(type);
    try {
      if (type === 'users') {
        const r = await getAllUsersAdmin(1, 9999);
        exportCSV(r.data.map(u => ({ id: u.id, full_name: u.full_name, email: u.email, phone: u.phone ?? '', role: u.role, suspended: u.is_suspended, created_at: u.created_at })), 'users_report.csv');
      } else if (type === 'nominees') {
        const r = await getAllNomineesAdmin(1, 9999);
        exportCSV(r.data.map(n => ({ id: n.id, full_name: n.full_name, stage_name: n.stage_name ?? '', category: (n.categories as { name?: string } | null)?.name ?? '', status: n.status, vote_count: n.vote_count, created_at: n.created_at })), 'nominees_report.csv');
      } else if (type === 'payments') {
        const r = await getAllPaymentsAdmin(1, 9999);
        exportCSV(r.data.map(p => ({ id: p.id, user_id: p.user_id, payment_type: p.payment_type, amount: p.amount, status: p.status, transaction_ref: p.transaction_ref, created_at: p.created_at })), 'payments_report.csv');
      } else if (type === 'votes') {
        const r = await getAllVotesAdmin(1, 9999);
        exportCSV(r.data.map(v => ({ id: v.id, user_id: v.user_id, nominee_id: v.nominee_id, votes_count: v.votes_count, created_at: v.created_at })), 'votes_report.csv');
      } else if (type === 'sponsors') {
        const r = await getAllSponsorsAdmin(1, 9999);
        exportCSV(r.data.map(s => ({ id: s.id, company_name: s.company_name, rep_name: s.rep_name, email: s.email, phone: s.phone, package: s.package, status: s.status, created_at: s.created_at })), 'sponsors_report.csv');
      } else if (type === 'partners') {
        const r = await getAllPartnersAdmin(1, 9999);
        exportCSV(r.data.map(p => ({ id: p.id, org_name: p.org_name, rep_name: p.rep_name, email: p.email, phone: p.phone, status: p.status, created_at: p.created_at })), 'partners_report.csv');
      }
    } finally {
      setExporting('');
    }
  };

  const summaryCards = stats ? [
    { label: 'Total Revenue', value: `K${stats.total_revenue.toLocaleString()}`, icon: TrendingUp },
    { label: 'Total Votes', value: stats.total_votes.toLocaleString(), icon: Star },
    { label: 'Total Users', value: stats.total_users.toLocaleString(), icon: Users },
    { label: 'Total Nominees', value: stats.total_nominees.toLocaleString(), icon: BarChart3 },
    { label: 'Pending Payments', value: stats.pending_payments.toLocaleString(), icon: CreditCard },
    { label: 'Approved Payments', value: stats.approved_payments.toLocaleString(), icon: CreditCard },
  ] : [];

  const EXPORTS = [
    { key: 'users', label: 'Users Report' },
    { key: 'nominees', label: 'Nominees Report' },
    { key: 'payments', label: 'Payments Report' },
    { key: 'votes', label: 'Votes Report' },
    { key: 'sponsors', label: 'Sponsors Report' },
    { key: 'partners', label: 'Partners Report' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div>
          <h1 className="text-lg font-black text-gradient-gold">Reports & Analytics</h1>
          <p className="text-xs text-muted-foreground">Overview statistics and CSV exports</p>
        </div>

        {loading ? (
          <div className="text-center py-16"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></div>
        ) : (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {summaryCards.map(({ label, value, icon: Icon }) => (
                <div key={label} className="glass-card rounded-xl p-4 flex flex-col gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-xl font-black text-gradient-gold">{value}</div>
                  <div className="text-[10px] text-muted-foreground">{label}</div>
                </div>
              ))}
            </div>

            {/* Charts */}
            {stats && stats.votes_by_category.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="glass-card rounded-xl p-4">
                  <h3 className="text-sm font-bold mb-3">Votes by Category</h3>
                  <div className="w-full min-w-0 overflow-hidden">
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={stats.votes_by_category.slice(0, 10)} margin={{ top: 0, right: 0, left: -20, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="category" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} angle={-45} textAnchor="end" />
                        <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                        <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '11px' }} />
                        <Bar dataKey="votes" fill={GOLD} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="glass-card rounded-xl p-4">
                  <h3 className="text-sm font-bold mb-3">Monthly Revenue</h3>
                  <div className="w-full min-w-0 overflow-hidden">
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={stats.monthly_revenue} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                        <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                        <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '11px' }} />
                        <Line type="monotone" dataKey="revenue" stroke={GOLD} strokeWidth={2} dot={{ fill: GOLD, r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {stats.votes_by_category.length > 0 && (
                  <div className="glass-card rounded-xl p-4 lg:col-span-2">
                    <h3 className="text-sm font-bold mb-3">Vote Distribution (Top 5)</h3>
                    <div className="w-full min-w-0 overflow-hidden">
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie data={stats.votes_by_category.slice(0, 5)} cx="50%" cy="50%" outerRadius={75} dataKey="votes" nameKey="category" label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                            {stats.votes_by_category.slice(0, 5).map((_entry, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                          </Pie>
                          <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '11px' }} />
                          <Legend layout="horizontal" wrapperStyle={{ paddingTop: 8, fontSize: '11px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Export section */}
            <div className="glass-card rounded-xl p-5">
              <h2 className="text-sm font-bold text-primary mb-4">Export Reports (CSV)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {EXPORTS.map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-muted border border-border">
                    <span className="text-sm font-medium">{label}</span>
                    <Button size="sm" variant="secondary" className="h-7 text-xs gap-1" disabled={exporting === key} onClick={() => handleExport(key)}>
                      {exporting === key ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />} CSV
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
