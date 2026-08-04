import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserVotes } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import PublicLayout from '@/components/layouts/PublicLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Trophy, Star, Calendar, Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Vote } from '@/types/types';

export default function VotingHistoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filteredVotes, setFilteredVotes] = useState<Vote[]>([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchVotes = async () => {
      setLoading(true);
      try {
        const data = await getUserVotes(user.id);
        setVotes(data);
        setFilteredVotes(data);
      } catch (error) {
        toast.error('Failed to load voting history');
      }
      setLoading(false);
    };

    fetchVotes();
  }, [user, navigate]);

  useEffect(() => {
    if (search) {
      const filtered = votes.filter(v => 
        (v.nominees as { full_name?: string; stage_name?: string } | null)?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        (v.nominees as { full_name?: string; stage_name?: string } | null)?.stage_name?.toLowerCase().includes(search.toLowerCase()) ||
        (v.categories as { name?: string } | null)?.name?.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredVotes(filtered);
    } else {
      setFilteredVotes(votes);
    }
  }, [search, votes]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) return null;

  return (
    <PublicLayout>
      <div className="pt-20 min-h-screen container mx-auto px-4 pb-16 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-gradient-gold mb-2">Voting History</h1>
          <p className="text-sm text-muted-foreground">Track all your votes and support for nominees</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Trophy className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{votes.reduce((sum, v) => sum + (v.votes_count || 0), 0)}</div>
                <div className="text-xs text-muted-foreground">Total Votes Cast</div>
              </div>
            </div>
          </div>
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Star className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{votes.length}</div>
                <div className="text-xs text-muted-foreground">Nominees Supported</div>
              </div>
            </div>
          </div>
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{new Set(votes.map(v => new Date(v.created_at).toDateString())).size}</div>
                <div className="text-xs text-muted-foreground">Days Active</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="glass-card rounded-xl p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-9 bg-input border-border"
              placeholder="Search by nominee name or category..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Votes List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredVotes.length === 0 ? (
          <div className="glass-card rounded-xl p-12 text-center">
            <Trophy className="w-16 h-16 text-primary/20 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-muted-foreground mb-2">
              {search ? 'No votes found' : 'No votes yet'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {search ? 'Try adjusting your search' : 'Start voting for your favorite nominees!'}
            </p>
            {!search && (
              <Button className="bg-gradient-gold text-primary-foreground font-bold" onClick={() => navigate('/vote')}>
                Vote Now
              </Button>
            )}
          </div>
        ) : (
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-left text-xs text-muted-foreground">
                    <th className="px-4 py-3 font-semibold">Date</th>
                    <th className="px-4 py-3 font-semibold">Nominee</th>
                    <th className="px-4 py-3 font-semibold">Category</th>
                    <th className="px-4 py-3 font-semibold">Votes</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVotes.map((vote) => (
                    <tr key={vote.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">
                        {formatDate(vote.created_at)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="font-medium text-sm">
                            {(vote.nominees as { full_name?: string } | null)?.full_name || 'Unknown'}
                          </div>
                          {(vote.nominees as { stage_name?: string } | null)?.stage_name && (
                            <Badge variant="outline" className="text-[10px]">
                              "{(vote.nominees as { stage_name?: string } | null)?.stage_name}"
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">
                        {(vote.categories as { name?: string } | null)?.name || '—'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                          <span className="text-sm font-bold text-primary">{vote.votes_count}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
