import React, { useState, useEffect } from 'react';
import { supabase } from '@/db/supabase';
import { HeroSlide } from '@/types/types';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function HeroSlider() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      const { data, error } = await supabase
        .from('hero_slides')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
        
      if (error) throw error;
      setSlides(data || []);
    } catch (error) {
      console.error('Failed to load slides', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-play
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (loading || slides.length === 0) return null;

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));

  const currentSlide = slides[currentIndex];

  return (
    <div className="relative w-full h-[60vh] md:h-[75vh] bg-black overflow-hidden group">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          <img 
            src={currentSlide.image_url} 
            alt={currentSlide.title || 'Hero Banner'} 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute inset-0 bg-black/20" />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="container mx-auto px-4 text-center z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={`text-${currentIndex}`}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="max-w-3xl mx-auto space-y-6"
            >
              {currentSlide.title && (
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white drop-shadow-lg leading-tight font-cinzel">
                  {currentSlide.title}
                </h1>
              )}
              {currentSlide.description && (
                <p className="text-lg md:text-xl text-gray-200 drop-shadow max-w-2xl mx-auto">
                  {currentSlide.description}
                </p>
              )}
              {currentSlide.button_text && currentSlide.link_url && (
                <div className="pt-4">
                  <Button 
                    size="lg" 
                    className="bg-gradient-gold text-primary-foreground font-bold text-lg px-8 hover:scale-105 transition-transform"
                    onClick={() => {
                      // Check if internal link
                      if (currentSlide.link_url?.startsWith('/')) {
                        navigate(currentSlide.link_url);
                      } else {
                        window.open(currentSlide.link_url, '_blank');
                      }
                    }}
                  >
                    {currentSlide.button_text}
                  </Button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {slides.length > 1 && (
        <>
          <button 
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 hover:bg-black/60 border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm z-20"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button 
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 hover:bg-black/60 border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm z-20"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-20">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`transition-all duration-300 rounded-full ${
                  idx === currentIndex 
                    ? 'w-8 h-2 bg-primary' 
                    : 'w-2 h-2 bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
