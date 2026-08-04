import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
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

export default function NomineesPage() {
  const [params, setParams] = useSearchParams();
  const [nominees, setNominees] = useState<Nominee[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 12;
  const categoryId = params.get('cat') ?? '';
  const search = params.get('q') ?? '';

  useEffect(() => { getCategories(true).then(setCategories); }, []);
  useEffect(() => {
    setLoading(true);
    getNominees(page, PAGE_SIZE, categoryId || undefined, search, 'approved').then(r => {
      setNominees(r.data); setTotal(r.total); setLoading(false);
    });
  }, [page, categoryId, search]);

  const updateParam = (key: string, val: string) => {
    const p = new URLSearchParams(params);
    if (val) p.set(key, val); else p.delete(key);
    setParams(p); setPage(1);
  };

  return (
    <PublicLayout>
      <div className="pt-20 min-h-screen">
        <div className="relative py-16 text-center overflow-hidden">
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 100% at 50% -20%, rgba(201,162,39,0.15), transparent 70%)' }} />
          <div className="relative z-10 container mx-auto px-4">
            <Badge className="mb-4 bg-primary/15 text-primary border-primary/30">All Nominees</Badge>
            <h1 className="text-3xl md:text-5xl font-black text-gradient-gold mb-3" style={{ fontFamily: 'Cinzel, serif' }}>Nominees</h1>
          </div>
        </div>
        <div className="container mx-auto px-4 pb-16">
          <div className="glass-card rounded-xl p-4 mb-6 flex flex-col md:flex-row gap-3">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input className="pl-9 bg-input border-border" placeholder="Search nominees..." defaultValue={search}
                onKeyDown={e => { if (e.key === 'Enter') updateParam('q', (e.target as HTMLInputElement).value); }} />
            </div>
            <Select value={categoryId || 'all'} onValueChange={v => updateParam('cat', v === 'all' ? '' : v)}>
              <SelectTrigger className="w-full md:w-64 bg-input border-border">
                <Filter className="w-4 h-4 mr-2" /><SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="text-sm text-muted-foreground mb-4">{loading ? 'Loading...' : `${total} nominees`}</div>
          {loading ? <GoldLoader /> : nominees.length === 0 ? (
            <div className="text-center py-20"><Trophy className="w-12 h-12 text-primary/20 mx-auto mb-3" /><p className="text-muted-foreground">No nominees found</p></div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {nominees.map((n, i) => <NomineeCard key={n.id} nominee={n} index={i} />)}
            </div>
          )}
          {Math.ceil(total / PAGE_SIZE) > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft className="w-4 h-4" /></Button>
              <span className="text-sm text-muted-foreground">Page {page} of {Math.ceil(total / PAGE_SIZE)}</span>
              <Button variant="secondary" size="sm" disabled={page >= Math.ceil(total / PAGE_SIZE)} onClick={() => setPage(p => p + 1)}><ChevronRight className="w-4 h-4" /></Button>
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
