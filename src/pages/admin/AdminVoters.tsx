import React, { useEffect, useState, useCallback } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { getAllVotesAdmin } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Search, ChevronLeft, ChevronRight, Loader2, Eye, Users, Vote as VoteIcon, Trophy } from 'lucide-react';
import type { Vote } from '@/types/types';

interface VoterSummary {
  user_id: string;
  full_name: string;
  email: string;
  total_votes: number;
  vote_count: number;
  votes: Vote[];
}

export default function AdminVoters() {
  const [allVotes, setAllVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [detailVoter, setDetailVoter] = useState<VoterSummary | null>(null);
  const PAGE_SIZE = 20;

  const load = useCallback(async () => {
    setLoading(true);
    // Load all votes with user info (paginate with large page to aggregate)
    const r = await getAllVotesAdmin(1, 500);
    setAllVotes(r.data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Aggregate votes by user
  const voterMap = new Map<string, VoterSummary>();
  allVotes.forEach(v => {
    const uid = v.user_id ?? 'anonymous';
    const profile = v.profiles as { full_name?: string; email?: string } | null;
    const name = profile?.full_name ?? 'Unknown User';
    const email = profile?.email ?? '';
    const existing = voterMap.get(uid);
    if (existing) {
      existing.total_votes += (v.votes_count ?? 1);
      existing.vote_count += 1;
      existing.votes.push(v);
    } else {
      voterMap.set(uid, { user_id: uid, full_name: name, email, total_votes: v.votes_count ?? 1, vote_count: 1, votes: [v] });
    }
  });

  const voters = Array.from(voterMap.values()).sort((a, b) => b.total_votes - a.total_votes);
  const filtered = voters.filter(v =>
    v.full_name.toLowerCase().includes(search.toLowerCase()) ||
    v.email.toLowerCase().includes(search.toLowerCase())
  );
  const pages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div>
            <h1 className="text-lg font-black text-gradient-gold">Voters</h1>
            <p className="text-xs text-muted-foreground">{filtered.length} voters • {allVotes.reduce((s, v) => s + (v.votes_count ?? 1), 0).toLocaleString()} total votes</p>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input className="pl-8 h-8 text-sm w-52 bg-input border-border" placeholder="Search voter..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-card rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-xl font-black text-gradient-gold">{voters.length}</div>
              <div className="text-xs text-muted-foreground">Total Voters</div>
            </div>
          </div>
          <div className="glass-card rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <VoteIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-xl font-black text-gradient-gold">{allVotes.reduce((s, v) => s + (v.votes_count ?? 1), 0).toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Total Votes Cast</div>
            </div>
          </div>
          <div className="glass-card rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <Trophy className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-xl font-black text-gradient-gold">{voters[0]?.full_name ?? '—'}</div>
              <div className="text-xs text-muted-foreground">Top Voter</div>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-left text-xs text-muted-foreground">
                  {['Rank', 'Voter', 'Email', 'Total Votes Cast', 'Transactions', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 whitespace-nowrap font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-10"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></td></tr>
                ) : paginated.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-10 text-muted-foreground text-sm">No voters found</td></tr>
                ) : paginated.map((v, i) => {
                  const rank = (page - 1) * PAGE_SIZE + i + 1;
                  return (
                    <tr key={v.user_id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        {rank <= 3 ? (
                          <Badge className={`text-xs font-bold ${rank === 1 ? 'bg-primary/20 text-primary border-primary/40' : rank === 2 ? 'bg-muted text-muted-foreground' : 'bg-orange-500/20 text-orange-400 border-orange-500/40'}`}>
                            #{rank}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground px-2">#{rank}</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                            <span className="text-[10px] font-bold text-primary">{v.full_name[0]?.toUpperCase()}</span>
                          </div>
                          <span className="text-sm font-medium">{v.full_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-xs text-muted-foreground">{v.email}</td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <span className="text-sm font-bold text-primary">{v.total_votes.toLocaleString()}</span>
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-xs text-muted-foreground">{v.vote_count}</td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setDetailVoter(v)} title="View voting history">
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {pages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft className="w-4 h-4" /></Button>
            <span className="text-xs text-muted-foreground">Page {page} of {pages}</span>
            <Button variant="secondary" size="sm" disabled={page >= pages} onClick={() => setPage(p => p + 1)}><ChevronRight className="w-4 h-4" /></Button>
          </div>
        )}
      </div>

      {/* Voter Detail Dialog */}
      <Dialog open={!!detailVoter} onOpenChange={() => setDetailVoter(null)}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-2xl max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-gradient-gold flex items-center gap-2">
              <Users className="w-4 h-4" />
              {detailVoter?.full_name} — Voting History
            </DialogTitle>
          </DialogHeader>
          {detailVoter && (
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="glass-card rounded-lg p-3 text-center flex-1">
                  <div className="text-xl font-black text-gradient-gold">{detailVoter.total_votes}</div>
                  <div className="text-xs text-muted-foreground">Total Votes</div>
                </div>
                <div className="glass-card rounded-lg p-3 text-center flex-1">
                  <div className="text-xl font-black text-primary">{detailVoter.vote_count}</div>
                  <div className="text-xs text-muted-foreground">Transactions</div>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Vote Transactions</h3>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-max text-sm">
                    <thead>
                      <tr className="border-b border-border text-xs text-muted-foreground text-left">
                        <th className="py-2 pr-4 whitespace-nowrap">Date</th>
                        <th className="py-2 pr-4 whitespace-nowrap">Nominee</th>
                        <th className="py-2 pr-4 whitespace-nowrap">Category</th>
                        <th className="py-2 pr-4 whitespace-nowrap">Votes</th>
                        <th className="py-2 whitespace-nowrap">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailVoter.votes.map(v => (
                        <tr key={v.id} className="border-b border-border/30">
                          <td className="py-2 pr-4 whitespace-nowrap text-xs text-muted-foreground">{new Date(v.created_at).toLocaleDateString()}</td>
                          <td className="py-2 pr-4 whitespace-nowrap text-xs font-medium">
                            {(v.nominees as { full_name?: string; stage_name?: string } | null)?.stage_name ||
                             (v.nominees as { full_name?: string } | null)?.full_name || '—'}
                          </td>
                          <td className="py-2 pr-4 whitespace-nowrap text-xs text-muted-foreground">
                            {(v.categories as { name?: string } | null)?.name ?? '—'}
                          </td>
                          <td className="py-2 pr-4 whitespace-nowrap text-xs font-bold text-primary">{v.votes_count ?? 1}</td>
                          <td className="py-2 whitespace-nowrap">
                            <Badge variant="secondary" className="text-[10px] h-4 px-1.5 capitalize">
                              verified
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
