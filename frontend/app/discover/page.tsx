'use client';

import React, { useState, useEffect } from 'react';
import { Search, Compass, SlidersHorizontal, Loader2 } from 'lucide-react';
import { useDiyStore } from '../../lib/store';
import Navbar from '../../components/layout/Navbar';
import ProjectCard from '../../components/project/ProjectCard';
import AuthDialog from '../../components/ui/AuthDialog';
import CustomToast from '../../components/ui/CustomToast';

export default function DiscoverPage() {
  const { communityProjects, fetchCommunityProjects } = useDiyStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(false);

  // Load community projects on start and when search query changes
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      setIsLoading(true);
      await fetchCommunityProjects(searchQuery);
      setIsLoading(false);
    }, 400); // Debounce typing searches

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, fetchCommunityProjects]);

  const categories = [
    'All',
    'Woodworking',
    'Electronics',
    'Crafts',
    'Home Decor',
    'Garden',
    'School Projects'
  ];

  // Filter projects by category locally
  const filteredProjects = communityProjects.filter(p => {
    if (activeFilter === 'All') return true;
    
    // Map category name matches
    const projCat = p.category?.toLowerCase() || '';
    const filterLower = activeFilter.toLowerCase();
    
    if (filterLower === 'crafts') {
      return projCat.includes('craft') || projCat.includes('upcycle');
    }
    return projCat.includes(filterLower);
  });

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 font-sans pb-16">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        
        {/* Banner Title */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between border-b border-slate-850 pb-5">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold font-display text-white flex items-center gap-2">
              <Compass className="w-6 h-6 text-[#00D4FF]" />
              Discover Blueprints
            </h2>
            <p className="text-xs text-slate-400">
              Browse creative instructions uploaded by makers globally. Search by materials or project titles.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:max-w-xs shrink-0">
            <input 
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by title or materials..."
              className="w-full bg-[#1E293B] border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white outline-none focus:border-[#6C63FF] transition-all"
            />
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
            {isLoading && (
              <Loader2 className="absolute right-3 top-3 w-4 h-4 text-[#6C63FF] animate-spin" />
            )}
          </div>
        </div>

        {/* Category selector row */}
        <div className="flex gap-2.5 overflow-x-auto scrollbar-none py-1.5 border-b border-slate-850/50 pb-4">
          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-450 uppercase font-bold pr-2.5 border-r border-slate-850 shrink-0">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filter</span>
          </div>
          
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all border cursor-pointer ${
                activeFilter === cat 
                  ? 'bg-[#6C63FF] text-white border-transparent shadow-md shadow-[#6C63FF]/15' 
                  : 'bg-[#1E293B] text-slate-350 border-slate-800 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Pinterest Masonry Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div 
                key={i} 
                className="rounded-2xl border border-slate-850 bg-[#1E293B]/20 h-64 animate-pulse flex flex-col justify-between p-4"
              >
                <div className="h-32 bg-slate-800/60 rounded-xl" />
                <div className="space-y-2 pt-4">
                  <div className="h-4 bg-slate-800 rounded w-2/3" />
                  <div className="h-3 bg-slate-800 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-24 bg-slate-900/20 rounded-2xl border border-slate-850 border-dashed max-w-md mx-auto space-y-3">
            <Compass className="w-8 h-8 mx-auto text-slate-650" />
            <h4 className="text-sm font-mono uppercase font-bold text-slate-400">No Projects Found</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              We couldn't find any community projects matching "{activeFilter}" with query "{searchQuery}". Try modifying your filter criteria!
            </p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6 masonry-grid">
            {filteredProjects.map(project => (
              <div key={project.id} className="break-inside-avoid">
                <ProjectCard project={project} />
              </div>
            ))}
          </div>
        )}

      </main>

      <AuthDialog />
      <CustomToast />
    </div>
  );
}
