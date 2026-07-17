import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Eye, Trophy } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type { Nominee } from '@/types/types';
import VoteModal from './VoteModal';

export default function NomineeCard({ nominee, index = 0 }: { nominee: Nominee; index?: number }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [voteOpen, setVoteOpen] = useState(false);

  // Check if user can see vote count (admin or nominee owner)
  const canSeeVotes = user?.role === 'admin' || user?.role === 'moderator' || user?.id === nominee.user_id;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.4 }}
        className="group glass-card rounded-xl overflow-hidden hover-gold cursor-pointer flex flex-col"
      >
        {/* Photo */}
        <div className="relative aspect-[3/4] overflow-hidden bg-muted">
          {nominee.profile_picture_url ? (
            <img
              src={nominee.profile_picture_url}
              alt={nominee.full_name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-card">
              <Trophy className="w-12 h-12 text-primary/40" />
            </div>
          )}
          {nominee.is_featured && (
            <div className="absolute top-2 left-2">
              <Badge className="bg-gradient-gold text-primary-foreground text-[10px] font-bold px-2 py-0.5">Featured</Badge>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-hero opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Info */}
        <div className="p-3 flex flex-col flex-1">
          <div className="font-semibold text-sm text-foreground truncate">{nominee.full_name}</div>
          {nominee.stage_name && (
            <div className="text-xs text-primary truncate">"{nominee.stage_name}"</div>
          )}
          <div className="text-xs text-muted-foreground truncate mt-0.5">
            {(nominee.categories as { name?: string } | null)?.name ?? ''}
          </div>

          {/* Votes - Only visible to admin, moderator, or nominee owner */}
          {canSeeVotes && (
            <div className="flex items-center gap-1 mt-2">
              <Star className="w-3.5 h-3.5 text-primary fill-primary" />
              <span className="text-xs font-bold text-primary">{nominee.vote_count.toLocaleString()}</span>
              <span className="text-xs text-muted-foreground">votes</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 mt-3 mt-auto">
            <Button
              size="sm"
              variant="secondary"
              className="flex-1 h-7 text-xs"
              onClick={() => navigate(`/nominees/${nominee.id}`)}
            >
              <Eye className="w-3 h-3 mr-1" /> Profile
            </Button>
            <Button
              size="sm"
              className="flex-1 h-7 text-xs bg-gradient-gold text-primary-foreground font-semibold"
              onClick={() => setVoteOpen(true)}
            >
              <Star className="w-3 h-3 mr-1" /> Vote
            </Button>
          </div>
        </div>
      </motion.div>

      <VoteModal nominee={nominee} open={voteOpen} onClose={() => setVoteOpen(false)} />
    </>
  );
}
