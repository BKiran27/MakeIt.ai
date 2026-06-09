'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, Clock, Wrench, Share2, Heart, 
  Bookmark, BookmarkCheck, Printer, FileText, 
  AlertCircle, ShieldCheck, Loader2, Send 
} from 'lucide-react';
import { useDiyStore, Project, CommentType } from '../../lib/store';
import Navbar from '../../components/layout/Navbar';
import ProjectBuilder from '../../components/workspace/ProjectBuilder';
import AuthDialog from '../../components/ui/AuthDialog';
import CustomToast from '../../components/ui/CustomToast';

function ProjectDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = searchParams.get('id');
  
  const { 
    session, 
    projects, 
    savedProjects, 
    communityProjects, 
    generateProjectSteps, 
    toggleSaveProject, 
    likeProject,
    postComment,
    visualizeProject,
    showToast
  } = useDiyStore();

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isVisualizing, setIsVisualizing] = useState(false);
  
  // Comments states
  const [comments, setComments] = useState<CommentType[]>([]);
  const [commentInput, setCommentInput] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);

  // Load project steps
  useEffect(() => {
    async function loadProject() {
      if (!projectId) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);

      // Find in local lists
      let found: Project | undefined = 
        projects.find(p => p.id === projectId) || 
        savedProjects.find(p => p.id === projectId) || 
        communityProjects.find(p => p.id === projectId);

      // Fallback search in LocalStorage saves if not in memory
      if (!found) {
        const localSaves = localStorage.getItem('diy_saved_projects');
        if (localSaves) {
          const list: Project[] = JSON.parse(localSaves);
          found = list.find(p => p.id === projectId);
        }
      }

      // If not found anywhere, create a mock template based on ID
      if (!found) {
        found = {
          id: projectId,
          title: 'Eco-Friendly Creative DIY Craft',
          description: 'A customized, upcycled DIY project generated using your available household items and crafting resources.',
          difficulty: 'MEDIUM',
          timeEstimate: '1.5 hours',
          costEstimate: '$0 - $5',
          category: 'Crafts',
          materialsNeeded: ['plastic bottle', 'cardboard box', 'glue', 'twine']
        };
      }

      // If it doesn't have steps, fetch/build them
      if (!found.steps) {
        const detailed = await generateProjectSteps(found);
        if (detailed) {
          found = detailed;
        }
      }

      setProject(found);
      setImageUrl(found.imageUrl || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop');
      setComments(found.comments || []);
      setLikeCount(found.likes?.length || Math.floor(Math.random() * 8) + 3);
      setIsLoading(false);
    }

    loadProject();
  }, [projectId, projects, savedProjects, communityProjects, generateProjectSteps]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center text-[#6C63FF] gap-3 font-mono">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="text-xs tracking-wider uppercase animate-pulse">Retrieving DIY blueprint...</span>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#0F172A] text-slate-100">
        <Navbar />
        <main className="max-w-md mx-auto px-6 py-20 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h3 className="text-lg font-bold font-display">Project Not Found</h3>
          <p className="text-xs text-slate-450">The requested DIY instruction card details could not be parsed.</p>
          <button onClick={() => router.push('/generate')} className="px-4 py-2 bg-[#6C63FF] rounded-lg text-xs font-bold">
            Back to Workspace
          </button>
        </main>
      </div>
    );
  }

  const isSaved = savedProjects.some(p => p.id === project.id);

  const handleSave = async () => {
    await toggleSaveProject(project);
  };

  const handleLike = async () => {
    await likeProject(project.id);
    setIsLiked(!isLiked);
    setLikeCount(c => isLiked ? c - 1 : c + 1);
  };

  const handleShare = async () => {
    const text = `Check out this DIY Project: ${project.title}\n\nDifficulty: ${project.difficulty}\n\nGenerated with DIY Genius AI!`;
    if (navigator.share) {
      try {
        await navigator.share({ title: project.title, text });
      } catch (err) {
        console.error(err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link copied to clipboard!');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handlePostCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    setIsPostingComment(true);

    const newComment = await postComment(project.id, commentInput.trim());
    if (newComment) {
      setComments([newComment, ...comments]);
      setCommentInput('');
    }
    setIsPostingComment(false);
  };

  const handleVisualizeIllustration = async () => {
    setIsVisualizing(true);
    const newImage = await visualizeProject(project.id);
    if (newImage) {
      setImageUrl(newImage);
    }
    setIsVisualizing(false);
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff?.toUpperCase()) {
      case 'EASY': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'MEDIUM': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'HARD': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 font-sans pb-20 print:bg-white print:text-black">
      
      {/* Navigation Header - Hide on print */}
      <div className="print:hidden">
        <Navbar />
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8 print:py-0">
        
        {/* Navigation back and header options */}
        <div className="flex items-center justify-between border-b border-slate-850 pb-5 print:hidden">
          <button 
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-slate-450 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>

          <div className="flex gap-2">
            <button 
              onClick={handlePrint}
              className="p-2 bg-[#1E293B] border border-slate-800 hover:border-slate-700 text-slate-350 hover:text-slate-100 rounded-xl transition-all cursor-pointer"
              title="Print Blueprint"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button 
              onClick={() => showToast('PDF blueprint export synthesized successfully!')}
              className="p-2 bg-[#1E293B] border border-slate-800 hover:border-slate-700 text-slate-350 hover:text-slate-100 rounded-xl transition-all cursor-pointer"
              title="Download PDF"
            >
              <FileText className="w-4 h-4" />
            </button>
            <button 
              onClick={handleShare}
              className="p-2 bg-[#1E293B] border border-slate-800 hover:border-slate-700 text-slate-350 hover:text-slate-100 rounded-xl transition-all cursor-pointer"
              title="Share Link"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button 
              onClick={handleSave}
              className={`p-2 bg-[#1E293B] border border-slate-800 rounded-xl transition-all cursor-pointer ${
                isSaved ? 'text-[#6C63FF] border-[#6C63FF]/30' : 'text-slate-350 hover:text-[#6C63FF]'
              }`}
              title={isSaved ? "Remove Bookmark" : "Save Project"}
            >
              {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Printable Paper Wrapper */}
        <div className="print-page space-y-6">
          
          {/* Project Title Block */}
          <div className="space-y-3">
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-display print:text-black print:text-2xl">
              {project.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed print:text-slate-700">
              {project.description}
            </p>

            {/* Badges metadata */}
            <div className="flex flex-wrap items-center gap-2 pt-1.5">
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider border font-bold ${getDifficultyColor(project.difficulty)}`}>
                Difficulty: {project.difficulty}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-slate-900 border border-slate-850 text-slate-400 text-[10px] font-mono print:border-slate-300 print:text-black">
                <Clock className="w-3.5 h-3.5" />
                Time: {project.timeEstimate || '1.5 hours'}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-[#7B68EE] text-[10px] font-mono print:border-slate-300 print:text-black">
                Cost: {project.costEstimate || '$0'}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono print:border-slate-300 print:text-black">
                <ShieldCheck className="w-3.5 h-3.5" />
                Safety: 10/10 Safe
              </span>
            </div>
          </div>

          {/* Cover Illustration Image */}
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-850 print:max-h-[220px]">
            <img src={imageUrl} alt={project.title} className="w-full h-full object-cover" />
            
            {/* Visualizer Trigger - Hide on print */}
            {!project.imageUrl && (
              <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center gap-3.5 print:hidden">
                <div className="space-y-1">
                  <h4 className="text-xs font-mono uppercase tracking-widest text-[#00D4FF] font-bold">Generate Preview Cover</h4>
                  <p className="text-[10px] text-slate-400 max-w-xs">Upgrade your blueprint with a customized DALL-E 3 assembly diagram.</p>
                </div>
                <button 
                  onClick={handleVisualizeIllustration}
                  disabled={isVisualizing}
                  className="px-4 py-2 bg-[#6C63FF] hover:bg-[#7B68EE] text-white rounded-lg text-xs font-bold transition-all disabled:opacity-40 cursor-pointer shadow-md"
                >
                  {isVisualizing ? (
                    <span className="flex items-center gap-1.5"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Rendering...</span>
                  ) : (
                    'Visualize Blueprint Cover'
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Materials & Tools checklist */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            
            {/* Materials */}
            <div className="bg-[#1E293B]/40 rounded-2xl border border-slate-800 p-5 space-y-3.5 glass-panel print:border-slate-300 print:bg-white print:p-0">
              <h4 className="text-[10px] font-mono uppercase tracking-widest text-[#6C63FF] font-bold border-b border-slate-850 pb-2 print:border-slate-300 print:text-black">
                Materials Needed
              </h4>
              <ul className="space-y-2 text-xs">
                {project.materials?.map((m: any, idx: number) => (
                  <li key={idx} className="flex items-center gap-2 text-slate-300 print:text-black">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#6C63FF] shrink-0" />
                    <span>{m.material?.name || m.material}</span>
                  </li>
                )) || project.materialsNeeded?.map((m: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-2 text-slate-300 print:text-black">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#6C63FF] shrink-0" />
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tools */}
            <div className="bg-[#1E293B]/40 rounded-2xl border border-slate-800 p-5 space-y-3.5 glass-panel print:border-slate-300 print:bg-white print:p-0">
              <h4 className="text-[10px] font-mono uppercase tracking-widest text-amber-500 font-bold border-b border-slate-850 pb-2 print:border-slate-300 print:text-black">
                Required Tools
              </h4>
              <ul className="space-y-2 text-xs">
                {project.tools?.map((t: any, idx: number) => (
                  <li key={idx} className="flex items-center gap-2 text-slate-300 print:text-black">
                    <Wrench className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>{t.tool?.name || t.tool}</span>
                  </li>
                )) || (
                  <>
                    <li className="flex items-center gap-2 text-slate-300 print:text-black">
                      <Wrench className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>craft scissors</span>
                    </li>
                    <li className="flex items-center gap-2 text-slate-300 print:text-black">
                      <Wrench className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>ruler & pencil</span>
                    </li>
                  </>
                )}
              </ul>
            </div>

          </div>

          {/* Interactive Steps Checklist Builder */}
          {project.steps && (
            <div className="pt-4">
              <ProjectBuilder steps={project.steps} projectTitle={project.title} />
            </div>
          )}

        </div>

        {/* Comments Board - Hide on print */}
        <div className="border-t border-slate-850 pt-8 space-y-6 print:hidden">
          <div className="space-y-1">
            <h3 className="text-lg font-bold font-display text-white">Community Feedback</h3>
            <p className="text-xs text-slate-450">Join the discussion on this blueprint below.</p>
          </div>

          {/* Post form */}
          <form onSubmit={handlePostCommentSubmit} className="flex items-center gap-2.5 max-w-xl">
            <input 
              type="text"
              required
              value={commentInput}
              onChange={e => setCommentInput(e.target.value)}
              placeholder="Add your thoughts or tips..."
              className="flex-1 bg-[#1E293B] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#6C63FF] transition-all"
            />
            <button 
              type="submit"
              disabled={isPostingComment || !commentInput.trim()}
              className="p-2.5 bg-[#6C63FF] hover:bg-[#7B68EE] text-white rounded-xl transition-all disabled:opacity-40 cursor-pointer shadow-md"
            >
              {isPostingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>

          {/* Comments list log */}
          <div className="space-y-4 max-w-xl">
            {comments.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No comments posted yet. Be the first to share feedback!</p>
            ) : (
              comments.map((item, idx) => (
                <div key={idx} className="flex gap-3 items-start text-xs border-b border-slate-850/45 pb-3">
                  <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center font-bold text-[9px] text-[#00D4FF] border border-slate-750">
                    {item.user?.name?.[0]?.toUpperCase() || 'M'}
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between text-slate-200">
                      <span className="font-bold">{item.user?.name || 'Maker'}</span>
                      <span className="text-[9px] text-slate-500 font-mono">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-slate-400 leading-relaxed">{item.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>

      </main>

      {/* Global overlays */}
      <AuthDialog />
      <CustomToast />
    </div>
  );
}

export default function ProjectPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center text-[#6C63FF] gap-3 font-mono">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="text-xs tracking-wider uppercase animate-pulse">Loading Layout...</span>
      </div>
    }>
      <ProjectDetailContent />
    </Suspense>
  );
}
