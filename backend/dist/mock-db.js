"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockDb = void 0;
class MockDb {
    users = [];
    profiles = [];
    projects = [];
    materials = [];
    projectMaterials = [];
    tools = [];
    projectTools = [];
    likes = [];
    comments = [];
    savedProjects = [];
    subscriptions = [];
    constructor() {
        this.users.push({
            id: 'mock-user-id',
            email: 'maker@diygenius.ai',
            name: 'DIY Master',
            avatarUrl: null,
            role: 'USER',
            isPremium: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }
    get user() {
        return {
            findUnique: async (args) => {
                const id = args.where.id;
                const email = args.where.email;
                return this.users.find(u => u.id === id || u.email === email) || null;
            },
            upsert: async (args) => {
                const id = args.where.id;
                let user = this.users.find(u => u.id === id);
                if (user) {
                    Object.assign(user, args.update);
                }
                else {
                    user = {
                        id,
                        email: args.create.email,
                        name: args.create.name || null,
                        avatarUrl: args.create.avatarUrl || null,
                        role: args.create.role || 'USER',
                        isPremium: args.create.isPremium || false,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    };
                    this.users.push(user);
                }
                return user;
            },
            update: async (args) => {
                const id = args.where.id;
                const user = this.users.find(u => u.id === id);
                if (user) {
                    Object.assign(user, args.data);
                }
                return user;
            }
        };
    }
    get profile() {
        return {
            findUnique: async (args) => {
                return this.profiles.find(p => p.userId === args.where.userId) || null;
            },
            create: async (args) => {
                const prof = {
                    id: Math.random().toString(36).substring(7),
                    ...args.data,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
                this.profiles.push(prof);
                return prof;
            }
        };
    }
    get project() {
        return {
            create: async (args) => {
                const data = args.data;
                const stepsList = data.steps?.create || [];
                const newProject = {
                    id: Math.random().toString(36).substring(7),
                    title: data.title,
                    description: data.description,
                    difficulty: data.difficulty || 'EASY',
                    timeEstimate: data.timeEstimate || '2 hours',
                    costEstimate: data.costEstimate || '$5 - $20',
                    imageUrl: data.imageUrl || null,
                    authorId: data.authorId,
                    isPremiumOnly: data.isPremiumOnly || false,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    steps: stepsList.map((s, idx) => ({
                        id: Math.random().toString(36).substring(7),
                        stepNumber: s.stepNumber || (idx + 1),
                        instruction: s.instruction,
                        safetyWarning: s.safetyWarning || null,
                    })),
                };
                this.projects.push(newProject);
                return newProject;
            },
            update: async (args) => {
                const id = args.where.id;
                const p = this.projects.find(proj => proj.id === id);
                if (p) {
                    Object.assign(p, args.data);
                }
                return p;
            },
            findUnique: async (args) => {
                const id = args.where.id;
                const p = this.projects.find(proj => proj.id === id);
                if (!p)
                    return null;
                const author = this.users.find(u => u.id === p.authorId) || { name: 'Maker', avatarUrl: null };
                const pMaterials = this.projectMaterials.filter(pm => pm.projectId === p.id).map(pm => {
                    const mat = this.materials.find(m => m.id === pm.materialId);
                    return { material: mat };
                });
                const pTools = this.projectTools.filter(pt => pt.projectId === p.id).map(pt => {
                    const tool = this.tools.find(t => t.id === pt.toolId);
                    return { tool: tool };
                });
                const pComments = this.comments.filter(c => c.projectId === p.id).map(c => {
                    const u = this.users.find(usr => usr.id === c.userId) || { name: 'Anonymous', avatarUrl: null };
                    return { ...c, user: u };
                }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
                const pLikes = this.likes.filter(l => l.projectId === p.id);
                const pSteps = p.steps || [];
                return {
                    ...p,
                    author,
                    materials: pMaterials,
                    tools: pTools,
                    comments: pComments,
                    likes: pLikes,
                    steps: pSteps,
                };
            },
            findMany: async (args) => {
                let filtered = [...this.projects];
                if (args?.where?.difficulty) {
                    filtered = filtered.filter(p => p.difficulty === args.where.difficulty);
                }
                const populated = filtered.map(p => {
                    const author = this.users.find(u => u.id === p.authorId) || { name: 'Maker', avatarUrl: null };
                    const pMaterials = this.projectMaterials.filter(pm => pm.projectId === p.id).map(pm => {
                        const mat = this.materials.find(m => m.id === pm.materialId);
                        return { material: mat };
                    });
                    return { ...p, author, materials: pMaterials };
                });
                const sorted = populated.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
                return args?.take ? sorted.slice(0, args.take) : sorted;
            }
        };
    }
    get material() {
        return {
            upsert: async (args) => {
                const name = args.where.name.toLowerCase();
                let mat = this.materials.find(m => m.name === name);
                if (!mat) {
                    mat = { id: Math.random().toString(36).substring(7), name, createdAt: new Date() };
                    this.materials.push(mat);
                }
                return mat;
            }
        };
    }
    get projectMaterial() {
        return {
            create: async (args) => {
                const pm = { projectId: args.data.projectId, materialId: args.data.materialId };
                this.projectMaterials.push(pm);
                return pm;
            }
        };
    }
    get tool() {
        return {
            upsert: async (args) => {
                const name = args.where.name.toLowerCase();
                let t = this.tools.find(to => to.name === name);
                if (!t) {
                    t = { id: Math.random().toString(36).substring(7), name, createdAt: new Date() };
                    this.tools.push(t);
                }
                return t;
            }
        };
    }
    get projectTool() {
        return {
            create: async (args) => {
                const pt = { projectId: args.data.projectId, toolId: args.data.toolId };
                this.projectTools.push(pt);
                return pt;
            }
        };
    }
    get savedProject() {
        return {
            findUnique: async (args) => {
                const { userId, projectId } = args.where.userId_projectId;
                return this.savedProjects.find(sp => sp.userId === userId && sp.projectId === projectId) || null;
            },
            delete: async (args) => {
                const { userId, projectId } = args.where.userId_projectId;
                this.savedProjects = this.savedProjects.filter(sp => !(sp.userId === userId && sp.projectId === projectId));
                return { userId, projectId };
            },
            create: async (args) => {
                const sp = { userId: args.data.userId, projectId: args.data.projectId, createdAt: new Date() };
                this.savedProjects.push(sp);
                return sp;
            },
            findMany: async (args) => {
                const filtered = this.savedProjects.filter(sp => sp.userId === args.where.userId);
                return filtered.map(sp => {
                    const projectObj = this.projects.find(p => p.id === sp.projectId);
                    if (!projectObj)
                        return null;
                    const author = this.users.find(u => u.id === projectObj.authorId) || { name: 'Maker', avatarUrl: null };
                    const pMaterials = this.projectMaterials.filter(pm => pm.projectId === projectObj.id).map(pm => {
                        const mat = this.materials.find(m => m.id === pm.materialId);
                        return { material: mat };
                    });
                    return {
                        project: {
                            ...projectObj,
                            author,
                            materials: pMaterials
                        }
                    };
                }).filter(Boolean);
            }
        };
    }
    get like() {
        return {
            findUnique: async (args) => {
                const { userId, projectId } = args.where.userId_projectId;
                return this.likes.find(l => l.userId === userId && l.projectId === projectId) || null;
            },
            delete: async (args) => {
                const { userId, projectId } = args.where.userId_projectId;
                this.likes = this.likes.filter(l => !(l.userId === userId && l.projectId === projectId));
                return { userId, projectId };
            },
            create: async (args) => {
                const l = { userId: args.data.userId, projectId: args.data.projectId, createdAt: new Date() };
                this.likes.push(l);
                return l;
            }
        };
    }
    get comment() {
        return {
            create: async (args) => {
                const newComment = {
                    id: Math.random().toString(36).substring(7),
                    userId: args.data.userId,
                    projectId: args.data.projectId,
                    content: args.data.content,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
                this.comments.push(newComment);
                const u = this.users.find(usr => usr.id === args.data.userId) || { name: 'Anonymous', avatarUrl: null };
                return { ...newComment, user: u };
            },
            delete: async (args) => {
                const id = args.where.id;
                this.comments = this.comments.filter(c => c.id !== id);
                return { id };
            }
        };
    }
    get subscription() {
        return {
            upsert: async (args) => {
                const userId = args.where.userId;
                let sub = this.subscriptions.find(s => s.userId === userId);
                if (sub) {
                    Object.assign(sub, args.update);
                }
                else {
                    sub = {
                        id: Math.random().toString(36).substring(7),
                        userId,
                        stripeCustomerId: args.create.stripeCustomerId,
                        stripeSubscriptionId: args.create.stripeSubscriptionId,
                        status: args.create.status,
                        priceId: args.create.priceId,
                        currentPeriodEnd: args.create.currentPeriodEnd,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    };
                    this.subscriptions.push(sub);
                }
                return sub;
            },
            findUnique: async (args) => {
                return this.subscriptions.find(s => s.stripeSubscriptionId === args.where.stripeSubscriptionId) || null;
            },
            update: async (args) => {
                const sub = this.subscriptions.find(s => s.id === args.where.id);
                if (sub) {
                    Object.assign(sub, args.data);
                }
                return sub;
            }
        };
    }
    async $executeRawUnsafe(query, ...params) {
        return 1;
    }
    async $queryRawUnsafe(query, ...params) {
        return this.projects.slice(0, 10).map(p => ({
            id: p.id,
            title: p.title,
            description: p.description,
            difficulty: p.difficulty,
            timeEstimate: p.timeEstimate,
            costEstimate: p.costEstimate,
            imageUrl: p.imageUrl,
            authorId: p.authorId
        }));
    }
}
exports.MockDb = MockDb;
//# sourceMappingURL=mock-db.js.map