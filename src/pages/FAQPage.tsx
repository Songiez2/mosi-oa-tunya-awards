import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PublicLayout from '@/components/layouts/PublicLayout';
import { Badge } from '@/components/ui/badge';
import { useSettings } from '@/contexts/SettingsContext';
import { HelpCircle, ChevronDown } from 'lucide-react';

const faqs = [
  { q: 'How do I vote for a nominee?', a: 'Create a free account, go to the Vote page, select your favorite nominee, choose the number of votes, pay via Mobile Money, upload payment proof, and submit. Your votes will be added within 24 hours after payment verification.' },
  { q: 'How much does each vote cost?', a: 'Each vote costs K10 (or as set by admin). You can buy 1, 5, 10, or 20 votes at a time. The total amount is automatically calculated.' },
  { q: 'How do I register as a nominee?', a: 'Go to the Register Nominee page, fill in your details, upload a profile photo, select your category, pay the K100 registration fee, upload proof of payment, and submit. An admin will verify and approve your registration.' },
  { q: 'When is the Awards Night?', a: 'The Awards Night date is announced on our homepage countdown timer. Stay tuned for the exact venue and time announcements.' },
  { q: 'How are payments verified?', a: 'Our team manually verifies all payment proofs within 24 hours. Once verified, your votes are automatically added to your chosen nominee.' },
  { q: 'Can I vote multiple times?', a: 'Yes! You can vote as many times as you want. Simply purchase more votes, pay, upload proof, and submit again.' },
  { q: 'How do I become a sponsor?', a: 'Visit the Sponsor Registration page, fill in your company details, choose a sponsorship package, and submit. Our team will contact you to discuss the partnership.' },
  { q: 'Is my payment secure?', a: 'Yes. All payment proofs are securely stored and your personal information is protected. We only collect what is necessary for vote processing.' },
  { q: 'What Mobile Money services are accepted?', a: 'We accept all major Zambian Mobile Money services including MTN, Airtel, and Zamtel. Bank transfers are also accepted.' },
  { q: 'Can I vote from outside Zambia?', a: 'Yes! Anyone can create an account and vote. Payment can be made through international banking or transfer to local accounts.' },
];

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
      <div className="glass-card rounded-xl overflow-hidden mb-3">
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-primary/5 transition-colors"
        >
          <span className="font-semibold text-sm pr-4">{q}</span>
          <ChevronDown className={`w-4 h-4 text-primary shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </button>
        <AnimatePresence>
          {open && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
              <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">{a}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default function FAQPage() {
  const { settings } = useSettings();
  return (
    <PublicLayout>
      <div className="pt-20 min-h-screen">
        <div className="relative py-16 text-center overflow-hidden">
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 100% at 50% -20%, rgba(201,162,39,0.15), transparent 70%)' }} />
          <div className="relative z-10 container mx-auto px-4">
            <Badge className="mb-4 bg-primary/15 text-primary border-primary/30">Help Center</Badge>
            <h1 className="text-3xl md:text-5xl font-black text-gradient-gold mb-3" style={{ fontFamily: 'Cinzel, serif' }}>FAQ</h1>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">Frequently asked questions about TUNYA AWARDS</p>
          </div>
        </div>
        <div className="container mx-auto px-4 pb-16 max-w-3xl">
          {faqs.map((item, i) => <FAQItem key={i} q={item.q} a={item.a} index={i} />)}
          <div className="glass-card rounded-xl p-6 text-center mt-8">
            <HelpCircle className="w-10 h-10 text-primary mx-auto mb-3" />
            <h3 className="font-bold mb-2">Still have questions?</h3>
            <p className="text-sm text-muted-foreground mb-4">Contact our support team</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center text-sm">
              <a href={`tel:${settings.help_number ?? '0962267118'}`} className="text-primary hover:underline">{settings.help_number ?? '0962267118'}</a>
              <a href={`mailto:${settings.help_email ?? 'info@tunyaawards.com'}`} className="text-primary hover:underline">{settings.help_email ?? 'info@tunyaawards.com'}</a>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
