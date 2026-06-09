import { PrismaService } from '../prisma.service';
import { AiService } from '../ai/ai.service';
export declare class ProjectsService {
    private prisma;
    private aiService;
    constructor(prisma: PrismaService, aiService: AiService);
    generateProjectOptions(materials: string[], difficulty: string, category: string): Promise<any[]>;
    generateProjectDetails(authorId: string, title: string, description: string, difficulty: string, category: string, materials: string[]): Promise<({
        materials: ({
            material: {
                id: string;
                name: string;
                createdAt: Date;
                category: string | null;
            };
        } & {
            projectId: string;
            materialId: string;
        })[];
        author: {
            name: string | null;
            avatarUrl: string | null;
        };
        tools: ({
            tool: {
                id: string;
                name: string;
                createdAt: Date;
            };
        } & {
            projectId: string;
            toolId: string;
        })[];
        steps: {
            id: string;
            createdAt: Date;
            imageUrl: string | null;
            stepNumber: number;
            instruction: string;
            safetyWarning: string | null;
            projectId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string;
        difficulty: import("@prisma/client").$Enums.Difficulty;
        timeEstimate: string;
        costEstimate: string;
        imageUrl: string | null;
        isPremiumOnly: boolean;
        authorId: string;
    }) | null>;
    visualizeProject(projectId: string): Promise<string>;
    getProjectById(projectId: string): Promise<{
        comments: ({
            user: {
                name: string | null;
                avatarUrl: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            projectId: string;
            userId: string;
            content: string;
        })[];
        likes: {
            createdAt: Date;
            projectId: string;
            userId: string;
        }[];
        materials: ({
            material: {
                id: string;
                name: string;
                createdAt: Date;
                category: string | null;
            };
        } & {
            projectId: string;
            materialId: string;
        })[];
        author: {
            id: string;
            name: string | null;
            avatarUrl: string | null;
        };
        tools: ({
            tool: {
                id: string;
                name: string;
                createdAt: Date;
            };
        } & {
            projectId: string;
            toolId: string;
        })[];
        steps: {
            id: string;
            createdAt: Date;
            imageUrl: string | null;
            stepNumber: number;
            instruction: string;
            safetyWarning: string | null;
            projectId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string;
        difficulty: import("@prisma/client").$Enums.Difficulty;
        timeEstimate: string;
        costEstimate: string;
        imageUrl: string | null;
        isPremiumOnly: boolean;
        authorId: string;
    }>;
    searchProjects(query?: string, category?: string, difficulty?: string): Promise<(({
        materials: ({
            material: {
                id: string;
                name: string;
                createdAt: Date;
                category: string | null;
            };
        } & {
            projectId: string;
            materialId: string;
        })[];
        author: {
            name: string | null;
            avatarUrl: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string;
        difficulty: import("@prisma/client").$Enums.Difficulty;
        timeEstimate: string;
        costEstimate: string;
        imageUrl: string | null;
        isPremiumOnly: boolean;
        authorId: string;
    }) | null)[]>;
    toggleSaveProject(userId: string, projectId: string): Promise<boolean>;
    getSavedProjects(userId: string): Promise<({
        materials: ({
            material: {
                id: string;
                name: string;
                createdAt: Date;
                category: string | null;
            };
        } & {
            projectId: string;
            materialId: string;
        })[];
        author: {
            name: string | null;
            avatarUrl: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string;
        difficulty: import("@prisma/client").$Enums.Difficulty;
        timeEstimate: string;
        costEstimate: string;
        imageUrl: string | null;
        isPremiumOnly: boolean;
        authorId: string;
    })[]>;
}
