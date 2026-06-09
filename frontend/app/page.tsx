'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, X, Hammer, Scissors, Leaf, Sparkles, 
  Moon, Sun, ArrowLeft, Clock, Wrench, Loader2,
  AlertCircle, Bookmark, BookmarkCheck, Share2, Heart, Send, LogIn, LogOut, CheckCircle2
} from 'lucide-react';
import * as Tabs from '@radix-ui/react-tabs';
import * as Toast from '@radix-ui/react-toast';
import * as Tooltip from '@radix-ui/react-tooltip';
import { supabase } from '../lib/supabase';

// API Configuration pointing to NestJS API Gateway
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

interface Project {
  id: string;
  title: string;
  description: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  timeEstimate: string;
  costEstimate: string;
  imageUrl?: string;
  category?: string;
  authorId?: string;
  steps?: { stepNumber: number; instruction: string; safetyWarning?: string }[];
  likes?: { userId: string }[];
  comments?: CommentType[];
  author?: { name: string; avatarUrl?: string };
  materials?: any[];
  tools?: any[];
}

interface CommentType {
  id: string;
  content: string;
  createdAt: string;
  user: { name: string; avatarUrl?: string };
}

const SimpleTooltip = ({ children, content, side = "top" }: { children: React.ReactNode, content: React.ReactNode, side?: "top" | "right" | "bottom" | "left" }) => (
  <Tooltip.Provider delayDuration={200}>
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        {children}
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content 
          side={side} 
          sideOffset={5} 
          className="z-[100] px-2.5 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 text-[11px] font-medium tracking-wide rounded-md shadow-md"
        >
          {content}
          <Tooltip.Arrow className="fill-zinc-900 dark:fill-zinc-100" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  </Tooltip.Provider>
);

export default function DIYGenerator() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [view, setView] = useState<'input' | 'results'>('input');
  const [activeTab, setActiveTab] = useState('generate');
  
  // Auth state
  const [session, setSession] = useState<any>(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [dbUser, setDbUser] = useState<any>(null);

  // App States
  const [materials, setMaterials] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [category, setCategory] = useState('Surprise Me');
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('EASY');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [savedProjects, setSavedProjects] = useState<Project[]>([]);
  const [communityProjects, setCommunityProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Toast state
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Setup Auth state listener & LocalStorage loaders
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) syncUser(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        syncUser(session);
      } else {
        setDbUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sync user with NestJS backend database
  const syncUser = async (currentSession: any) => {
    try {
      const nameFromMeta = currentSession.user?.user_metadata?.name || '';
      const response = await fetch(`${API_URL}/auth/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentSession.access_token}`,
        },
        body: JSON.stringify({ name: nameFromMeta || currentSession.user?.email?.split('@')[0] }),
      });
      if (response.ok) {
        const data = await response.json();
        setDbUser(data);
      }
    } catch (err) {
      console.error('Failed to sync user with backend:', err);
    }
  };

  // Fetch saved bookmarks from NestJS backend
  const fetchSavedProjects = async () => {
    if (!session) return;
    try {
      const response = await fetch(`${API_URL}/projects/saved`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSavedProjects(data.projects || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Fetch community projects from NestJS backend
  const fetchCommunityProjects = async (queryParam = '') => {
    try {
      const url = queryParam 
        ? `${API_URL}/projects?query=${encodeURIComponent(queryParam)}` 
        : `${API_URL}/projects`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setCommunityProjects(data.projects || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (activeTab === 'saved') {
      fetchSavedProjects();
    } else if (activeTab === 'community') {
      fetchCommunityProjects(searchQuery);
    }
  }, [activeTab, searchQuery, session]);

  // Handle Authentication via Supabase
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword) return;
    setAuthLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
          options: { data: { name: authName } }
        });
        if (error) throw error;
        showToast('Signed up successfully! Verify email if required.');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword,
        });
        if (error) throw error;
        showToast('Signed in successfully.');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.log('Supabase sign out bypassed or failed');
    }
    setSession(null);
    setDbUser(null);
    showToast('Signed out successfully.');
  };

  const handleGuestLogin = () => {
    const mockSession = {
      access_token: 'mock-token-guest',
      user: {
        id: 'mock-user-id',
        email: 'maker@diygenius.ai',
        user_metadata: { name: 'DIY Master' }
      }
    };
    setSession(mockSession);
    syncUser(mockSession);
    showToast('Logged in as Demo Guest.');
  };

  // Handle Image Scanner Upload (calls backend detect endpoint)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !session) {
      if (!session) setError('Please sign in to scan materials using AI.');
      return;
    }
    
    setIsScanning(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_URL}/materials/detect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        },
        body: formData
      });

      if (!response.ok) throw new Error('Failed to parse materials from image');
      const data = await response.json();
      
      const newMaterials = data.materials || [];
      if (newMaterials.length > 0) {
        const combined = Array.from(new Set([...materials, ...newMaterials]));
        setMaterials(combined);
        showToast(`Detected ${newMaterials.length} materials!`);
      } else {
        setError('No materials detected. Try again with a clearer picture.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to detect materials.');
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastOpen(false);
    setTimeout(() => setToastOpen(true), 100);
  };

  const handleAddMaterial = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      const newMat = inputValue.trim().toLowerCase();
      if (!materials.includes(newMat)) {
        setMaterials([...materials, newMat]);
      }
      setInputValue('');
      setError(null);
    }
  };

  const removeMaterial = (mat: string) => {
    setMaterials(materials.filter(m => m !== mat));
  };

  // Generate Projects via Backend
  const handleGenerate = async () => {
    if (materials.length === 0) {
      setError("Please add at least one material to get started.");
      return;
    }
    if (!session) {
      setError("Please sign in to generate DIY projects.");
      return;
    }
    
    setError(null);
    setIsGenerating(true);
    setProjects([]);
    setView('results');

    try {
      const response = await fetch(`${API_URL}/projects/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          materials,
          difficulty,
          category
        })
      });

      if (!response.ok) throw new Error('Server error generating projects');
      const data = await response.json();
      setProjects(data.projects || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate projects. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Stripe subscription Checkout
  const handleUpgrade = async () => {
    if (!session) return;
    try {
      const response = await fetch(`${API_URL}/billing/checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.url) {
          window.location.href = data.url;
        }
      } else {
        showToast('Billing service unavailable right now.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const categories = [
    { id: 'Home Improvement', icon: <Hammer className="w-4 h-4" />, label: 'Home' },
    { id: 'Crafts', icon: <Scissors className="w-4 h-4" />, label: 'Crafts' },
    { id: 'Gardening', icon: <Leaf className="w-4 h-4" />, label: 'Garden' },
    { id: 'Surprise Me', icon: <Sparkles className="w-4 h-4" />, label: 'Surprise' },
  ];

  const getDifficultyColor = (diff: string) => {
    switch (diff.toLowerCase()) {
      case 'easy': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'medium': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'hard': return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      default: return 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20';
    }
  };

  // Nested Project Card Component (to call backend /generate/steps on expand)
  const ProjectCard = ({ project, isSavedView = false }: { project: any, isSavedView?: boolean }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [fullProject, setFullProject] = useState<Project | null>(project.steps ? project : null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [isSaved, setIsSaved] = useState(savedProjects.some(p => p.id === project.id));
    const [isLiked, setIsLiked] = useState(project.likes?.some((l: any) => l.userId === session?.user?.id));
    const [likeCount, setLikeCount] = useState(project.likes?.length || 0);

    // Cover Visual state
    const [imageUrl, setImageUrl] = useState<string | null>(project.imageUrl || null);
    const [isVisualizing, setIsVisualizing] = useState(false);

    // Comments states
    const [comments, setComments] = useState<CommentType[]>(project.comments || []);
    const [commentText, setCommentText] = useState('');

    useEffect(() => {
      setIsSaved(savedProjects.some(p => p.id === project.id));
    }, [savedProjects, project.id]);

    const handleCardClick = async () => {
      setIsExpanded(!isExpanded);
      if (fullProject || isLoadingDetails) return;

      setIsLoadingDetails(true);
      try {
        // Call backend generate/steps to generate full instructions and save to Postgres
        const response = await fetch(`${API_URL}/projects/generate/steps`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            title: project.title,
            description: project.description,
            difficulty: project.difficulty || 'Easy',
            category: project.category || 'Surprise Me',
            materials: project.materialsNeeded || materials
          })
        });

        if (response.ok) {
          const data = await response.json();
          setFullProject(data);
          // Sync saved projects list
          fetchSavedProjects();
        }
      } catch (err) {
        console.error('Failed to load steps', err);
      } finally {
        setIsLoadingDetails(false);
      }
    };

    const handleSave = async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!session) return;
      
      const targetId = fullProject?.id || project.id;
      try {
        const response = await fetch(`${API_URL}/projects/${targetId}/save`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setIsSaved(data.saved);
          fetchSavedProjects();
          showToast(data.saved ? 'Project bookmarked!' : 'Bookmark removed.');
        }
      } catch (e) {
        console.error(e);
      }
    };

    const handleLike = async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!session) return;

      const targetId = fullProject?.id || project.id;
      try {
        const response = await fetch(`${API_URL}/projects/${targetId}/like`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setIsLiked(data.liked);
          setLikeCount((prev: number) => data.liked ? prev + 1 : Math.max(0, prev - 1));
          showToast(data.liked ? 'Liked project!' : 'Unliked project.');
        }
      } catch (e) {
        console.error(e);
      }
    };

    const handleVisualize = async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!session) return;

      const targetId = fullProject?.id || project.id;
      setIsVisualizing(true);
      try {
        const response = await fetch(`${API_URL}/projects/${targetId}/visualize`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setImageUrl(data.imageUrl);
          showToast('Image generated successfully!');
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsVisualizing(false);
      }
    };

    const handlePostComment = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!commentText.trim() || !session) return;

      const targetId = fullProject?.id || project.id;
      try {
        const response = await fetch(`${API_URL}/projects/${targetId}/comments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({ content: commentText })
        });
        if (response.ok) {
          const newComment = await response.json();
          setComments([newComment, ...comments]);
          setCommentText('');
          showToast('Comment posted!');
        }
      } catch (e) {
        console.error(e);
      }
    };

    const handleShare = async (e: React.MouseEvent) => {
      e.stopPropagation();
      const text = `Check out this DIY Project: ${project.title}\n\nDifficulty: ${project.difficulty}\n\nCreated using DIY Genius AI!`;
      if (navigator.share) {
        try {
          await navigator.share({ title: project.title, text });
        } catch (err) {
          console.error(err);
        }
      } else {
        navigator.clipboard.writeText(text);
        showToast('Link copied to clipboard!');
      }
    };

    return (
      <motion.div 
        layout
        onClick={handleCardClick}
        className="group flex flex-col bg-white dark:bg-[#0a0a0c] rounded-2xl border border-zinc-200 dark:border-zinc-800/80 overflow-hidden cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 shadow-sm hover:shadow-md"
      >
        <div className="p-5 sm:p-6 bg-zinc-50/50 dark:bg-[#0f0f12] border-b border-zinc-100 dark:border-zinc-800/50">
          <div className="flex items-start justify-between gap-4 mb-3">
            <h3 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 leading-snug">
              {project.title}
            </h3>
            <div className="flex items-center gap-1 shrink-0 print:hidden" onClick={e => e.stopPropagation()}>
              <SimpleTooltip content="Share Project">
                <button 
                  onClick={handleShare}
                  className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-md transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </SimpleTooltip>
              {session && (
                <>
                  <SimpleTooltip content={isLiked ? "Unlike" : "Like"}>
                    <button 
                      onClick={handleLike}
                      className={`p-1.5 rounded-md transition-colors flex items-center gap-1 text-xs ${isLiked ? 'text-rose-500' : 'text-zinc-400 hover:text-rose-600'}`}
                    >
                      <Heart className="w-4 h-4" fill={isLiked ? "currentColor" : "none"} />
                      <span>{likeCount}</span>
                    </button>
                  </SimpleTooltip>
                  <SimpleTooltip content={isSaved ? "Remove bookmark" : "Save project"}>
                    <button 
                      onClick={handleSave}
                      className={`p-1.5 rounded-md transition-colors ${isSaved ? 'text-indigo-500' : 'text-zinc-400 hover:text-indigo-400'}`}
                    >
                      {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                    </button>
                  </SimpleTooltip>
                </>
              )}
            </div>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
            {project.description}
          </p>

          <div className="flex flex-wrap items-center gap-2 mt-4 pt-2">
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider border ${getDifficultyColor(project.difficulty || 'Easy')}`}>
              {project.difficulty || 'Easy'}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400 text-[10px] font-mono uppercase tracking-wider border border-zinc-200 dark:border-zinc-700/50">
              <Clock className="w-3 h-3" />
              {project.timeEstimate || '2 hours'}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-mono uppercase tracking-wider border border-indigo-500/20">
              {project.category || 'DIY'}
            </span>
            {project.author && (
              <span className="text-xs text-zinc-400 ml-auto flex items-center gap-1.5">
                {project.author.avatarUrl ? (
                  <img src={project.author.avatarUrl} className="w-4 h-4 rounded-full" />
                ) : (
                  <div className="w-4 h-4 rounded-full bg-zinc-700 flex items-center justify-center text-[8px] text-white">U</div>
                )}
                {project.author.name}
              </span>
            )}
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-5 sm:p-6 border-t border-zinc-100 dark:border-zinc-850 flex flex-col gap-6" onClick={e => e.stopPropagation()}>
                {isLoadingDetails ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-3 text-zinc-400">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                    <span className="text-xs font-mono">Generating Full Instructions...</span>
                  </div>
                ) : (
                  <>
                    {/* Visual Project Image Cover */}
                    {imageUrl ? (
                      <div className="relative aspect-video rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 group">
                        <img src={imageUrl} alt={project.title} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      session && (
                        <button
                          onClick={handleVisualize}
                          disabled={isVisualizing}
                          className="flex items-center justify-center gap-2 w-full py-6 border border-dashed border-zinc-300 dark:border-zinc-850 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 rounded-xl text-xs font-mono text-zinc-400 hover:text-zinc-100 transition-all"
                        >
                          {isVisualizing ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                              Generating Visual Preview...
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4" />
                              Generate DALL-E 3 Assembly Cover
                            </>
                          )}
                        </button>
                      )
                    )}

                    {/* Materials Needed */}
                    {fullProject?.materials && (
                      <div>
                        <h4 className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2">
                          Required Materials
                        </h4>
                        <ul className="flex flex-wrap gap-2 text-xs">
                          {fullProject.materials.map((m: any, idx: number) => (
                            <li key={idx} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                              {m.material?.name || m.material}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Required Tools */}
                    {fullProject?.tools && fullProject.tools.length > 0 && (
                      <div>
                        <h4 className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2">
                          Required Tools
                        </h4>
                        <ul className="flex flex-wrap gap-2 text-xs">
                          {fullProject.tools.map((t: any, idx: number) => (
                            <li key={idx} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border bg-amber-500/5 text-amber-600 border-amber-500/20">
                              <Wrench className="w-3.5 h-3.5" />
                              {t.tool?.name || t.tool}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Instructions Steps */}
                    {fullProject?.steps && (
                      <div>
                        <h4 className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-3">
                          Step-by-Step Instructions
                        </h4>
                        <ol className="space-y-4">
                          {fullProject.steps.map((step: any, idx: number) => (
                            <li key={idx} className="flex flex-col gap-1.5 text-sm bg-zinc-50/20 dark:bg-zinc-900/20 p-3 rounded-lg border border-zinc-100 dark:border-zinc-900">
                              <div className="flex gap-2">
                                <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded bg-indigo-500/10 text-indigo-400 font-mono text-[10px] mt-0.5">
                                  {step.stepNumber}
                                </span>
                                <span className="leading-relaxed text-zinc-700 dark:text-zinc-300">{step.instruction}</span>
                              </div>
                              {step.safetyWarning && (
                                <div className="text-xs text-amber-600 bg-amber-500/5 border border-amber-500/10 rounded px-2 py-1 ml-7 flex items-center gap-1.5">
                                  <AlertCircle className="w-3.5 h-3.5" />
                                  <span>{step.safetyWarning}</span>
                                </div>
                              )}
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {/* Community Comments */}
                    {session && (
                      <div className="border-t border-zinc-200 dark:border-zinc-850 pt-4 space-y-4">
                        <h4 className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
                          Community Comments ({comments.length})
                        </h4>
                        
                        <form onSubmit={handlePostComment} className="flex items-center gap-2">
                          <input 
                            type="text"
                            value={commentText}
                            onChange={e => setCommentText(e.target.value)}
                            placeholder="Add a comment..."
                            className="flex-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-950 dark:text-zinc-50 outline-none focus:border-indigo-500"
                          />
                          <button type="submit" className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </form>

                        <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1">
                          {comments.map((comment, idx) => (
                            <div key={idx} className="flex gap-2.5 items-start text-xs border-b border-zinc-100 dark:border-zinc-900 pb-2">
                              <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center text-[8px] text-white uppercase shrink-0">
                                {comment.user?.avatarUrl ? (
                                  <img src={comment.user.avatarUrl} className="w-full h-full rounded-full" />
                                ) : (
                                  comment.user?.name?.[0] || 'U'
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center justify-between">
                                  <span>{comment.user?.name}</span>
                                  <span className="text-[9px] text-zinc-500 font-mono">
                                    {new Date(comment.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-zinc-600 dark:text-zinc-400 mt-0.5 leading-relaxed">{comment.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <Toast.Provider swipeDirection="right">
      <div className="min-h-screen bg-[#f5f5f7] dark:bg-[#050507] text-zinc-900 dark:text-zinc-50 transition-colors duration-300 selection:bg-indigo-500/30 font-sans">
        
        {/* Navigation Header */}
        <header className="sticky top-0 z-50 w-full border-b border-zinc-200/50 dark:border-zinc-800/50 bg-[#f5f5f7]/80 dark:bg-[#050507]/80 backdrop-blur-xl">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <div 
              className="flex items-center gap-2.5 font-semibold text-sm tracking-tight cursor-pointer"
              onClick={() => setView('input')}
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md">
                <Wrench className="w-4 h-4" />
              </div>
              <span className="font-mono uppercase tracking-widest text-xs font-bold text-zinc-900 dark:text-white">
                DIY Genius<span className="text-indigo-500">.AI</span>
              </span>
            </div>
            
            <div className="flex items-center gap-2 print:hidden">
              {session ? (
                <div className="flex items-center gap-2.5">
                  {dbUser?.isPremium && (
                    <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider">
                      Premium
                    </span>
                  )}
                  <SimpleTooltip content="Sign Out">
                    <button 
                      onClick={handleSignOut}
                      className="p-2 rounded-md hover:bg-zinc-200/50 dark:hover:bg-zinc-855 transition-colors text-zinc-500 hover:text-rose-500"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </SimpleTooltip>
                </div>
              ) : (
                <span className="text-xs text-zinc-400 font-mono flex items-center gap-1.5">
                  <LogIn className="w-3.5 h-3.5" /> Sign in for generator
                </span>
              )}
              
              <SimpleTooltip content="Toggle Theme">
                <button 
                  onClick={toggleTheme}
                  className="p-2 rounded-md hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 transition-colors text-zinc-500 dark:text-zinc-400"
                >
                  {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </button>
              </SimpleTooltip>
            </div>
          </div>
        </header>

        {/* Auth form if not authenticated */}
        {!session && (
          <div className="max-w-md mx-auto px-6 py-20">
            <div className="bg-white dark:bg-[#0a0a0c] rounded-2xl border border-zinc-250 dark:border-zinc-850 p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                  {isSignUp ? 'Create SaaS Account' : 'Welcome Maker'}
                </h2>
                <p className="text-xs text-zinc-500">
                  {isSignUp ? 'Sign up to build, scan, and generate DIY projects.' : 'Sign in to access your DIY Workspace.'}
                </p>
              </div>

              <form onSubmit={handleAuth} className="space-y-4">
                {isSignUp && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-zinc-400">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={authName}
                      onChange={e => setAuthName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-950 dark:text-zinc-50 outline-none focus:border-indigo-500"
                    />
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-zinc-400">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={authEmail}
                    onChange={e => setAuthEmail(e.target.value)}
                    placeholder="maker@diygenius.ai"
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-950 dark:text-zinc-50 outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-zinc-400">Password</label>
                  <input 
                    type="password" 
                    required
                    value={authPassword}
                    onChange={e => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-950 dark:text-zinc-50 outline-none focus:border-indigo-500"
                  />
                </div>

                {error && (
                  <div className="text-xs text-rose-500 bg-rose-500/5 border border-rose-500/10 p-2.5 rounded-lg flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2"
                >
                  {authLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {isSignUp ? 'Sign Up' : 'Sign In'}
                </button>

                {!isSignUp && (
                  <>
                    <div className="relative flex py-2 items-center">
                      <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
                      <span className="flex-shrink mx-4 text-zinc-450 text-[10px] font-mono uppercase">Or</span>
                      <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
                    </div>

                    <button
                      type="button"
                      onClick={handleGuestLogin}
                      className="w-full py-3 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900/60 dark:hover:bg-zinc-900 text-zinc-900 dark:text-white rounded-xl font-semibold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 border border-zinc-200 dark:border-zinc-800/80 shadow-sm"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500 fill-current" />
                      Continue as Demo Guest
                    </button>
                  </>
                )}
              </form>

              <div className="text-center pt-2">
                <button 
                  onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
                  className="text-xs text-indigo-500 hover:underline"
                >
                  {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Authenticated Workspace View */}
        {session && (
          <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 overflow-hidden">
            <AnimatePresence mode="wait">
              {view === 'input' ? (
                <motion.div 
                  key="input-view"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15, filter: 'blur(5px)' }}
                  className="max-w-2xl mx-auto space-y-12"
                >
                  {/* Hero Intro */}
                  <div className="text-center space-y-4">
                    <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-tight">
                      AI DIY Project <br />
                      <span className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">Genius Creator</span>
                    </h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
                      Upload photos to scan materials automatically, choose categories, and let AI outline safety-first craft projects.
                    </p>
                  </div>

                  {/* Radix Tabs Nav */}
                  <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <Tabs.List className="flex w-full border-b border-zinc-200 dark:border-zinc-800 mb-8">
                      <Tabs.Trigger 
                        value="generate" 
                        className="flex-1 pb-3 text-xs font-mono uppercase tracking-wider text-zinc-400 hover:text-zinc-900 dark:hover:text-white data-[state=active]:text-indigo-500 dark:data-[state=active]:text-indigo-400 data-[state=active]:border-b-2 data-[state=active]:border-indigo-500 transition-all font-semibold"
                      >
                        DIY Workspace
                      </Tabs.Trigger>
                      <Tabs.Trigger 
                        value="community" 
                        className="flex-1 pb-3 text-xs font-mono uppercase tracking-wider text-zinc-400 hover:text-zinc-900 dark:hover:text-white data-[state=active]:text-indigo-500 dark:data-[state=active]:text-indigo-400 data-[state=active]:border-b-2 data-[state=active]:border-indigo-500 transition-all font-semibold"
                      >
                        Community Ideas
                      </Tabs.Trigger>
                      <Tabs.Trigger 
                        value="saved" 
                        className="flex-1 pb-3 text-xs font-mono uppercase tracking-wider text-zinc-400 hover:text-zinc-900 dark:hover:text-white data-[state=active]:text-indigo-500 dark:data-[state=active]:text-indigo-400 data-[state=active]:border-b-2 data-[state=active]:border-indigo-500 transition-all font-semibold flex items-center justify-center gap-1.5"
                      >
                        Saved
                        {savedProjects.length > 0 && (
                          <span className="bg-indigo-600 text-white py-0.5 px-1.5 rounded-full text-[9px] font-mono">
                            {savedProjects.length}
                          </span>
                        )}
                      </Tabs.Trigger>
                      <Tabs.Trigger 
                        value="premium" 
                        className="flex-1 pb-3 text-xs font-mono uppercase tracking-wider text-indigo-400 hover:text-indigo-300 data-[state=active]:text-indigo-500 dark:data-[state=active]:text-indigo-400 data-[state=active]:border-b-2 data-[state=active]:border-indigo-500 transition-all font-semibold flex items-center justify-center gap-1"
                      >
                        <Sparkles className="w-3.5 h-3.5 fill-current" />
                        Billing
                      </Tabs.Trigger>
                    </Tabs.List>

                    {/* Generate Content Tab */}
                    <Tabs.Content value="generate" className="outline-none">
                      <div className="bg-white dark:bg-[#0a0a0c] rounded-2xl border border-zinc-200 dark:border-zinc-800/80 p-6 sm:p-8 space-y-6 shadow-md relative overflow-hidden">
                        
                        {/* Material Upload Zone */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 flex items-center justify-between">
                            <span>01. Scan Materials (Optional)</span>
                            {isScanning && <span className="text-indigo-500 font-semibold flex items-center gap-1 animate-pulse"><Loader2 className="w-3 h-3 animate-spin" /> Analyzing Image...</span>}
                          </label>
                          <div className="border border-dashed border-zinc-300 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 rounded-xl p-6 text-center cursor-pointer bg-zinc-50/20 dark:bg-zinc-900/10">
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              id="image-scanner"
                              onChange={handleImageUpload}
                            />
                            <label htmlFor="image-scanner" className="cursor-pointer flex flex-col items-center gap-2">
                              <Plus className="w-5 h-5 text-zinc-500" />
                              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-350 hover:underline">Click to scan image</span>
                            </label>
                          </div>
                        </div>

                        {/* Materials Tags List */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 flex items-center justify-between">
                            <span>02. Available Materials List</span>
                            <span className="text-[9px] bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-500">Press Enter</span>
                          </label>
                          <div className="min-h-[100px] p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-[#0f0f12] flex flex-wrap gap-2 items-start content-start">
                            <AnimatePresence>
                              {materials.map((mat) => (
                                <motion.span
                                  key={mat}
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.9 }}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white dark:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 shadow-sm"
                                >
                                  {mat}
                                  <button onClick={() => removeMaterial(mat)} className="text-zinc-400 hover:text-rose-500 focus:outline-none">
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </motion.span>
                              ))}
                            </AnimatePresence>
                            <input
                              type="text"
                              value={inputValue}
                              onChange={(e) => setInputValue(e.target.value)}
                              onKeyDown={handleAddMaterial}
                              placeholder={materials.length === 0 ? "Type material (e.g. Cardboard box, string)..." : "Add another..."}
                              className="flex-1 min-w-[150px] bg-transparent border-none outline-none py-1 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 font-mono"
                            />
                          </div>
                        </div>

                        {/* Difficulty and Category selectors */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">03. Difficulty</label>
                            <select 
                              value={difficulty} 
                              onChange={e => setDifficulty(e.target.value as any)}
                              className="w-full bg-zinc-50 dark:bg-[#0f0f12] border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs outline-none text-zinc-700 dark:text-zinc-350 cursor-pointer"
                            >
                              <option value="EASY">Easy</option>
                              <option value="MEDIUM">Medium</option>
                              <option value="HARD">Hard</option>
                            </select>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">04. Category Hint</label>
                            <select 
                              value={category} 
                              onChange={e => setCategory(e.target.value)}
                              className="w-full bg-zinc-50 dark:bg-[#0f0f12] border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs outline-none text-zinc-700 dark:text-zinc-350 cursor-pointer"
                            >
                              <option value="Surprise Me">Surprise Me</option>
                              <option value="Home Improvement">Home Improvement</option>
                              <option value="Crafts">Crafts</option>
                              <option value="Gardening">Gardening</option>
                            </select>
                          </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                          <div className="flex items-center gap-2 text-xs text-rose-500 bg-rose-500/5 p-3 rounded-lg border border-rose-500/10">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <p>{error}</p>
                          </div>
                        )}

                        {/* Generate Trigger */}
                        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/60">
                          <button
                            onClick={handleGenerate}
                            disabled={isGenerating || materials.length === 0}
                            className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 px-6 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-indigo-500/10"
                          >
                            {isGenerating ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-sm font-mono tracking-wider uppercase">Engineering Blueprints...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4" />
                                <span className="text-sm font-mono tracking-wider uppercase">Generate Project Blueprints</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </Tabs.Content>

                    {/* Community feed Tab Content */}
                    <Tabs.Content value="community" className="outline-none">
                      <div className="space-y-6">
                        {/* Search Filter Bar */}
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search projects by query (semantic vector matching)..."
                            className="flex-1 bg-white dark:bg-[#0a0a0c] border border-zinc-255 dark:border-zinc-855 rounded-xl px-4 py-3 text-xs text-zinc-955 dark:text-zinc-55 outline-none focus:border-indigo-500"
                          />
                        </div>

                        {communityProjects.length === 0 ? (
                          <div className="text-center py-20 bg-white dark:bg-[#0a0a0c] rounded-2xl border border-zinc-200 dark:border-zinc-800/80">
                            <Sparkles className="w-8 h-8 mx-auto text-zinc-300 dark:text-zinc-700 mb-2" />
                            <h3 className="text-sm font-medium text-zinc-900 dark:text-white mb-1">No community projects found</h3>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">Search for something else or generate a project first!</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 gap-6">
                            {communityProjects.map(project => (
                              <ProjectCard key={project.id} project={project} />
                            ))}
                          </div>
                        )}
                      </div>
                    </Tabs.Content>

                    {/* Saved Bookmarks Tab Content */}
                    <Tabs.Content value="saved" className="outline-none">
                      {savedProjects.length === 0 ? (
                        <div className="text-center py-20 bg-white dark:bg-[#0a0a0c] rounded-2xl border border-zinc-200 dark:border-zinc-800/80 border-dashed">
                          <Bookmark className="w-8 h-8 mx-auto text-zinc-300 dark:text-zinc-700 mb-3" />
                          <h3 className="text-sm font-medium text-zinc-900 dark:text-white mb-1">No bookmarked blueprints</h3>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">Bookmark projects to see them here.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-6">
                          {savedProjects.map(project => (
                            <ProjectCard key={project.id} project={project} isSavedView={true} />
                          ))}
                        </div>
                      )}
                    </Tabs.Content>

                    {/* Billing Upgrades Content */}
                    <Tabs.Content value="premium" className="outline-none">
                      <div className="bg-white dark:bg-[#0a0a0c] rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 space-y-6 shadow-md text-center max-w-md mx-auto">
                        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-2">
                          <Sparkles className="w-6 h-6 fill-current" />
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                          Unlock DIY Genius Premium
                        </h2>
                        <p className="text-xs text-zinc-500 leading-relaxed">
                          Get unlimited scanning, DALL-E 3 visual previews, professional blueprint exports to PDF, and video tutorial script guides.
                        </p>
                        
                        <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800/50">
                          <span className="text-3xl font-extrabold text-zinc-955 dark:text-white">$9.99</span>
                          <span className="text-xs text-zinc-500 font-mono"> / month</span>
                        </div>

                        {dbUser?.isPremium ? (
                          <div className="py-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-mono uppercase tracking-wider font-semibold">
                            You are a Premium Member
                          </div>
                        ) : (
                          <button
                            onClick={handleUpgrade}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-mono uppercase tracking-wider font-semibold transition-all hover:shadow-lg"
                          >
                            Upgrade Now via Stripe
                          </button>
                        )}
                      </div>
                    </Tabs.Content>
                  </Tabs.Root>
                </motion.div>
              ) : (
                <motion.div 
                  key="results-view"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15, filter: 'blur(5px)' }}
                  className="space-y-6 max-w-3xl mx-auto"
                >
                  <div>
                    <button 
                      onClick={() => setView('input')}
                      className="inline-flex items-center gap-1 text-xs font-mono uppercase tracking-wider text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors mb-2"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Back to input
                    </button>
                    <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                      Recommended DIY Projects
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      We matched your materials list. Expand any project to generate a detailed assembly sequence and blueprints.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    {isGenerating ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0f0f12] overflow-hidden shadow-sm animate-pulse">
                          <div className="p-6 space-y-4">
                            <div className="h-6 w-1/3 bg-zinc-200 dark:bg-zinc-800 rounded-md"></div>
                            <div className="h-4 w-5/6 bg-zinc-200 dark:bg-zinc-800 rounded-md"></div>
                            <div className="h-4 w-2/3 bg-zinc-200 dark:bg-zinc-800 rounded-md"></div>
                          </div>
                        </div>
                      ))
                    ) : (
                      projects.map((project, idx) => (
                        <ProjectCard key={project.id || idx} project={project} />
                      ))
                    )}
                    
                    {!isGenerating && projects.length === 0 && (
                       <div className="text-center py-12 text-zinc-500 dark:text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                         No project recommendations found. Try adding more materials.
                       </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        )}

        {/* Global Toast Notifications */}
        <Toast.Root 
          open={toastOpen} 
          onOpenChange={setToastOpen}
          className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-lg rounded-lg p-3.5 flex items-center gap-3 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-bottom-full sm:w-auto z-[200]"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <Toast.Title className="text-xs font-semibold">{toastMessage}</Toast.Title>
        </Toast.Root>
        <Toast.Viewport className="fixed bottom-0 right-0 p-6 w-full sm:w-auto max-w-sm z-[100] flex flex-col gap-2 outline-none" />
      </div>
    </Toast.Provider>
  );
}
