import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getGallery } from '@/lib/api';
import PublicLayout from '@/components/layouts/PublicLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Image, X, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import type { GalleryItem } from '@/types/types';

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [lightbox, setLightbox] = useState<number | null>(null);

  useEffect(() => { getGallery(1, 60).then(r => setItems(r.data)); }, []);

  const open = (i: number) => setLightbox(i);
  const close = () => setLightbox(null);
  const prev = () => setLightbox(i => (i !== null ? (i - 1 + items.length) % items.length : null));
  const next = () => setLightbox(i => (i !== null ? (i + 1) % items.length : null));

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [items.length]);

  return (
    <PublicLayout>
      <div className="pt-20 min-h-screen">
        <div className="relative py-16 text-center overflow-hidden">
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 100% at 50% -20%, rgba(201,162,39,0.15), transparent 70%)' }} />
          <div className="relative z-10 container mx-auto px-4">
            <Badge className="mb-4 bg-primary/15 text-primary border-primary/30">Photo & Video</Badge>
            <h1 className="text-3xl md:text-5xl font-black text-gradient-gold mb-3" style={{ fontFamily: 'Cinzel, serif' }}>Gallery</h1>
          </div>
        </div>

        <div className="container mx-auto px-4 pb-16">
          {items.length === 0 ? (
            <div className="text-center py-20">
              <Image className="w-16 h-16 text-primary/20 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-muted-foreground">No gallery items yet</h3>
            </div>
          ) : (
            <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
              {items.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}
                  className="break-inside-avoid cursor-pointer"
                  onClick={() => open(i)}
                >
                  <div className="relative overflow-hidden rounded-xl hover-gold group">
                    {item.media_type === 'video' ? (
                      <div className="aspect-video bg-muted flex items-center justify-center">
                        <Play className="w-10 h-10 text-primary" />
                      </div>
                    ) : (
                      <img src={item.media_url} alt={item.title ?? 'Gallery'} className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    )}
                    {item.title && (
                      <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-xs text-white truncate">{item.title}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={close}
          >
            <button className="absolute top-4 right-4 text-white/80 hover:text-white z-10 p-2" onClick={close}>
              <X className="w-6 h-6" />
            </button>
            <button className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white z-10 p-2" onClick={e => { e.stopPropagation(); prev(); }}>
              <ChevronLeft className="w-8 h-8" />
            </button>
            <button className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white z-10 p-2" onClick={e => { e.stopPropagation(); next(); }}>
              <ChevronRight className="w-8 h-8" />
            </button>
            <motion.div
              initial={{ scale: 0.9 }} animate={{ scale: 1 }}
              className="max-w-4xl max-h-[80vh] overflow-hidden rounded-xl"
              onClick={e => e.stopPropagation()}
            >
              <img src={items[lightbox].media_url} alt={items[lightbox].title ?? ''} className="max-h-[80vh] w-auto object-contain" />
            </motion.div>
            <div className="absolute bottom-4 text-white/60 text-xs">{lightbox + 1} / {items.length}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </PublicLayout>
  );
}
