import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getCategories, getNominees } from '@/lib/api';
import PublicLayout from '@/components/layouts/PublicLayout';
import NomineeCard from '@/components/common/NomineeCard';
import GoldLoader from '@/components/common/GoldLoader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trophy, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Nominee, Category } from '@/types/types';

export default function VotePage() {
  const [params, setParams] = useSearchParams();
  const [nominees, setNominees] = useState<Nominee[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 12;

  const categoryId = params.get('cat') ?? '';
  const search = params.get('q') ?? '';
  const sort = params.get('sort') ?? 'votes';

  const fetchNominees = async () => {
    setLoading(true);
    const result = await getNominees(page, PAGE_SIZE, categoryId || undefined, search, 'approved');
    setNominees(result.data);
    setTotal(result.total);
    setLoading(false);
  };

  useEffect(() => { getCategories(false).then(setCategories); }, []);
  useEffect(() => { fetchNominees(); }, [page, categoryId, search]);

  const updateParam = (key: string, val: string) => {
    const p = new URLSearchParams(params);
    if (val) p.set(key, val); else p.delete(key);
    if (key !== 'page') p.delete('page');
    setParams(p);
    setPage(1);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <PublicLayout>
      <div className="pt-20 min-h-screen">
        {/* Header */}
        <div className="relative py-16 text-center overflow-hidden">
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 100% at 50% -20%, rgba(201,162,39,0.15), transparent 70%)' }} />
          <div className="relative z-10 container mx-auto px-4">
            <Badge className="mb-4 bg-primary/15 text-primary border-primary/30">Live Voting</Badge>
            <h1 className="text-3xl md:text-5xl font-black text-gradient-gold mb-3" style={{ fontFamily: 'Cinzel, serif' }}>Vote Now</h1>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">Support your favorite nominees by voting for them</p>
          </div>
        </div>

        <div className="container mx-auto px-4 pb-16">
          {/* Filters */}
          <div className="glass-card rounded-xl p-4 mb-8 flex flex-col md:flex-row gap-3">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                className="pl-9 bg-input border-border"
                placeholder="Search nominees..."
                defaultValue={search}
                onKeyDown={e => { if (e.key === 'Enter') updateParam('q', (e.target as HTMLInputElement).value); }}
              />
            </div>
            <Select value={categoryId || 'all'} onValueChange={v => updateParam('cat', v === 'all' ? '' : v)}>
              <SelectTrigger className="w-full md:w-64 bg-input border-border">
                <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Results info */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-muted-foreground">
              {loading ? 'Loading...' : `${total} nominee${total !== 1 ? 's' : ''} found`}
            </div>
            {categoryId && categories.find(c => c.id === categoryId) && (
              <Badge className="bg-primary/15 text-primary border-primary/30">
                {categories.find(c => c.id === categoryId)?.name}
              </Badge>
            )}
          </div>

          {/* Grid */}
          {loading ? (
            <GoldLoader text="Loading nominees..." />
          ) : nominees.length === 0 ? (
            <div className="text-center py-20">
              <Trophy className="w-16 h-16 text-primary/20 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-muted-foreground">No nominees found</h3>
              <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {nominees.map((n, i) => <NomineeCard key={n.id} nominee={n} index={i} />)}
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
