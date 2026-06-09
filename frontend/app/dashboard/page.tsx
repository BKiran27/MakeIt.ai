'use client';

import React, { useEffect } from 'react';
import { Award, Bookmark, Calendar, ArrowRight, ShieldAlert, Sparkles, TrendingUp } from 'lucide-react';
import { useDiyStore } from '../../lib/store';
import Navbar from '../../components/layout/Navbar';
import ProjectCard from '../../components/project/ProjectCard';
import AuthDialog from '../../components/ui/AuthDialog';
import CustomToast from '../../components/ui/CustomToast';
import Link from 'next/link';

export default function DashboardPage() {
  const { session, dbUser, savedProjects, fetchSavedProjects, setAuthOpen } = useDiyStore();

  useEffect(() => {
    if (session) {
      fetchSavedProjects();
    }
  }, [session, fetchSavedProjects]);

  const handleBypassAuth = () => {
    setAuthOpen(true);
  };

  // Mock stats data
  const stats = [
    { title: 'Blueprints Created', count: 6, color: 'text-[#6C63FF]' },
    { title: 'Projects Completed', count: 4, color: 'text-emerald-400' },
    { title: 'Bookmarks Saved', count: savedProjects.length, color: 'text-[#00D4FF]' },
    { title: 'AI Scans Left', count: dbUser?.isPremium ? '∞' : '5 / day', color: 'text-amber-400' }
  ];

  // Badges listing
  const achievements = [
    { emoji: '🌱', name: 'Eco Master', desc: 'Recycled plastics into watering planter', unlocked: true },
    { emoji: '📦', name: 'Box Stack Star', desc: 'Assembled 3 structures from boxes', unlocked: true },
    { emoji: '🪵', name: 'Woodland Craft', desc: 'Lock: Generate a woodworking blueprint', unlocked: false }
  ];

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 font-sans pb-16">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        
        {!session ? (
          <div className="rounded-2xl border border-slate-850 bg-[#1E293B]/20 p-12 text-center space-y-4 max-w-md mx-auto">
            <ShieldAlert className="w-10 h-10 text-slate-655 mx-auto" />
            <h3 className="text-lg font-bold font-display text-white">Dashboard Restricted</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Please sign in to monitor your craft history, unlocks, statistics charts, and saved files.
            </p>
            <button 
              onClick={handleBypassAuth}
              className="px-6 py-2.5 bg-[#6C63FF] hover:bg-[#7B68EE] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#6C63FF]/15 cursor-pointer"
            >
              Sign In to Account
            </button>
          </div>
        ) : (
          <>
            {/* Header Profiler Row */}
            <div className="bg-[#1E293B]/40 rounded-2xl border border-slate-800 p-6 flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left glass-panel">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#6C63FF] to-[#00D4FF] text-white flex items-center justify-center font-bold text-2xl font-display shadow-md">
                {dbUser?.name?.[0]?.toUpperCase() || 'M'}
              </div>
              
              <div className="space-y-2.5 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center md:justify-start">
                  <h2 className="text-2xl font-bold text-white font-display">
                    {dbUser?.name || 'Maker'}
                  </h2>
                  <span className="bg-[#6C63FF]/15 text-[#6C63FF] border border-[#6C63FF]/20 px-2.5 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-wider font-bold w-fit mx-auto sm:mx-0">
                    Level 4 Creator
                  </span>
                  {dbUser?.isPremium && (
                    <span className="bg-gradient-to-r from-amber-500/10 to-amber-600/10 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-wider font-bold w-fit mx-auto sm:mx-0">
                      Premium
                    </span>
                  )}
                </div>
                
                <p className="text-xs text-slate-400 max-w-xl">
                  Bio: Designing ecological string designs and plastic recyclables. Hobbyist DIY enthusiast.
                </p>
                
                <div className="flex gap-4 text-xs font-mono justify-center md:justify-start text-slate-500">
                  <span><strong className="text-[#00D4FF] font-black">14</strong> Followers</span>
                  <span><strong className="text-[#00D4FF] font-black">8</strong> Following</span>
                </div>
              </div>
            </div>

            {/* Numeric Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, idx) => (
                <div key={idx} className="bg-[#1E293B]/30 border border-slate-800 rounded-xl p-4.5 space-y-1 glass-panel">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">
                    {stat.title}
                  </span>
                  <div className={`text-2xl font-black ${stat.color}`}>
                    {stat.count}
                  </div>
                </div>
              ))}
            </div>

            {/* Custom SVG statistics charts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Chart (2/3 width) */}
              <div className="md:col-span-2 bg-[#1E293B]/30 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4 glass-panel">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4.5 h-4.5 text-[#00D4FF]" />
                    <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-slate-250">
                      AI Generation Activity
                    </h4>
                  </div>
                  <span className="text-[9px] bg-slate-900 border border-slate-850 px-2 py-0.5 rounded text-slate-450 font-mono">
                    Last 7 Days
                  </span>
                </div>

                {/* Styled SVG Line Chart with gradient fill */}
                <div className="w-full h-[180px] pt-4">
                  <svg viewBox="0 0 500 180" className="w-full h-full">
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6C63FF" stopOpacity="0.45" />
                        <stop offset="100%" stopColor="#6C63FF" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    
                    {/* Grid Lines */}
                    <line x1="40" y1="20" x2="480" y2="20" stroke="#1E293B" strokeWidth="1" strokeDasharray="3,3" />
                    <line x1="40" y1="70" x2="480" y2="70" stroke="#1E293B" strokeWidth="1" strokeDasharray="3,3" />
                    <line x1="40" y1="120" x2="480" y2="120" stroke="#1E293B" strokeWidth="1" strokeDasharray="3,3" />
                    <line x1="40" y1="150" x2="480" y2="150" stroke="#1E293B" strokeWidth="1" />
                    
                    {/* Area path */}
                    <path 
                      d="M 40 150 L 40 130 Q 110 80 110 90 T 180 110 T 250 50 T 320 60 T 390 120 T 480 30 L 480 150 Z" 
                      fill="url(#chartGrad)" 
                    />
                    
                    {/* Line path */}
                    <path 
                      d="M 40 130 Q 110 80 110 90 T 180 110 T 250 50 T 320 60 T 390 120 T 480 30" 
                      fill="none" 
                      stroke="#6C63FF" 
                      strokeWidth="3.5" 
                      strokeLinecap="round"
                      className="animate-pulse-slow"
                    />

                    {/* Nodes / Dots */}
                    <circle cx="40" cy="130" r="4" fill="#0F172A" stroke="#00D4FF" strokeWidth="2.5" />
                    <circle cx="110" cy="90" r="4" fill="#0F172A" stroke="#00D4FF" strokeWidth="2.5" />
                    <circle cx="180" cy="110" r="4" fill="#0F172A" stroke="#00D4FF" strokeWidth="2.5" />
                    <circle cx="250" cy="50" r="4" fill="#0F172A" stroke="#00D4FF" strokeWidth="2.5" />
                    <circle cx="320" cy="60" r="4" fill="#0F172A" stroke="#00D4FF" strokeWidth="2.5" />
                    <circle cx="390" cy="120" r="4" fill="#0F172A" stroke="#00D4FF" strokeWidth="2.5" />
                    <circle cx="480" cy="30" r="4" fill="#0F172A" stroke="#00D4FF" strokeWidth="2.5" />

                    {/* X Axis Labels */}
                    <text x="40" y="170" fill="#475569" fontSize="9" fontFamily="monospace" textAnchor="middle">Wed</text>
                    <text x="110" y="170" fill="#475569" fontSize="9" fontFamily="monospace" textAnchor="middle">Thu</text>
                    <text x="180" y="170" fill="#475569" fontSize="9" fontFamily="monospace" textAnchor="middle">Fri</text>
                    <text x="250" y="170" fill="#475569" fontSize="9" fontFamily="monospace" textAnchor="middle">Sat</text>
                    <text x="320" y="170" fill="#475569" fontSize="9" fontFamily="monospace" textAnchor="middle">Sun</text>
                    <text x="390" y="170" fill="#475569" fontSize="9" fontFamily="monospace" textAnchor="middle">Mon</text>
                    <text x="480" y="170" fill="#475569" fontSize="9" fontFamily="monospace" textAnchor="middle">Today</text>

                    {/* Y Axis Labels */}
                    <text x="25" y="24" fill="#475569" fontSize="8" fontFamily="monospace" textAnchor="middle">6</text>
                    <text x="25" y="74" fill="#475569" fontSize="8" fontFamily="monospace" textAnchor="middle">4</text>
                    <text x="25" y="124" fill="#475569" fontSize="8" fontFamily="monospace" textAnchor="middle">2</text>
                    <text x="25" y="154" fill="#475569" fontSize="8" fontFamily="monospace" textAnchor="middle">0</text>
                  </svg>
                </div>
              </div>

              {/* Achievements Column (1/3 width) */}
              <div className="bg-[#1E293B]/30 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4 glass-panel">
                <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
                  <Award className="w-4.5 h-4.5 text-amber-500" />
                  <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-slate-250">
                    Unlockable Badges
                  </h4>
                </div>

                <div className="space-y-3">
                  {achievements.map((item, idx) => (
                    <div 
                      key={idx} 
                      className={`flex gap-3 items-center p-3 rounded-xl border transition-all ${
                        item.unlocked 
                          ? 'bg-slate-900/40 border-slate-850 text-slate-200' 
                          : 'bg-slate-900/10 border-slate-900 text-slate-500 opacity-55'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700/50 shrink-0 text-lg">
                        {item.emoji}
                      </div>
                      <div>
                        <h5 className="text-xs font-bold">{item.name}</h5>
                        <p className="text-[9px] text-slate-500 font-mono mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Bookmarks Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-850 pb-4">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-4.5 h-4.5 text-[#00D4FF]" />
                  <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-slate-250">
                    Your Bookmarked Blueprints
                  </h4>
                </div>
                
                {savedProjects.length > 0 && (
                  <span className="text-[10px] font-mono bg-slate-900 border border-slate-850 px-2 py-0.5 rounded text-slate-450">
                    Total: {savedProjects.length}
                  </span>
                )}
              </div>

              {savedProjects.length === 0 ? (
                <div className="text-center py-16 bg-slate-900/10 border border-slate-850 border-dashed rounded-2xl max-w-sm mx-auto space-y-4">
                  <Bookmark className="w-8 h-8 text-slate-700 mx-auto" />
                  <div className="space-y-1">
                    <h5 className="text-xs font-mono uppercase font-bold text-slate-400">No bookmarks saved</h5>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto px-4">
                      When you generate blueprints, click the bookmark icon on cards to collect instructions here.
                    </p>
                  </div>
                  <Link 
                    href="/generate" 
                    className="inline-flex items-center gap-1.5 text-xs text-[#6C63FF] hover:underline font-bold"
                  >
                    <span>Go to Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedProjects.map(project => (
                    <ProjectCard key={project.id} project={project} onRefreshSaved={fetchSavedProjects} />
                  ))}
                </div>
              )}
            </div>

          </>
        )}

      </main>

      <AuthDialog />
      <CustomToast />
    </div>
  );
}
