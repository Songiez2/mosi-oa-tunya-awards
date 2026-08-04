import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getNewsById } from '@/lib/api';
import PublicLayout from '@/components/layouts/PublicLayout';
import GoldLoader from '@/components/common/GoldLoader';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Calendar } from 'lucide-react';
import type { News } from '@/types/types';

export default function NewsDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getNewsById(id).then(a => { setArticle(a); setLoading(false); });
  }, [id]);

  if (loading) return <PublicLayout><div className="pt-20"><GoldLoader /></div></PublicLayout>;
  if (!article) return <PublicLayout><div className="pt-20 text-center p-12 text-muted-foreground">Article not found.</div></PublicLayout>;

  return (
    <PublicLayout>
      <div className="pt-20 min-h-screen">
        {article.image_url && (
          <div className="relative h-56 md:h-80 overflow-hidden">
            <img src={article.image_url} alt={article.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-hero" />
          </div>
        )}
        <div className="container mx-auto px-4 max-w-3xl py-12">
          <button onClick={() => navigate('/news')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ChevronLeft className="w-4 h-4" /> Back to News
          </button>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            {new Date(article.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
          <h1 className="text-2xl md:text-4xl font-black text-gradient-gold mb-4 text-balance" style={{ fontFamily: 'Cinzel, serif' }}>{article.title}</h1>
          {article.summary && <p className="text-muted-foreground text-base mb-6 font-medium">{article.summary}</p>}
          {article.content && (
            <div className="prose prose-invert prose-sm max-w-none text-foreground leading-relaxed space-y-4 whitespace-pre-wrap">{article.content}</div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
