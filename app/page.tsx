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

type Category = 'Home Improvement' | 'Crafts' | 'Gardening' | 'Surprise Me';

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
      setView('results');
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
              <button 
                onClick={() => handleShare(project)}
                className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-md transition-colors"
                title="Share"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => toggleSaveProject(project)}
                className={`p-1.5 rounded-md transition-colors ${isSaved ? 'text-indigo-500' : 'text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'}`}
                title={isSaved ? "Remove from saved" : "Save project"}
              >
                {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
              </button>
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
                  <ul className="flex flex-wrap gap-1.5">
                    {project.materialsNeeded.map((mat, i) => {
                      const isAvailable = !isSavedView && materials.some(m => mat.toLowerCase().includes(m));
                      return (
                        <li 
                          key={i} 
                          className={`text-xs px-2.5 py-1 rounded-md border ${
                            isAvailable 
                              ? 'bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100' 
                              : 'bg-zinc-50 dark:bg-zinc-900/50 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800'
                          }`}
                        >
                          {mat}
                        </li>
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
                      <button
                        onClick={handleDeepDive}
                        disabled={isDeepDiving}
                        className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-zinc-100 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 font-medium text-xs hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50 border border-zinc-200 dark:border-zinc-700/50"
                      >
                        {isDeepDiving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                        {isDeepDiving ? 'Analyzing...' : 'Deep Dive Analysis'}
                      </button>
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
                      <button
                        onClick={handleSearch}
                        disabled={isSearching}
                        className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-zinc-100 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 font-medium text-xs hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50 border border-zinc-200 dark:border-zinc-700/50"
                      >
                        {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5" />}
                        {isSearching ? 'Searching...' : 'Search Tips & Sourcing'}
                      </button>
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
                      <button
                        onClick={handleFindVideos}
                        disabled={isFindingVideos}
                        className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-zinc-100 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 font-medium text-xs hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50 border border-zinc-200 dark:border-zinc-700/50"
                      >
                        {isFindingVideos ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Youtube className="w-3.5 h-3.5" />}
                        {isFindingVideos ? 'Finding...' : 'Watch Tutorials'}
                      </button>
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
                              return embedUrl ? (
                                <div key={idx} className="space-y-2">
                                  <div className="aspect-video rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900">
                                    <iframe 
                                      src={embedUrl} 
                                      title={video.title}
                                      className="w-full h-full"
                                      allowFullScreen
                                    />
                                  </div>
                                  <a href={video.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 line-clamp-2">
                                    {video.title}
                                  </a>
                                </div>
                              ) : null;
                            })}
                          </div>
                        ) : (
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">No videos found for this project.</p>
                        )}
                      </div>
                    )}

                    {/* Image Generation */}
                    {!imageUrl ? (
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
                        <button
                          onClick={handleGenerateImage}
                          disabled={isGeneratingImage}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-zinc-100 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 font-medium text-xs hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50 border border-zinc-200 dark:border-zinc-700/50"
                        >
                          {isGeneratingImage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Image className="w-3.5 h-3.5" />}
                          {isGeneratingImage ? 'Generating...' : 'Visualize'}
                        </button>
                      </div>
                    ) : (
                      <div className="col-span-1 sm:col-span-2 mt-2 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900">
                        <img src={imageUrl} alt={project.title} className="w-full h-auto object-cover" />
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
                <button 
                  onClick={handlePrint}
                  className="p-2 rounded-md hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 transition-colors text-zinc-500 dark:text-zinc-400"
                  title="Print Projects"
                >
                  <Printer className="w-4 h-4" />
                </button>
              )}
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-md hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 transition-colors text-zinc-500 dark:text-zinc-400"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>
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
                    <Tabs.Trigger 
                      value="generate" 
                      className="flex-1 pb-3 text-[13px] font-mono uppercase tracking-wider text-zinc-400 hover:text-zinc-900 dark:hover:text-white data-[state=active]:text-zinc-900 dark:data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-zinc-900 dark:data-[state=active]:border-white transition-all"
                    >
                      Generate
                    </Tabs.Trigger>
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
                    <Tabs.Trigger 
                      value="video" 
                      className="flex-1 pb-3 text-[13px] font-mono uppercase tracking-wider text-zinc-400 hover:text-zinc-900 dark:hover:text-white data-[state=active]:text-zinc-900 dark:data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-zinc-900 dark:data-[state=active]:border-white transition-all flex items-center justify-center gap-2"
                    >
                      <Video className="w-3.5 h-3.5" />
                      Analyze
                    </Tabs.Trigger>
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
                                <button 
                                  onClick={() => removeMaterial(mat)}
                                  className="text-zinc-400 hover:text-rose-500 transition-colors focus:outline-none"
                                >
                                  <X className="w-3 h-3" />
                                </button>
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
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {categories.map((cat) => (
                            <button
                              key={cat.id}
                              onClick={() => setCategory(cat.id)}
                              className={`
                                flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all duration-200
                                ${category === cat.id 
                                  ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 shadow-md' 
                                  : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0f0f0f] text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'}
                              `}
                            >
                              {cat.icon}
                              <span className="text-[11px] font-mono uppercase tracking-wider">{cat.label}</span>
                            </button>
                          ))}
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
                  {projects.map((project, idx) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
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
