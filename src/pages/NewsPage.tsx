import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getNews } from '@/lib/api';
import PublicLayout from '@/components/layouts/PublicLayout';
import GoldLoader from '@/components/common/GoldLoader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import type { News } from '@/types/types';

export default function NewsPage() {
  const [news, setNews] = useState<News[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const PAGE_SIZE = 9;

  useEffect(() => {
    setLoading(true);
    getNews(page, PAGE_SIZE).then(r => { setNews(r.data); setTotal(r.total); setLoading(false); });
  }, [page]);

  return (
    <PublicLayout>
      <div className="pt-20 min-h-screen">
        <div className="relative py-16 text-center overflow-hidden">
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 100% at 50% -20%, rgba(201,162,39,0.15), transparent 70%)' }} />
          <div className="relative z-10 container mx-auto px-4">
            <Badge className="mb-4 bg-primary/15 text-primary border-primary/30">Latest Updates</Badge>
            <h1 className="text-3xl md:text-5xl font-black text-gradient-gold mb-3" style={{ fontFamily: 'Cinzel, serif' }}>News & Updates</h1>
          </div>
        </div>

        <div className="container mx-auto px-4 pb-16">
          {loading ? <GoldLoader /> : news.length === 0 ? (
            <div className="text-center py-20">
              <FileText className="w-16 h-16 text-primary/20 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-muted-foreground">No news yet</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {news.map((article, i) => (
                <motion.div key={article.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                  <Link to={`/news/${article.id}`}>
                    <div className="glass-card rounded-xl overflow-hidden hover-gold h-full flex flex-col">
                      {article.image_url ? (
                        <div className="aspect-video overflow-hidden"><img src={article.image_url} alt={article.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" /></div>
                      ) : (
                        <div className="aspect-video bg-gradient-card flex items-center justify-center"><FileText className="w-10 h-10 text-primary/20" /></div>
                      )}
                      <div className="p-5 flex flex-col flex-1">
                        <div className="text-xs text-muted-foreground mb-2">{new Date(article.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                        <h2 className="font-bold text-sm mb-2 text-balance">{article.title}</h2>
                        {article.summary && <p className="text-xs text-muted-foreground line-clamp-2 flex-1">{article.summary}</p>}
                        <span className="text-xs text-primary font-medium mt-3">Read More →</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
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
