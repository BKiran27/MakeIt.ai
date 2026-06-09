'use client';

import React, { useEffect, useState } from 'react';
import { MessageSquare, Heart, Share2, Users, Award, Star, UserCheck, ChevronRight, Loader2 } from 'lucide-react';
import { useDiyStore, Project } from '../../lib/store';
import Navbar from '../../components/layout/Navbar';
import AuthDialog from '../../components/ui/AuthDialog';
import CustomToast from '../../components/ui/CustomToast';
import Link from 'next/link';

export default function CommunityPage() {
  const { communityProjects, fetchCommunityProjects, session, setAuthOpen } = useDiyStore();
  const [followedCreators, setFollowedCreators] = useState<string[]>([]);
  const [likesState, setLikesState] = useState<Record<string, { liked: boolean, count: number }>>({});

  useEffect(() => {
    fetchCommunityProjects();
  }, [fetchCommunityProjects]);

  const toggleFollow = (creatorName: string) => {
    if (!session) {
      setAuthOpen(true);
      return;
    }
    if (followedCreators.includes(creatorName)) {
      setFollowedCreators(followedCreators.filter(c => c !== creatorName));
    } else {
      setFollowedCreators([...followedCreators, creatorName]);
    }
  };

  const handleLike = (projectId: string, initialLikes: number) => {
    if (!session) {
      setAuthOpen(true);
      return;
    }
    
    const currentState = likesState[projectId] || { liked: false, count: initialLikes };
    const nextLiked = !currentState.liked;
    const nextCount = nextLiked ? currentState.count + 1 : Math.max(0, currentState.count - 1);
    
    setLikesState({
      ...likesState,
      [projectId]: { liked: nextLiked, count: nextCount }
    });
  };

  // Static mock Top Creators directory
  const topCreators = [
    { name: 'EcoGardener', projects: 12, badges: '🌱 Master', points: 480 },
    { name: 'WoodworkStar', projects: 8, badges: '🪵 Pro', points: 310 },
    { name: 'CraftyMaker', projects: 14, badges: '🎨 Artist', points: 290 },
    { name: 'ElectroHobbyist', projects: 5, badges: '⚡ Engineer', points: 190 }
  ];

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 font-sans pb-16">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Community Feed (8/12) */}
          <div className="lg:col-span-8 space-y-6">
            
            <div className="space-y-1 border-b border-slate-850 pb-5">
              <h2 className="text-2xl font-bold font-display text-white flex items-center gap-2">
                <Users className="w-6 h-6 text-[#6C63FF]" />
                Community Feed
              </h2>
              <p className="text-xs text-slate-400">
                Explore guides shared by other creators, drop helpful feedback, and find inspiration.
              </p>
            </div>

            {communityProjects.length === 0 ? (
              <div className="text-center py-20 bg-slate-900/20 border border-slate-850 rounded-2xl">
                <Loader2 className="w-6 h-6 animate-spin text-[#6C63FF] mx-auto mb-2" />
                <span className="text-xs font-mono text-slate-500">Retrieving feed updates...</span>
              </div>
            ) : (
              <div className="space-y-6">
                {communityProjects.map(project => {
                  const creator = project.author?.name || 'DIY Maker';
                  const isFollowing = followedCreators.includes(creator);
                  const projectLikes = likesState[project.id] || { 
                    liked: false, 
                    count: project.likes?.length || Math.floor(Math.random() * 8) + 4 
                  };

                  return (
                    <div 
                      key={project.id} 
                      className="bg-[#1E293B]/40 rounded-2xl border border-slate-800 p-5 sm:p-6 space-y-4 shadow-md glass-panel"
                    >
                      {/* Creator Info Row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#6C63FF] to-[#00D4FF] text-white flex items-center justify-center font-bold text-xs">
                            {creator[0]?.toUpperCase()}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-100 flex items-center gap-2">
                              <span>{creator}</span>
                              <span className="w-1 h-1 rounded-full bg-emerald-500" />
                              <span className="text-[10px] text-slate-400 font-mono">Level 4 Creator</span>
                            </div>
                            <p className="text-[9px] text-slate-500 font-mono">Shared recently</p>
                          </div>
                        </div>

                        <button 
                          onClick={() => toggleFollow(creator)}
                          className={`px-3 py-1 rounded-lg text-[10px] font-mono uppercase tracking-wider font-bold transition-all border cursor-pointer ${
                            isFollowing 
                              ? 'bg-slate-800 text-slate-400 border-slate-750' 
                              : 'bg-[#6C63FF]/15 text-[#6C63FF] border-[#6C63FF]/20 hover:bg-[#6C63FF]/25'
                          }`}
                        >
                          {isFollowing ? 'Following' : '+ Follow'}
                        </button>
                      </div>

                      {/* Post Cover image */}
                      {project.imageUrl && (
                        <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-850">
                          <img 
                            src={project.imageUrl} 
                            alt={project.title} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                      )}

                      {/* Content details */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base sm:text-lg font-bold text-white font-display">
                            {project.title}
                          </h3>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-350 leading-relaxed line-clamp-3">
                          {project.description}
                        </p>
                      </div>

                      {/* Action buttons footer */}
                      <div className="pt-4 border-t border-slate-850/50 flex items-center justify-between">
                        <div className="flex gap-4 items-center">
                          <button 
                            onClick={() => handleLike(project.id, project.likes?.length || 4)}
                            className={`flex items-center gap-1.5 text-xs transition-colors hover:text-[#00D4FF] cursor-pointer ${
                              projectLikes.liked ? 'text-[#00D4FF]' : 'text-slate-450'
                            }`}
                          >
                            <Heart className="w-4 h-4" fill={projectLikes.liked ? "currentColor" : "none"} />
                            <span className="font-mono">{projectLikes.count}</span>
                          </button>

                          <Link 
                            href={`/project?id=${project.id}`}
                            className="flex items-center gap-1.5 text-xs text-slate-450 hover:text-slate-200 transition-colors"
                          >
                            <MessageSquare className="w-4 h-4" />
                            <span className="font-mono">Comments</span>
                          </Link>
                        </div>

                        <Link 
                          href={`/project?id=${project.id}`}
                          className="px-3.5 py-1.5 bg-slate-850 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-750/80 rounded-lg text-xs font-semibold tracking-wide transition-colors flex items-center gap-1"
                        >
                          <span>View Blueprint</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>

          {/* Right Column: Top Creators & Social Info (4/12) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Top Creators Directory card */}
            <div className="bg-[#1E293B]/40 rounded-2xl border border-slate-800 p-5 sm:p-6 space-y-5 shadow-md glass-panel">
              <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
                <Star className="w-4.5 h-4.5 text-amber-500 fill-current" />
                <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-slate-250">
                  Featured Creators
                </h4>
              </div>

              <div className="space-y-4">
                {topCreators.map((creator, idx) => {
                  const isFollowing = followedCreators.includes(creator.name);
                  return (
                    <div key={idx} className="flex items-center justify-between text-xs pb-3 border-b border-slate-850/40 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-mono font-bold text-[#00D4FF]">
                          #{idx + 1}
                        </div>
                        <div>
                          <h5 className="font-bold text-slate-200 flex items-center gap-1">
                            {creator.name}
                            <span className="text-[9px] bg-[#6C63FF]/10 text-[#6C63FF] px-1.5 py-0.5 rounded font-mono font-bold">
                              {creator.badges}
                            </span>
                          </h5>
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                            {creator.projects} projects • {creator.points} pts
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => toggleFollow(creator.name)}
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                          isFollowing 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : 'bg-slate-800 text-slate-400 border-slate-750 hover:text-slate-200'
                        }`}
                        title={isFollowing ? 'Following' : 'Follow Creator'}
                      >
                        {isFollowing ? <UserCheck className="w-4 h-4" /> : <span className="font-bold font-mono px-1 text-[10px]">+</span>}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Platform statistics summary info */}
            <div className="bg-[#1E293B]/20 rounded-2xl border border-slate-850 p-5 space-y-3.5 text-xs text-slate-450 leading-relaxed shadow-sm">
              <h5 className="font-mono uppercase tracking-wider font-bold text-slate-350">
                🌱 DIY Community Rules
              </h5>
              <ul className="space-y-2 list-disc list-inside">
                <li>Share eco-friendly upcycled crafts.</li>
                <li>Write clear, detailed steps in guides.</li>
                <li>Add safety warning labels for heavy machinery/cutters.</li>
                <li>Keep feedback polite and helpful!</li>
              </ul>
            </div>

          </div>

        </div>

      </main>

      <AuthDialog />
      <CustomToast />
    </div>
  );
}
