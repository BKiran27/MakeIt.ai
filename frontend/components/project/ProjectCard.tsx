'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Wrench, Share2, Heart, Bookmark, BookmarkCheck, ChevronRight } from 'lucide-react';
import { useDiyStore, Project } from '../../lib/store';

interface ProjectCardProps {
  project: Project;
  onRefreshSaved?: () => void;
}

export default function ProjectCard({ project, onRefreshSaved }: ProjectCardProps) {
  const router = useRouter();
  const { session, savedProjects, toggleSaveProject, likeProject, showToast } = useDiyStore();

  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 8) + 3);

  const isSaved = savedProjects.some(p => p.id === project.id);

  const handleCardClick = () => {
    router.push(`/project?id=${project.id}`);
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleSaveProject(project);
    if (onRefreshSaved) onRefreshSaved();
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await likeProject(project.id);
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `Check out this DIY Project: ${project.title}\n\nDifficulty: ${project.difficulty}\n\nGenerated with DIY Genius AI!`;
    if (navigator.share) {
      try {
        await navigator.share({ title: project.title, text });
      } catch (err) {
        console.error(err);
      }
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/project?id=${project.id}`);
      showToast('Link copied to clipboard!');
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff?.toUpperCase()) {
      case 'EASY': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'MEDIUM': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'HARD': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  // Cover image with nice fallback gradients
  const coverUrl = project.imageUrl || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=400&auto=format&fit=crop';

  return (
    <div 
      onClick={handleCardClick}
      className="group relative flex flex-col bg-[#1E293B]/70 backdrop-blur-md rounded-2xl border border-slate-800/80 overflow-hidden cursor-pointer hover:border-[#6C63FF]/50 transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-[#6C63FF]/5 transform hover:-translate-y-1"
    >
      
      {/* Cover Image & Hover Actions */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-900 border-b border-slate-850">
        <img 
          src={coverUrl} 
          alt={project.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60" />
        
        {/* Quick Tags overlay */}
        <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
          <span className={`px-2 py-0.5 rounded-md text-[9px] font-mono uppercase tracking-wider border font-bold ${getDifficultyColor(project.difficulty)}`}>
            {project.difficulty}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-slate-950/80 text-slate-300 text-[9px] font-mono border border-slate-800 font-semibold">
            {project.category || 'DIY'}
          </span>
        </div>

        {/* Quick action buttons overlay */}
        <div 
          className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 print:hidden"
          onClick={e => e.stopPropagation()}
        >
          <button 
            onClick={handleShare}
            className="p-1.5 bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:text-white rounded-lg text-slate-300 transition-all"
            title="Share"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
          
          <button 
            onClick={handleSave}
            className={`p-1.5 bg-slate-950/80 hover:bg-slate-900 border border-slate-800 rounded-lg transition-all ${
              isSaved ? 'text-[#6C63FF]' : 'text-slate-300 hover:text-[#6C63FF]'
            }`}
            title={isSaved ? "Remove Bookmark" : "Save Project"}
          >
            {isSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Info Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm sm:text-base font-bold tracking-tight text-slate-100 font-display group-hover:text-indigo-400 transition-colors leading-snug line-clamp-1">
              {project.title}
            </h4>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
            {project.description}
          </p>
        </div>

        {/* Footer info metadata */}
        <div className="flex items-center justify-between border-t border-slate-850/50 pt-3 text-[10px] font-mono text-slate-450">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              {project.timeEstimate || '1 hour'}
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-700" />
            <span className="text-indigo-400 font-bold">
              {project.costEstimate || '$0'}
            </span>
          </div>

          <div className="flex items-center gap-3 print:hidden" onClick={e => e.stopPropagation()}>
            <button 
              onClick={handleLike}
              className={`flex items-center gap-1.5 text-xs transition-colors hover:text-[#00D4FF] ${isLiked ? 'text-[#00D4FF]' : 'text-slate-450'}`}
              title="Like project"
            >
              <Heart className="w-3.5 h-3.5" fill={isLiked ? "currentColor" : "none"} />
              <span>{likeCount}</span>
            </button>
            
            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>

      </div>

    </div>
  );
}
