'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import { 
  Plus, X, Hammer, Scissors, Leaf, Sparkles, 
  Moon, Sun, ArrowLeft, Clock, Wrench, Loader2,
  AlertCircle, Bookmark, BookmarkCheck, Share2, Printer, Trash2, CheckCircle2,
  ChevronDown, ChevronUp, Image, Globe, Link as LinkIcon, Video, Youtube
} from 'lucide-react';
import * as Tabs from '@radix-ui/react-tabs';
import * as Toast from '@radix-ui/react-toast';
import * as Tooltip from '@radix-ui/react-tooltip';
import Markdown from 'react-markdown';

interface Project {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  estimatedTime: string;
  materialsNeeded: string[];
  instructions: string[];
  category: string;
}

type Category = string;

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
          className="z-[100] px-2.5 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 text-[11px] font-medium tracking-wide rounded-md shadow-md animate-in fade-in zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95"
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
  
  const [materials, setMaterials] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [category, setCategory] = useState<Category>('Surprise Me');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [savedProjects, setSavedProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);

  // AI Category Suggestion State
  const [suggestedCategory, setSuggestedCategory] = useState<string | null>(null);
  const [isSuggestingCategory, setIsSuggestingCategory] = useState(false);

  // Toast state
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const [hasApiKey, setHasApiKey] = useState(true);

  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      setTheme('light');
    }
    const saved = localStorage.getItem('diy_saved_projects');
    if (saved) {
      try {
        setSavedProjects(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved projects');
      }
    }
    
    // Check for API key for premium features
    if (typeof window !== 'undefined' && (window as any).aistudio?.hasSelectedApiKey) {
      (window as any).aistudio.hasSelectedApiKey().then(setHasApiKey);
    }
  }, []);

  const handleSelectKey = async () => {
    if ((window as any).aistudio?.openSelectKey) {
      await (window as any).aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('diy_saved_projects', JSON.stringify(savedProjects));
  }, [savedProjects]);

  useEffect(() => {
    if (materials.length === 0) {
      setSuggestedCategory(null);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSuggestingCategory(true);
      try {
        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
        if (!apiKey) return;
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite-preview',
          contents: `Based on a user having these materials for a DIY project: ${materials.join(', ')}. Suggest ONE highly relevant, specific DIY project category (e.g., Woodworking, Upcycled Fashion, Electronics, Pallet Furniture). Respond with ONLY the category name, max 3 words. Do not use quotes or markdown.`,
          config: { temperature: 0.3 }
        });
        const text = response.text?.trim().replace(/['"]/g, '') || null;
        if (text && text.length > 0 && text.length < 30) {
           setSuggestedCategory(text);
        }
      } catch (err) {
        console.error("Failed to suggest category", err);
      } finally {
        setIsSuggestingCategory(false);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [materials]);

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

  const handleGenerate = async () => {
    if (materials.length === 0) {
      setError("Please add at least one material to get started.");
      return;
    }
    
    setError(null);
    setIsGenerating(true);
    setProjects([]);
    setView('results');

    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Gemini API Key is missing.");
      }
      
      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = `I have the following materials available: ${materials.join(', ')}. 
      Generate 3 creative DIY projects. 
      You MUST assign a clear category to each project from this list: "Home Improvement", "Crafts", "Gardening", "Electronics", "Upcycling", or create a highly relevant one.
      Current preferred category: "${category}".
      Ensure the projects are practical, safe, and primarily use the provided materials, though basic household items (like glue, scissors, nails) can be assumed.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "Catchy title for the project" },
                description: { type: Type.STRING, description: "Short 1-2 sentence description" },
                difficulty: { type: Type.STRING, description: "Easy, Medium, or Hard" },
                estimatedTime: { type: Type.STRING, description: "e.g., 2 hours, 1 day" },
                materialsNeeded: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING },
                  description: "List of all materials needed"
                },
                instructions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Step-by-step instructions"
                },
                category: { type: Type.STRING, description: "The specific category of the project" }
              },
              required: ["title", "description", "difficulty", "estimatedTime", "materialsNeeded", "instructions", "category"]
            }
          }
        }
      });

      const data = JSON.parse(response.text || '[]');
      const projectsWithIds = data.map((p: any) => ({ ...p, id: crypto.randomUUID() }));
      setProjects(projectsWithIds);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate projects. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleSaveProject = (project: Project) => {
    const isSaved = savedProjects.some(p => p.id === project.id);
    if (isSaved) {
      setSavedProjects(savedProjects.filter(p => p.id !== project.id));
      showToast('Project removed from saved');
    } else {
      setSavedProjects([...savedProjects, project]);
      showToast('Project saved successfully');
    }
  };

  const handleShare = async (project: Project) => {
    const text = `Check out this DIY Project: ${project.title}\n\nMaterials: ${project.materialsNeeded.join(', ')}\n\nTime: ${project.estimatedTime}\nDifficulty: ${project.difficulty}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: project.title,
          text: text,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(text);
      showToast('Project details copied to clipboard!');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const categories: { id: Category; icon: React.ReactNode; label: string }[] = [
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

  const ProjectCard = ({ project, isSavedView = false }: { project: Project, isSavedView?: boolean }) => {
    const isSaved = savedProjects.some(p => p.id === project.id);
    const [isExpanded, setIsExpanded] = useState(false);
    const [deepDiveResult, setDeepDiveResult] = useState<string | null>(null);
    const [isDeepDiving, setIsDeepDiving] = useState(false);
    
    // Image Generation State
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('1K');

    // Search Grounding State
    const [searchResult, setSearchResult] = useState<string | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [groundingChunks, setGroundingChunks] = useState<any[]>([]);

    // Video Tutorials State
    const [videos, setVideos] = useState<{title: string, url: string}[] | null>(null);
    const [isFindingVideos, setIsFindingVideos] = useState(false);

    const getMaterialAvailability = (reqMat: string, userMats: string[]) => {
      if (isSavedView) return 'unknown';
      if (userMats.length === 0) return 'missing';
      const r = reqMat.toLowerCase();
      const u = userMats.map(m => m.toLowerCase());
      
      if (u.some(m => r === m || r.includes(m) || m.includes(r))) {
        return 'full';
      }
      
      const rWords = r.split(/[\s,-]+/);
      for (const um of u) {
        const uWords = um.split(/[\s,-]+/);
        const intersection = rWords.filter(w => uWords.includes(w) && w.length > 2);
        if (intersection.length > 0) return 'partial';
      }
      return 'missing';
    };

    const handleFindVideos = async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (videos) return;
      setIsFindingVideos(true);
      try {
        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
        if (!apiKey) throw new Error("API Key is missing.");
        
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `Find 2 YouTube tutorial videos for the DIY project: "${project.title}". Return ONLY a JSON array of objects with 'title' and 'url'. The 'url' must be the full YouTube watch URL. Do not include any markdown formatting like \`\`\`json.`,
          config: {
            tools: [{ googleSearch: {} }]
          }
        });
        
        let text = response.text || "[]";
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsedVideos = JSON.parse(text);
        setVideos(parsedVideos);
      } catch (err) {
        console.error(err);
        setVideos([]);
        showToast("Failed to find videos.");
      } finally {
        setIsFindingVideos(false);
      }
    };

    const getEmbedUrl = (url: string) => {
      const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
      return match ? `https://www.youtube.com/embed/${match[1]}` : null;
    };

    const handleDeepDive = async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (deepDiveResult) return;
      
      setIsDeepDiving(true);
      try {
        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
        if (!apiKey) throw new Error("Gemini API Key is missing.");
        
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `Provide a deep dive analysis for the DIY project: "${project.title}". 
        Include safety precautions, pro tips for success, and potential variations. 
        Project description: ${project.description}
        Materials: ${project.materialsNeeded.join(', ')}
        Instructions: ${project.instructions.join(' ')}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.1-pro-preview',
          contents: prompt,
          config: {
            thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
          }
        });

        setDeepDiveResult(response.text || "No analysis generated.");
      } catch (err) {
        console.error(err);
        setDeepDiveResult("Failed to generate deep dive analysis.");
      } finally {
        setIsDeepDiving(false);
      }
    };

    const handleGenerateImage = async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!hasApiKey) {
        await handleSelectKey();
        return;
      }
      setIsGeneratingImage(true);
      try {
        const apiKey = process.env.API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
        if (!apiKey) throw new Error("API Key is missing.");
        
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: 'gemini-3-pro-image-preview',
          contents: `A high quality photo of a completed DIY project: ${project.title}. ${project.description}`,
          config: {
            imageConfig: {
              imageSize: imageSize,
              aspectRatio: "16:9"
            }
          }
        });
        
        for (const part of response.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData) {
            setImageUrl(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
            break;
          }
        }
      } catch (err) {
        console.error(err);
        showToast("Failed to generate image.");
      } finally {
        setIsGeneratingImage(false);
      }
    };

    const handleSearch = async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (searchResult) return;
      setIsSearching(true);
      try {
        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
        if (!apiKey) throw new Error("API Key is missing.");
        
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `Find additional tips, variations, or material sourcing information related to the DIY project: "${project.title}".`,
          config: {
            tools: [{ googleSearch: {} }]
          }
        });
        
        setSearchResult(response.text || "No results found.");
        setGroundingChunks(response.candidates?.[0]?.groundingMetadata?.groundingChunks || []);
      } catch (err) {
        console.error(err);
        setSearchResult("Failed to search the web.");
      } finally {
        setIsSearching(false);
      }
    };
    
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98 }}
        layout
        onClick={() => setIsExpanded(!isExpanded)}
        className="group flex flex-col bg-white dark:bg-[#0a0a0a] rounded-2xl border border-zinc-200 dark:border-zinc-800/80 overflow-hidden cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 shadow-sm hover:shadow-md dark:shadow-none"
      >
        {/* Card Header */}
        <div className="p-5 sm:p-6 bg-zinc-50/50 dark:bg-[#0f0f0f] border-b border-zinc-100 dark:border-zinc-800/50">
          <div className="flex items-start justify-between gap-4 mb-3">
            <h3 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 leading-snug">
              {project.title}
            </h3>
            <div className="flex items-center gap-1 shrink-0 print:hidden" onClick={e => e.stopPropagation()}>
              <SimpleTooltip content="Share Project">
                <button 
                  onClick={() => handleShare(project)}
                  className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-md transition-colors"
                  title="Share"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </SimpleTooltip>
              <SimpleTooltip content={isSaved ? "Remove from saved" : "Save project"}>
                <button 
                  onClick={() => toggleSaveProject(project)}
                  className={`p-1.5 rounded-md transition-colors ${isSaved ? 'text-indigo-500' : 'text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'}`}
                  title={isSaved ? "Remove from saved" : "Save project"}
                >
                  {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                </button>
              </SimpleTooltip>
            </div>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
            {project.description}
          </p>
          
          <AnimatePresence>
            {!isExpanded ? (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-center justify-center mt-4 text-zinc-300 dark:text-zinc-700 group-hover:text-zinc-500 dark:group-hover:text-zinc-500 transition-colors">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-zinc-200 dark:border-zinc-800/80">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider border ${getDifficultyColor(project.difficulty)}`}>
                    {project.difficulty}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400 text-[10px] font-mono uppercase tracking-wider border border-zinc-200 dark:border-zinc-700/50">
                    <Clock className="w-3 h-3" />
                    {project.estimatedTime}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-mono uppercase tracking-wider border border-indigo-500/20">
                    {project.category}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Card Body */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-5 sm:p-6 flex-1 flex flex-col gap-8" onClick={e => e.stopPropagation()}>
                {/* Materials List */}
                <div>
                  <h4 className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-3">
                    Materials Needed
                  </h4>
                  <ul className="flex flex-wrap gap-2 text-xs">
                    {project.materialsNeeded.map((mat, i) => {
                      const avail = getMaterialAvailability(mat, materials);
                      let styleClass = 'bg-zinc-50 dark:bg-zinc-900/50 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800';
                      let dotClass = 'bg-zinc-400';
                      
                      if (avail === 'full') {
                        styleClass = 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30';
                        dotClass = 'bg-emerald-500';
                      } else if (avail === 'partial') {
                        styleClass = 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30';
                        dotClass = 'bg-amber-500';
                      } else if (avail === 'missing') {
                        styleClass = 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/30';
                        dotClass = 'bg-rose-500';
                      }

                      return (
                        <SimpleTooltip key={i} content={
                          avail === 'full' ? 'Directly available' :
                          avail === 'partial' ? 'Partially matches your materials' :
                          avail === 'missing' ? 'Not in your materials list' : 'Availability unknown'
                        }>
                          <li 
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border cursor-help transition-colors ${styleClass}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClass}`} />
                            {mat}
                          </li>
                        </SimpleTooltip>
                      );
                    })}
                  </ul>
                </div>

                {/* Instructions */}
                <div className="flex-1">
                  <h4 className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-4">
                    Instructions
                  </h4>
                  <ol className="space-y-4">
                    {project.instructions.map((step, i) => (
                      <li key={i} className="flex gap-4 text-sm text-zinc-700 dark:text-zinc-300">
                        <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 font-mono text-xs mt-0.5">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className="leading-relaxed pt-0.5">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Action Grid */}
                <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 flex flex-col gap-4">
                  <h4 className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                    AI Tools
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Deep Dive Button */}
                    {!deepDiveResult ? (
                      <SimpleTooltip content="Get a detailed AI breakdown and variations">
                        <button
                          onClick={handleDeepDive}
                          disabled={isDeepDiving}
                          className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-zinc-100 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 font-medium text-xs hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50 border border-zinc-200 dark:border-zinc-700/50"
                        >
                          {isDeepDiving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                          {isDeepDiving ? 'Analyzing...' : 'Deep Dive Analysis'}
                        </button>
                      </SimpleTooltip>
                    ) : (
                      <div className="col-span-1 sm:col-span-2 space-y-3 bg-zinc-50 dark:bg-zinc-900/30 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800/80">
                        <h4 className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                          <Sparkles className="w-3 h-3" />
                          Gemini Analysis
                        </h4>
                        <div className="text-sm text-zinc-700 dark:text-zinc-300 prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed">
                          <Markdown>{deepDiveResult}</Markdown>
                        </div>
                      </div>
                    )}

                    {/* Search Grounding Button */}
                    {!searchResult ? (
                      <SimpleTooltip content="Search the web for tips and sourcing info">
                        <button
                          onClick={handleSearch}
                          disabled={isSearching}
                          className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-zinc-100 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 font-medium text-xs hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50 border border-zinc-200 dark:border-zinc-700/50"
                        >
                          {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5" />}
                          {isSearching ? 'Searching...' : 'Search Tips & Sourcing'}
                        </button>
                      </SimpleTooltip>
                    ) : (
                      <div className="col-span-1 sm:col-span-2 space-y-3 bg-zinc-50 dark:bg-zinc-900/30 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800/80">
                        <h4 className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                          <Globe className="w-3 h-3" />
                          Web Results
                        </h4>
                        <div className="text-sm text-zinc-700 dark:text-zinc-300 prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed">
                          <Markdown>{searchResult}</Markdown>
                        </div>
                        {groundingChunks.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap gap-2">
                            {groundingChunks.map((chunk, idx) => (
                              chunk.web?.uri && (
                                <a key={idx} href={chunk.web.uri} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="text-[11px] text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:underline flex items-center gap-1 bg-white dark:bg-zinc-800 px-2 py-1 rounded border border-zinc-200 dark:border-zinc-700">
                                  <LinkIcon className="w-3 h-3" />
                                  {chunk.web.title || chunk.web.uri}
                                </a>
                              )
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Find Videos Button */}
                    {!videos ? (
                      <SimpleTooltip content="Find YouTube tutorials for this project">
                        <button
                          onClick={handleFindVideos}
                          disabled={isFindingVideos}
                          className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-zinc-100 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 font-medium text-xs hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50 border border-zinc-200 dark:border-zinc-700/50"
                        >
                          {isFindingVideos ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Youtube className="w-3.5 h-3.5" />}
                          {isFindingVideos ? 'Finding...' : 'Watch Tutorials'}
                        </button>
                      </SimpleTooltip>
                    ) : (
                      <div className="col-span-1 sm:col-span-2 space-y-3 bg-zinc-50 dark:bg-zinc-900/30 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800/80">
                        <h4 className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                          <Youtube className="w-3 h-3" />
                          Video Tutorials
                        </h4>
                        {videos.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {videos.map((video, idx) => {
                              const embedUrl = getEmbedUrl(video.url);
                              return (
                                <div key={idx} className="space-y-2">
                                  {embedUrl && (
                                    <div className="aspect-video rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900">
                                      <iframe 
                                        src={embedUrl} 
                                        title={video.title}
                                        className="w-full h-full"
                                        allowFullScreen
                                      />
                                    </div>
                                  )}
                                  <a href={video.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 line-clamp-2">
                                    {video.title || video.url}
                                  </a>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">No videos found for this project.</p>
                        )}
                      </div>
                    )}

                    {/* Image Generation */}
                    {!imageUrl && !isGeneratingImage && (
                      <div className="flex items-center gap-2">
                        <select 
                          value={imageSize} 
                          onChange={(e) => setImageSize(e.target.value as any)}
                          className="text-xs bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 rounded-lg px-2 py-2.5 outline-none text-zinc-700 dark:text-zinc-300 cursor-pointer"
                          onClick={e => e.stopPropagation()}
                        >
                          <option value="1K">1K</option>
                          <option value="2K">2K</option>
                          <option value="4K">4K</option>
                        </select>
                        <SimpleTooltip content="Generate an image of the finished project">
                          <button
                            onClick={handleGenerateImage}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-zinc-100 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 font-medium text-xs hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors border border-zinc-200 dark:border-zinc-700/50"
                          >
                            <Image className="w-3.5 h-3.5" />
                            Visualize
                          </button>
                        </SimpleTooltip>
                      </div>
                    )}
                    
                    {isGeneratingImage && (
                      <div className="col-span-1 sm:col-span-2 mt-2">
                        <div className="aspect-square sm:aspect-video w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/50 flex flex-col items-center justify-center p-6 text-center animate-pulse relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
                          <Loader2 className="w-6 h-6 text-indigo-500 animate-spin mb-3 relative z-10" />
                          <p className="text-xs font-mono tracking-wider text-zinc-500 dark:text-zinc-400 relative z-10">Crafting Concept Image...</p>
                        </div>
                      </div>
                    )}

                    {imageUrl && (
                      <div className="col-span-1 sm:col-span-2 mt-2 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 relative group cursor-pointer" onClick={(e) => { e.stopPropagation(); window.open(imageUrl, '_blank'); }}>
                        <img src={imageUrl} alt={project.title} className="w-full h-auto object-cover" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                           <span className="opacity-0 group-hover:opacity-100 bg-white/90 dark:bg-black/80 px-3 py-1.5 rounded-full text-[10px] font-mono tracking-widest text-zinc-900 dark:text-white transition-opacity border border-black/10 dark:border-white/10 shadow-sm backdrop-blur-sm">View Full Res</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-center pt-2 text-zinc-300 dark:text-zinc-700 hover:text-zinc-500 dark:hover:text-zinc-500 cursor-pointer transition-colors" onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }}>
                  <ChevronUp className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <Toast.Provider swipeDirection="right">
      <div className="min-h-screen bg-[#f5f5f4] dark:bg-[#050505] text-zinc-900 dark:text-zinc-50 transition-colors duration-300 selection:bg-indigo-500/30 font-sans">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b border-zinc-200/50 dark:border-zinc-800/50 bg-[#f5f5f4]/80 dark:bg-[#050505]/80 backdrop-blur-xl print:hidden">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <div 
              className="flex items-center gap-2.5 font-semibold text-sm tracking-tight cursor-pointer"
              onClick={() => setView('input')}
            >
              <div className="w-7 h-7 rounded-lg bg-zinc-900 dark:bg-white flex items-center justify-center text-white dark:text-zinc-900 shadow-sm">
                <Wrench className="w-3.5 h-3.5" />
              </div>
              <span className="font-mono uppercase tracking-widest text-xs">MakeIt<span className="text-zinc-500">.ai</span></span>
            </div>
            <div className="flex items-center gap-1">
              {view === 'results' && (
                <SimpleTooltip content="Print current projects">
                  <button 
                    onClick={handlePrint}
                    className="p-2 rounded-md hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 transition-colors text-zinc-500 dark:text-zinc-400"
                    title="Print Projects"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </SimpleTooltip>
              )}
              <SimpleTooltip content="Toggle theme mode">
                <button 
                  onClick={toggleTheme}
                  className="p-2 rounded-md hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 transition-colors text-zinc-500 dark:text-zinc-400"
                  aria-label="Toggle theme"
                >
                  {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </button>
              </SimpleTooltip>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-20 overflow-hidden">
          <AnimatePresence mode="wait">
            {view === 'input' ? (
              <motion.div 
                key="input-view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="max-w-2xl mx-auto space-y-16"
              >
                <div className="text-center space-y-6">
                  <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight text-zinc-900 dark:text-white leading-[1.1]">
                    What do you have <br className="hidden sm:block" />
                    <span className="text-zinc-400 dark:text-zinc-500">lying around?</span>
                  </h1>
                  <p className="text-base text-zinc-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
                    Enter your available materials, select a category, and let AI engineer your next weekend project.
                  </p>
                </div>

                <Tabs.Root defaultValue="generate" className="w-full">
                  <Tabs.List className="flex w-full border-b border-zinc-200 dark:border-zinc-800 mb-8">
                    <SimpleTooltip content="Generate new DIY projects">
                      <Tabs.Trigger 
                        value="generate" 
                        className="flex-1 pb-3 text-[13px] font-mono uppercase tracking-wider text-zinc-400 hover:text-zinc-900 dark:hover:text-white data-[state=active]:text-zinc-900 dark:data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-zinc-900 dark:data-[state=active]:border-white transition-all"
                      >
                        Generate
                      </Tabs.Trigger>
                    </SimpleTooltip>
                    <SimpleTooltip content="View your saved projects">
                      <Tabs.Trigger 
                        value="saved" 
                        className="flex-1 pb-3 text-[13px] font-mono uppercase tracking-wider text-zinc-400 hover:text-zinc-900 dark:hover:text-white data-[state=active]:text-zinc-900 dark:data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-zinc-900 dark:data-[state=active]:border-white transition-all flex items-center justify-center gap-2"
                      >
                        Saved
                        {savedProjects.length > 0 && (
                          <span className="bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 py-0.5 px-1.5 rounded text-[10px]">
                            {savedProjects.length}
                          </span>
                        )}
                      </Tabs.Trigger>
                    </SimpleTooltip>
                    <SimpleTooltip content="Extract steps and materials from a video">
                      <Tabs.Trigger 
                        value="video" 
                        className="flex-1 pb-3 text-[13px] font-mono uppercase tracking-wider text-zinc-400 hover:text-zinc-900 dark:hover:text-white data-[state=active]:text-zinc-900 dark:data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-zinc-900 dark:data-[state=active]:border-white transition-all flex items-center justify-center gap-2"
                      >
                        <Video className="w-3.5 h-3.5" />
                        Analyze
                      </Tabs.Trigger>
                    </SimpleTooltip>
                  </Tabs.List>

                  <Tabs.Content value="generate" className="outline-none">
                    <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-zinc-200 dark:border-zinc-800/80 p-6 sm:p-8 space-y-8 shadow-sm">
                      {/* Materials Input */}
                      <div className="space-y-3">
                        <label className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
                          <span>01. Materials</span>
                          <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">Press Enter</span>
                        </label>
                        
                        <div className="min-h-[120px] p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-[#0f0f0f] focus-within:border-zinc-400 dark:focus-within:border-zinc-600 transition-colors flex flex-wrap gap-2 items-start content-start">
                          <AnimatePresence>
                            {materials.map((mat) => (
                              <motion.span
                                key={mat}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white dark:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 shadow-sm"
                              >
                                {mat}
                                <SimpleTooltip content="Remove material">
                                  <button 
                                    onClick={() => removeMaterial(mat)}
                                    className="text-zinc-400 hover:text-rose-500 transition-colors focus:outline-none"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </SimpleTooltip>
                              </motion.span>
                            ))}
                          </AnimatePresence>
                          
                          <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleAddMaterial}
                            placeholder={materials.length === 0 ? "e.g., Pallets, Mason Jars..." : "Add another..."}
                            className="flex-1 min-w-[140px] bg-transparent border-none outline-none py-1 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 font-mono"
                          />
                        </div>
                      </div>

                      {/* Category Selection */}
                      <div className="space-y-3">
                        <label className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                          02. Category
                        </label>
                        <div className="flex flex-wrap gap-3">
                          {categories.map((cat) => (
                            <button
                              key={cat.id}
                              onClick={() => setCategory(cat.id)}
                              className={`
                                flex-1 min-w-[110px] flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all duration-200
                                ${category === cat.id 
                                  ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 shadow-md' 
                                  : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0f0f0f] text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'}
                              `}
                            >
                              {cat.icon}
                              <span className="text-[11px] font-mono uppercase tracking-wider">{cat.label}</span>
                            </button>
                          ))}
                          
                          {/* AI Suggestion Button */}
                          {(suggestedCategory || isSuggestingCategory) && (
                            <button
                              onClick={() => suggestedCategory && setCategory(suggestedCategory as Category)}
                              disabled={isSuggestingCategory}
                              className={`
                                flex-1 min-w-[140px] flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200
                                ${category === suggestedCategory 
                                  ? 'border-indigo-600 bg-indigo-600 text-white shadow-md' 
                                  : 'border-indigo-200 dark:border-indigo-800/50 bg-indigo-50/50 dark:bg-indigo-900/10 text-indigo-600 dark:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-700/50'}
                              `}
                            >
                              {isSuggestingCategory ? (
                                <div className="flex flex-col items-center gap-2 animate-pulse w-full">
                                  <div className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin opacity-70" />
                                    <span className="text-[11px] font-mono uppercase tracking-wider text-center leading-tight">
                                      Thinking...
                                    </span>
                                  </div>
                                  <div className="h-1.5 w-16 bg-indigo-200 dark:bg-indigo-800/80 rounded-full mt-1"></div>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center justify-center gap-2">
                                  <Sparkles className="w-4 h-4" />
                                  <span className="text-[11px] font-mono uppercase tracking-wider text-center leading-tight">
                                    {suggestedCategory}
                                  </span>
                                </div>
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Error Message */}
                      <AnimatePresence>
                        {error && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 p-3 rounded-lg border border-rose-200 dark:border-rose-500/20 mt-4">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                              <p>{error}</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Generate Button */}
                      <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800/50">
                        <button
                          onClick={handleGenerate}
                          disabled={isGenerating || materials.length === 0}
                          className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium py-3.5 px-6 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-800 dark:hover:bg-white active:scale-[0.98]"
                        >
                          {isGenerating ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span className="text-sm">Processing...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4" />
                              <span className="text-sm">Generate Projects</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </Tabs.Content>

                  <Tabs.Content value="saved" className="outline-none">
                    {savedProjects.length === 0 ? (
                      <div className="text-center py-20 bg-white dark:bg-[#0a0a0a] rounded-2xl border border-zinc-200 dark:border-zinc-800/80 border-dashed">
                        <Bookmark className="w-8 h-8 mx-auto text-zinc-300 dark:text-zinc-700 mb-4" />
                        <h3 className="text-sm font-medium text-zinc-900 dark:text-white mb-1">No saved projects</h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">Your favorites will appear here.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-6">
                        <AnimatePresence>
                          {savedProjects.map(project => (
                            <ProjectCard key={project.id} project={project} isSavedView={true} />
                          ))}
                        </AnimatePresence>
                      </div>
                    )}
                  </Tabs.Content>
                  <Tabs.Content value="video" className="outline-none">
                    <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-zinc-200 dark:border-zinc-800/80 p-6 sm:p-8 space-y-8 shadow-sm">
                      <div className="text-center space-y-4">
                        <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                          <Video className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-semibold text-zinc-900 dark:text-white tracking-tight">Analyze Video</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                          Upload a DIY video. Gemini will extract materials, steps, and create a structured guide.
                        </p>
                      </div>

                      <div className="border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-8 text-center hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors cursor-pointer bg-zinc-50/50 dark:bg-[#0f0f0f]">
                        <input 
                          type="file" 
                          accept="video/*" 
                          className="hidden" 
                          id="video-upload"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            
                            setIsGenerating(true);
                            setError(null);
                            setView('results'); // Switch to results view early to show loading state
                            
                            try {
                              const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
                              if (!apiKey) throw new Error("Gemini API Key is missing.");
                              
                              const ai = new GoogleGenAI({ apiKey });
                              
                              // Convert file to base64
                              const reader = new FileReader();
                              reader.readAsDataURL(file);
                              reader.onload = async () => {
                                const base64Data = (reader.result as string).split(',')[1];
                                
                                try {
                                  const response = await ai.models.generateContent({
                                    model: 'gemini-3.1-pro-preview',
                                    contents: [
                                      {
                                        inlineData: {
                                          data: base64Data,
                                          mimeType: file.type
                                        }
                                      },
                                      "Analyze this DIY video. Extract the project title, a short description, estimated difficulty (Easy, Medium, Hard), estimated time, a list of materials needed, step-by-step instructions, and assign a category (Home Improvement, Crafts, Gardening, Electronics, Upcycling, or other). Format the output as a JSON array containing a single object with these exact keys: title, description, difficulty, estimatedTime, materialsNeeded (array of strings), instructions (array of strings), category."
                                    ],
                                    config: {
                                      responseMimeType: 'application/json',
                                      responseSchema: {
                                        type: Type.ARRAY,
                                        items: {
                                          type: Type.OBJECT,
                                          properties: {
                                            title: { type: Type.STRING },
                                            description: { type: Type.STRING },
                                            difficulty: { type: Type.STRING },
                                            estimatedTime: { type: Type.STRING },
                                            materialsNeeded: { type: Type.ARRAY, items: { type: Type.STRING } },
                                            instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
                                            category: { type: Type.STRING }
                                          },
                                          required: ["title", "description", "difficulty", "estimatedTime", "materialsNeeded", "instructions", "category"]
                                        }
                                      }
                                    }
                                  });

                                  const data = JSON.parse(response.text || '[]');
                                  const projectsWithIds = data.map((p: any) => ({ ...p, id: crypto.randomUUID() }));
                                  setProjects(projectsWithIds);
                                } catch (err: any) {
                                  console.error(err);
                                  setError(err.message || "Failed to analyze video.");
                                  setView('input'); // Go back on error
                                } finally {
                                  setIsGenerating(false);
                                }
                              };
                              reader.onerror = () => {
                                setError("Failed to read video file.");
                                setIsGenerating(false);
                                setView('input');
                              };
                            } catch (err: any) {
                              console.error(err);
                              setError(err.message || "Failed to initialize video analysis.");
                              setIsGenerating(false);
                              setView('input');
                            }
                          }}
                        />
                        <label htmlFor="video-upload" className="cursor-pointer flex flex-col items-center gap-3">
                          <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-zinc-500 dark:text-zinc-400">
                            <Plus className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-zinc-900 dark:text-white font-medium hover:underline">Click to upload</span>
                            <span className="text-zinc-500 dark:text-zinc-400"> or drag and drop</span>
                          </div>
                          <p className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500">MP4, WebM, or MOV up to 50MB</p>
                        </label>
                      </div>
                    </div>
                  </Tabs.Content>
                </Tabs.Root>
              </motion.div>
            ) : (
              <motion.div 
                key="results-view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-8 max-w-3xl mx-auto"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
                  <div>
                    <button 
                      onClick={() => setView('input')}
                      className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors mb-4"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Back to materials
                    </button>
                    <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">
                      Your Projects
                    </h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                      Based on your {materials.length} materials in the {category} category.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {isGenerating ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0f0f0f] overflow-hidden shadow-sm animate-pulse">
                        <div className="p-6">
                          <div className="flex justify-between items-start gap-4 mb-6">
                            <div className="space-y-3 flex-1">
                              <div className="flex items-center gap-2">
                                <div className="h-5 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-md"></div>
                                <div className="h-5 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-md"></div>
                              </div>
                              <div className="h-6 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded-md"></div>
                              <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded-md"></div>
                              <div className="h-4 w-5/6 bg-zinc-200 dark:bg-zinc-800 rounded-md"></div>
                            </div>
                            <div className="w-10 h-10 bg-zinc-200 dark:bg-zinc-800 rounded-full shrink-0"></div>
                          </div>
                          
                          <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-xl p-4 mb-4 space-y-3 border border-zinc-100 dark:border-zinc-800/80">
                            <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-md"></div>
                            <div className="flex flex-wrap gap-2">
                               <div className="h-7 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-md"></div>
                               <div className="h-7 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-md"></div>
                               <div className="h-7 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-md"></div>
                            </div>
                          </div>
                          
                          <div className="flex justify-center mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
                            <div className="h-4 w-28 bg-zinc-200 dark:bg-zinc-800 rounded-md"></div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    projects.map((project, idx) => (
                      <ProjectCard key={project.id} project={project} />
                    ))
                  )}
                  
                  {!isGenerating && projects.length === 0 && (
                     <div className="text-center py-12 text-zinc-500 dark:text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                       No projects found.
                     </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Toast Notification */}
        <Toast.Root 
          open={toastOpen} 
          onOpenChange={setToastOpen}
          className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-lg rounded-lg p-3 flex items-center gap-3 data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full"
        >
          <div className="w-6 h-6 rounded-full bg-zinc-800 dark:bg-zinc-100 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <Toast.Title className="text-xs font-medium">
            {toastMessage}
          </Toast.Title>
        </Toast.Root>
        <Toast.Viewport className="fixed bottom-0 right-0 p-6 w-full sm:w-auto max-w-sm z-[100] flex flex-col gap-2 outline-none" />
      </div>
    </Toast.Provider>
  );
}
