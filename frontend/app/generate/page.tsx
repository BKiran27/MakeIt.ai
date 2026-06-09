'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Loader2, ArrowRight, Lightbulb, Hammer } from 'lucide-react';
import { useDiyStore } from '../../lib/store';
import Navbar from '../../components/layout/Navbar';
import MaterialScanner from '../../components/workspace/MaterialScanner';
import AiAssistantPanel from '../../components/workspace/AiAssistantPanel';
import ProjectCard from '../../components/project/ProjectCard';
import AuthDialog from '../../components/ui/AuthDialog';
import CustomToast from '../../components/ui/CustomToast';

export default function GeneratePage() {
  const router = useRouter();
  const { 
    session, 
    dbUser, 
    materials, 
    difficulty, 
    category, 
    customPrompt, 
    isGenerating, 
    projects,
    setDifficulty, 
    setCategory, 
    setCustomPrompt,
    generateProjects,
    setAuthOpen
  } = useDiyStore();

  // Redirect to landing if no session is active after checking
  useEffect(() => {
    // If not authenticated, prompt login but don't force redirect immediately
    // so they can see the layout, but let's prompt them.
    if (!session) {
      setAuthOpen(true);
    }
  }, [session, setAuthOpen]);

  const handleGenerate = async () => {
    if (!session) {
      setAuthOpen(true);
      return;
    }
    await generateProjects();
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 font-sans selection:bg-[#6C63FF]/30 pb-16">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        
        {/* Banner if guest */}
        {!session && (
          <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400 flex items-center justify-between">
            <span>You are previewing the Workspace in read-only mode. Please sign in to scan images or generate custom blueprints.</span>
            <button 
              onClick={() => setAuthOpen(true)}
              className="px-3 py-1 bg-[#6C63FF] hover:bg-[#7B68EE] text-white rounded-lg font-bold transition-all shrink-0 cursor-pointer"
            >
              Sign In
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Inputs & Controls (7/12) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Main scanner & tags */}
            <MaterialScanner />

            {/* Custom Options panel */}
            <div className="bg-[#1E293B]/40 rounded-2xl border border-slate-800 p-5 sm:p-6 space-y-5 shadow-md glass-panel">
              
              <div>
                <h4 className="text-xs font-mono uppercase tracking-widest text-[#00D4FF] font-bold">
                  03. Tailor Your Project
                </h4>
                <p className="text-[11px] text-slate-450 mt-0.5">
                  Configure categories, complexity, and custom objectives for the AI blueprint.
                </p>
              </div>

              {/* Text prompt box */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase text-slate-400 tracking-wider font-semibold">
                  What would you like to build? (Optional)
                </label>
                <textarea
                  value={customPrompt}
                  onChange={e => setCustomPrompt(e.target.value)}
                  placeholder="Example: A desk shelf for books, a toy storage caddy, or a kitchen herb planter box..."
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#6C63FF] resize-none transition-all"
                />
              </div>

              {/* Selectors grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase text-slate-400 tracking-wider font-semibold">Difficulty Level</label>
                  <select 
                    value={difficulty} 
                    onChange={e => setDifficulty(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3.5 py-2.5 text-xs outline-none text-slate-300 font-semibold cursor-pointer transition-all focus:border-[#6C63FF]"
                  >
                    <option value="EASY">Easy (under 45m, household tools)</option>
                    <option value="MEDIUM">Medium (1-2 hours, light handcrafts)</option>
                    <option value="HARD">Hard (2+ hours, requires assembly/cutting)</option>
                  </select>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase text-slate-400 tracking-wider font-semibold">Category Hint</label>
                  <select 
                    value={category} 
                    onChange={e => setCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3.5 py-2.5 text-xs outline-none text-slate-300 font-semibold cursor-pointer transition-all focus:border-[#6C63FF]"
                  >
                    <option value="Surprise Me">🎲 Surprise Me</option>
                    <option value="Woodworking">🪵 Woodworking</option>
                    <option value="Electronics">⚡ Electronics</option>
                    <option value="Crafts">🎨 Crafts & Upcycling</option>
                    <option value="Home Decor">🏠 Home Decor</option>
                    <option value="Garden">🪴 Gardening</option>
                    <option value="School Projects">🏫 School Projects</option>
                  </select>
                </div>
              </div>

              {/* Generate button */}
              <div className="pt-4 border-t border-slate-850/50">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || materials.length === 0}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#6C63FF] hover:bg-[#7B68EE] text-white font-bold py-3.5 px-6 transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-[#6C63FF]/15 cursor-pointer shadow-md"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-xs font-mono tracking-wider uppercase">Designing Custom Blueprints...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-400 fill-current" />
                      <span className="text-xs font-mono tracking-wider uppercase">Generate Project Blueprints</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

            </div>

            {/* Generated project cards showcase section */}
            {isGenerating || projects.length > 0 ? (
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 text-slate-300">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <h4 className="text-xs font-mono uppercase tracking-wider font-bold">Generated AI Projects</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {isGenerating ? (
                    Array.from({ length: 2 }).map((_, i) => (
                      <div 
                        key={i} 
                        className="rounded-2xl border border-slate-850 bg-[#1E293B]/20 h-48 animate-pulse flex flex-col justify-between p-4"
                      >
                        <div className="space-y-2">
                          <div className="h-4 bg-slate-800 rounded w-2/3" />
                          <div className="h-3 bg-slate-800 rounded w-full" />
                          <div className="h-3 bg-slate-800 rounded w-5/6" />
                        </div>
                        <div className="h-3 bg-slate-800 rounded w-1/3" />
                      </div>
                    ))
                  ) : (
                    projects.map((project, idx) => (
                      <ProjectCard key={project.id || idx} project={project} />
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-850 bg-[#1E293B]/10 p-8 text-center space-y-2">
                <Hammer className="w-8 h-8 text-slate-700 mx-auto" />
                <h5 className="text-xs font-mono uppercase font-bold text-slate-500">Workspace Empty</h5>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Add items to your materials checklist, configure options, and hit Generate to see blueprints!
                </p>
              </div>
            )}

          </div>

          {/* Right Column: AI Assistant Chat Sidebar (5/12) */}
          <div className="lg:col-span-5">
            <AiAssistantPanel />
          </div>

        </div>

      </main>

      {/* Global overlays */}
      <AuthDialog />
      <CustomToast />
    </div>
  );
}
