import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getVotersLeaderboard } from '@/lib/api';
import PublicLayout from '@/components/layouts/PublicLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, ChevronLeft, ChevronRight, Crown } from 'lucide-react';
import GoldLoader from '@/components/common/GoldLoader';

export default function VotersLeaderboardPage() {
  const [voters, setVoters] = useState<{ user_id: string; full_name: string; email: string; total_votes: number; total_amount: number }[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  const fetchVoters = async () => {
    setLoading(true);
    const result = await getVotersLeaderboard(page, PAGE_SIZE);
    setVoters(result.data);
    setTotal(result.total);
    setLoading(false);
  };

  useEffect(() => { fetchVoters(); }, [page]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown className="w-5 h-5 text-primary fill-primary" />;
    if (index === 1) return <Medal className="w-5 h-5 text-muted-foreground fill-muted-foreground" />;
    if (index === 2) return <Award className="w-5 h-5 text-muted-foreground" />;
    return null;
  };

  const getRankBadge = (index: number) => {
    if (index === 0) return <Badge className="bg-gradient-gold text-primary-foreground font-bold">#1</Badge>;
    if (index === 1) return <Badge className="bg-muted text-muted-foreground font-bold">#2</Badge>;
    if (index === 2) return <Badge className="bg-muted text-muted-foreground font-bold">#3</Badge>;
    return <Badge variant="outline" className="text-muted-foreground">#{index + 1}</Badge>;
  };

  return (
    <PublicLayout>
      <div className="pt-20 min-h-screen">
        {/* Header */}
        <div className="relative py-16 text-center overflow-hidden">
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 100% at 50% -20%, rgba(201,162,39,0.15), transparent 70%)' }} />
          <div className="relative z-10 container mx-auto px-4">
            <Badge className="mb-4 bg-primary/15 text-primary border-primary/30">Top Voters</Badge>
            <h1 className="text-3xl md:text-5xl font-black text-gradient-gold mb-3" style={{ fontFamily: 'Cinzel, serif' }}>Voters Leaderboard</h1>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">Celebrating our most dedicated supporters</p>
          </div>
        </div>

        <div className="container mx-auto px-4 pb-16">
          {/* Results info */}
          <div className="text-sm text-muted-foreground mb-6">
            {loading ? 'Loading...' : `${total} voter${total !== 1 ? 's' : ''} ranked by votes cast`}
          </div>

          {/* Leaderboard */}
          {loading ? (
            <GoldLoader text="Loading leaderboard..." />
          ) : voters.length === 0 ? (
            <div className="text-center py-20">
              <Trophy className="w-16 h-16 text-primary/20 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-muted-foreground">No voters yet</h3>
              <p className="text-sm text-muted-foreground mt-1">Be the first to vote!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {voters.map((voter, index) => (
                <motion.div
                  key={voter.user_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`glass-card rounded-xl p-4 flex items-center gap-4 ${index < 3 ? 'border-primary/50' : ''}`}
                >
                  {/* Rank */}
                  <div className="flex items-center justify-center w-12 h-12 shrink-0">
                    {getRankIcon(index) || <div className="text-lg font-bold text-muted-foreground">#{index + 1}</div>}
                  </div>

                  {/* Voter Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{voter.full_name}</span>
                      {getRankBadge(index)}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{voter.email}</div>
                  </div>

                  {/* Stats */}
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 justify-end">
                      <Trophy className="w-4 h-4 text-primary fill-primary" />
                      <span className="text-lg font-bold text-primary">{voter.total_votes.toLocaleString()}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">votes cast</div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
              <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
