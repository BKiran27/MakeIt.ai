import { create } from 'zustand';
import { supabase } from './supabase';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export interface Step {
  stepNumber: number;
  instruction: string;
  safetyWarning?: string;
}

export interface CommentType {
  id: string;
  content: string;
  createdAt: string;
  user: { name: string; avatarUrl?: string };
}

export interface Project {
  id: string;
  title: string;
  description: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  timeEstimate: string;
  costEstimate: string;
  imageUrl?: string;
  category?: string;
  authorId?: string;
  materialsNeeded?: string[];
  materials?: { material: { name: string } }[];
  tools?: { tool: { name: string } }[];
  steps?: Step[];
  likes?: { userId: string }[];
  comments?: CommentType[];
  author?: { name: string; avatarUrl?: string };
}

export interface ChatMessage {
  sender: 'ai' | 'user';
  text: string;
}

interface DiyState {
  // Auth state
  session: any | null;
  dbUser: any | null;
  authOpen: boolean;
  authLoading: boolean;
  
  // Workspace inputs
  materials: string[];
  inputValue: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  category: string;
  customPrompt: string;

  // Global operations
  isGenerating: boolean;
  isScanning: boolean;
  projects: Project[];
  savedProjects: Project[];
  communityProjects: Project[];
  chatMessages: ChatMessage[];
  toastOpen: boolean;
  toastMessage: string;

  // Actions
  setSession: (session: any) => void;
  setDbUser: (user: any) => void;
  setAuthOpen: (open: boolean) => void;
  setInputValue: (val: string) => void;
  setDifficulty: (diff: 'EASY' | 'MEDIUM' | 'HARD') => void;
  setCategory: (cat: string) => void;
  setCustomPrompt: (prompt: string) => void;
  addMaterial: (mat: string) => void;
  removeMaterial: (mat: string) => void;
  clearMaterials: () => void;
  showToast: (msg: string) => void;
  setToastOpen: (open: boolean) => void;
  addChatMessage: (msg: ChatMessage) => void;

  // Backend Async Actions
  syncUser: (currentSession: any) => Promise<void>;
  fetchSavedProjects: () => Promise<void>;
  fetchCommunityProjects: (searchQuery?: string) => Promise<void>;
  generateProjects: () => Promise<void>;
  generateProjectSteps: (project: Project) => Promise<Project | null>;
  toggleSaveProject: (project: Project) => Promise<void>;
  likeProject: (projectId: string) => Promise<void>;
  visualizeProject: (projectId: string) => Promise<string | null>;
  postComment: (projectId: string, content: string) => Promise<CommentType | null>;
  scanMaterials: (file: File) => Promise<void>;
}

export const useDiyStore = create<DiyState>((set, get) => ({
  session: null,
  dbUser: null,
  authOpen: false,
  authLoading: false,
  
  materials: ['plastic bottle', 'cardboard box'],
  inputValue: '',
  difficulty: 'EASY',
  category: 'Surprise Me',
  customPrompt: '',

  isGenerating: false,
  isScanning: false,
  projects: [],
  savedProjects: [],
  communityProjects: [],
  chatMessages: [
    { sender: 'ai', text: 'Hey Maker! 👋 Type the materials you have, or drop an image. I can suggest how to cut wood planks, recycle boxes, or build customized crafts!' }
  ],
  toastOpen: false,
  toastMessage: '',

  setSession: (session) => set({ session }),
  setDbUser: (dbUser) => set({ dbUser }),
  setAuthOpen: (authOpen) => set({ authOpen }),
  setInputValue: (inputValue) => set({ inputValue }),
  setDifficulty: (difficulty) => set({ difficulty }),
  setCategory: (category) => set({ category }),
  setCustomPrompt: (customPrompt) => set({ customPrompt }),
  
  addMaterial: (mat) => {
    const cleaned = mat.trim().toLowerCase();
    if (cleaned && !get().materials.includes(cleaned)) {
      set({ materials: [...get().materials, cleaned] });
    }
  },
  removeMaterial: (mat) => set({ materials: get().materials.filter(m => m !== mat) }),
  clearMaterials: () => set({ materials: [] }),
  showToast: (msg) => set({ toastMessage: msg, toastOpen: true }),
  setToastOpen: (toastOpen) => set({ toastOpen }),
  addChatMessage: (msg) => set({ chatMessages: [...get().chatMessages, msg] }),

  // Sync user details with NestJS backend
  syncUser: async (currentSession) => {
    if (!currentSession) return;
    const nameFromMeta = currentSession.user?.user_metadata?.name || '';
    try {
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
        set({ dbUser: data });
      } else {
        throw new Error();
      }
    } catch (err) {
      console.warn('Backend user sync failed, applying demo guest profile:', err);
      set({
        dbUser: {
          id: currentSession.user?.id || 'mock-user-id',
          email: currentSession.user?.email || 'maker@diygenius.ai',
          name: nameFromMeta || currentSession.user?.email?.split('@')[0] || 'DIY Master',
          isPremium: true
        }
      });
    }
  },

  // Fetch saved bookmarked projects
  fetchSavedProjects: async () => {
    const { session } = get();
    if (!session) return;
    try {
      const response = await fetch(`${API_URL}/projects/saved`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      if (response.ok) {
        const data = await response.json();
        set({ savedProjects: data.projects || [] });
      } else {
        throw new Error();
      }
    } catch (e) {
      console.warn('Failed to fetch saved projects, falling back to LocalStorage:', e);
      const localSaves = localStorage.getItem('diy_saved_projects');
      set({ savedProjects: localSaves ? JSON.parse(localSaves) : [] });
    }
  },

  // Fetch community projects
  fetchCommunityProjects: async (searchQuery = '') => {
    try {
      const url = searchQuery 
        ? `${API_URL}/projects?query=${encodeURIComponent(searchQuery)}` 
        : `${API_URL}/projects`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        set({ communityProjects: data.projects || [] });
      } else {
        throw new Error();
      }
    } catch (e) {
      console.warn('Failed to fetch community projects, loading offline mock library:', e);
      const mockCommunity: Project[] = [
        {
          id: 'mock-proj-1',
          title: 'Eco-Friendly Self-Watering Planter',
          description: 'A brilliant self-watering planter made by upcycling plastic bottles. Perfect for small indoor herbs and flowers.',
          difficulty: 'EASY',
          timeEstimate: '30 mins',
          costEstimate: '$0',
          category: 'Garden',
          imageUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=800&auto=format&fit=crop',
          author: { name: 'EcoGardener', avatarUrl: '' },
          materialsNeeded: ['plastic bottle', 'cotton rope', 'soil', 'water'],
          tools: [{ tool: { name: 'scissors' } }, { tool: { name: 'utility knife' } }],
          steps: [
            { stepNumber: 1, instruction: 'Cut the plastic bottle in half horizontally.' },
            { stepNumber: 2, instruction: 'Poke a small hole in the bottle cap.' },
            { stepNumber: 3, instruction: 'Thread a cotton rope (wick) through the hole.' },
            { stepNumber: 4, instruction: 'Invert the top section into the base filled with water.' }
          ]
        },
        {
          id: 'mock-proj-2',
          title: 'Geometric Desktop Organizer',
          description: 'A stylish and modern desk organizer built entirely out of sturdy cardboard pieces. Perfect for storing pens, rulers, and craft tools.',
          difficulty: 'EASY',
          timeEstimate: '1.5 hours',
          costEstimate: '$0 - $5',
          category: 'Crafts',
          imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop',
          author: { name: 'CraftyMaker', avatarUrl: '' },
          materialsNeeded: ['cardboard box', 'glue', 'acrylic paint'],
          tools: [{ tool: { name: 'ruler' } }, { tool: { name: 'utility cutter' } }],
          steps: [
            { stepNumber: 1, instruction: 'Cut cardboard strips of different lengths.' },
            { stepNumber: 2, instruction: 'Glue them into geometric compartments.' },
            { stepNumber: 3, instruction: 'Paint with your favorite colors.' }
          ]
        },
        {
          id: 'mock-proj-3',
          title: 'Rustic String Wall Art',
          description: 'A beautiful string art piece using wooden boards, metal nails, and multi-colored threads or rope.',
          difficulty: 'MEDIUM',
          timeEstimate: '2.5 hours',
          costEstimate: '$5 - $10',
          category: 'Home Decor',
          imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop',
          author: { name: 'WoodworkStar', avatarUrl: '' },
          materialsNeeded: ['wood plank', 'nails', 'rope', 'string'],
          tools: [{ tool: { name: 'hammer' } }, { tool: { name: 'pencil' } }],
          steps: [
            { stepNumber: 1, instruction: 'Trace your pattern outline on the wood block.' },
            { stepNumber: 2, instruction: 'Hammer nails along the outline.' },
            { stepNumber: 3, instruction: 'Weave threads back and forth between the nails.' }
          ]
        }
      ];
      set({ communityProjects: mockCommunity });
    }
  },

  // Generate Projects based on input materials
  generateProjects: async () => {
    const { materials, difficulty, category, session } = get();
    if (materials.length === 0) {
      get().showToast("Please add at least one material.");
      return;
    }
    set({ isGenerating: true, projects: [] });
    try {
      const response = await fetch(`${API_URL}/projects/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`
        },
        body: JSON.stringify({ materials, difficulty, category })
      });
      if (response.ok) {
        const data = await response.json();
        set({ projects: data.projects || [] });
      } else {
        throw new Error();
      }
    } catch (err) {
      console.warn('Backend generate failed, returning simulated offline projects:', err);
      const mockProjects: Project[] = [
        {
          id: 'mock-proj-1',
          title: `Upcycled ${materials[0]} Self-Watering Planter`,
          description: `An eco-friendly watering system designed to reuse your available ${materials[0]}. High moisture retention.`,
          difficulty: difficulty,
          timeEstimate: '30 mins',
          costEstimate: '$0',
          category: category === 'Surprise Me' ? 'Garden' : category,
          materialsNeeded: materials.slice(0, 3)
        },
        {
          id: 'mock-proj-2',
          title: `Creative Desktop Organizer`,
          description: `Assemble card outlines or plastics into a modular storage system utilizing ${materials.join(', ')}.`,
          difficulty: difficulty,
          timeEstimate: '1.5 hours',
          costEstimate: '$0 - $5',
          category: category === 'Surprise Me' ? 'Crafts' : category,
          materialsNeeded: materials
        },
        {
          id: 'mock-proj-3',
          title: `Artistic Hanging Craft`,
          description: `A decorative craft assembly combining ${materials.join(' and ')} for wall hanger decorations.`,
          difficulty: difficulty === 'EASY' ? 'MEDIUM' : difficulty,
          timeEstimate: '2 hours',
          costEstimate: '$5 - $10',
          category: category === 'Surprise Me' ? 'Home Decor' : category,
          materialsNeeded: materials
        }
      ];
      set({ projects: mockProjects });
      get().showToast("Simulated project ideas generated.");
    } finally {
      set({ isGenerating: false });
    }
  },

  // Fetch detailed steps for a selected project blueprint
  generateProjectSteps: async (project) => {
    const { session, materials } = get();
    try {
      const response = await fetch(`${API_URL}/projects/generate/steps`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`
        },
        body: JSON.stringify({
          title: project.title,
          description: project.description,
          difficulty: project.difficulty,
          category: project.category || 'Surprise Me',
          materials: project.materialsNeeded || materials
        })
      });
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        throw new Error();
      }
    } catch (err) {
      console.warn('Backend project details fetch failed, building offline steps:', err);
      const mats = project.materialsNeeded || materials;
      const mockProjectDetails: Project = {
        ...project,
        materials: mats.map(m => ({ material: { name: m } })),
        tools: [{ tool: { name: 'scissors' } }, { tool: { name: 'hot glue gun' } }, { tool: { name: 'ruler' } }],
        steps: [
          {
            stepNumber: 1,
            instruction: `Gather and clean your materials: ${mats.join(', ')}. Set up a flat Workspace.`,
            safetyWarning: 'Ensure containers are completely clean and dry.'
          },
          {
            stepNumber: 2,
            instruction: 'Measure your dimensions and mark layout lines with a pencil. Use scissors or craft knife to slice shapes.',
            safetyWarning: 'Always cut away from your fingers.'
          },
          {
            stepNumber: 3,
            instruction: 'Glue the joints together or loop strings through. Apply uniform pressure for 20 seconds to dry.',
            safetyWarning: 'Be careful with hot glue tips.'
          },
          {
            stepNumber: 4,
            instruction: 'Add embellishments or paint surfaces if desired. Leave to dry for 30 minutes before load tests.'
          }
        ]
      };
      return mockProjectDetails;
    }
  },

  // Bookmark / Unbookmark a project
  toggleSaveProject: async (project) => {
    const { session, savedProjects } = get();
    if (!session) {
      set({ authOpen: true });
      return;
    }
    try {
      const response = await fetch(`${API_URL}/projects/${project.id}/save`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      if (response.ok) {
        const data = await response.json();
        get().showToast(data.saved ? "Project bookmarked!" : "Bookmark removed.");
        get().fetchSavedProjects();
      } else {
        throw new Error();
      }
    } catch (e) {
      console.warn('Backend save failed, using local storage toggler:', e);
      const exists = savedProjects.some(p => p.id === project.id);
      let updated;
      if (exists) {
        updated = savedProjects.filter(p => p.id !== project.id);
        get().showToast("Bookmark removed.");
      } else {
        updated = [...savedProjects, project];
        get().showToast("Project bookmarked!");
      }
      set({ savedProjects: updated });
      localStorage.setItem('diy_saved_projects', JSON.stringify(updated));
    }
  },

  // Toggle project like
  likeProject: async (projectId) => {
    const { session } = get();
    if (!session) {
      set({ authOpen: true });
      return;
    }
    try {
      const response = await fetch(`${API_URL}/projects/${projectId}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      if (response.ok) {
        const data = await response.json();
        get().showToast(data.liked ? "Liked project!" : "Like removed.");
      } else {
        throw new Error();
      }
    } catch (e) {
      console.warn('Backend like failed, toggling mock like:', e);
      get().showToast("Liked project!");
    }
  },

  // DALL-E image covers visualization
  visualizeProject: async (projectId) => {
    const { session } = get();
    if (!session) {
      set({ authOpen: true });
      return null;
    }
    try {
      const response = await fetch(`${API_URL}/projects/${projectId}/visualize`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      if (response.ok) {
        const data = await response.json();
        get().showToast("Cover generated!");
        return data.imageUrl;
      } else {
        throw new Error();
      }
    } catch (e) {
      console.warn('Backend cover generation failed, returning custom stock images:', e);
      get().showToast("Generated mock visual cover.");
      return 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop';
    }
  },

  // Post comments
  postComment: async (projectId, content) => {
    const { session } = get();
    if (!session) {
      set({ authOpen: true });
      return null;
    }
    try {
      const response = await fetch(`${API_URL}/projects/${projectId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ content })
      });
      if (response.ok) {
        const data = await response.json();
        get().showToast("Comment posted!");
        return data;
      } else {
        throw new Error();
      }
    } catch (e) {
      console.warn('Backend comment failed, adding local comment:', e);
      const mockComment: CommentType = {
        id: Math.random().toString(36).substring(7),
        content,
        createdAt: new Date().toISOString(),
        user: { name: get().dbUser?.name || 'DIY Master' }
      };
      get().showToast("Comment posted locally.");
      return mockComment;
    }
  },

  // Scan materials using Vision
  scanMaterials: async (file) => {
    const { session, materials } = get();
    set({ isScanning: true });
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_URL}/materials/detect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token || ''}`
        },
        body: formData
      });
      if (response.ok) {
        const data = await response.json();
        const newMaterials = data.materials || [];
        if (newMaterials.length > 0) {
          const combined = Array.from(new Set([...materials, ...newMaterials]));
          set({ materials: combined });
          get().showToast(`Scanned: Identified ${newMaterials.length} new materials!`);
        } else {
          get().showToast("No materials detected. Check picture quality.");
        }
      } else {
        throw new Error();
      }
    } catch (err) {
      console.warn('Backend vision scan failed, using simulated scanning:', err);
      // Simulate random matching items
      const items = ['cardboard box', 'plastic bottle', 'hot glue', 'acrylic paint', 'wool rope', 'metallic nails'];
      const randomCount = Math.floor(Math.random() * 2) + 2;
      const detected: string[] = [];
      for (let i = 0; i < randomCount; i++) {
        const item = items[Math.floor(Math.random() * items.length)];
        if (!materials.includes(item)) detected.push(item);
      }
      
      if (detected.length > 0) {
        const combined = Array.from(new Set([...materials, ...detected]));
        set({ materials: combined });
        get().showToast(`Simulated Scan: Found ${detected.join(', ')}!`);
      } else {
        get().showToast("Simulated Scan: No new items found.");
      }
    } finally {
      set({ isScanning: false });
    }
  }
}));
