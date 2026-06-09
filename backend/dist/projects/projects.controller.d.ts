import { ProjectsService } from './projects.service';
export declare class ProjectsController {
    private projectsService;
    constructor(projectsService: ProjectsService);
    generateOptions(body: {
        materials: string[];
        difficulty: string;
        category: string;
    }): Promise<{
        projects: any[];
    }>;
    generateDetails(req: any, body: {
        title: string;
        description: string;
        difficulty: string;
        category: string;
        materials: string[];
    }): Promise<({
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
            projectId: string;
            id: string;
            createdAt: Date;
            safetyWarning: string | null;
            imageUrl: string | null;
            stepNumber: number;
            instruction: string;
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
    visualize(id: string): Promise<{
        imageUrl: string;
    }>;
    getSaved(req: any): Promise<{
        projects: ({
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
        })[];
    }>;
    search(query?: string, category?: string, difficulty?: string): Promise<{
        projects: (({
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
        }) | null)[];
    }>;
    getById(id: string): Promise<{
        comments: ({
            user: {
                name: string | null;
                avatarUrl: string | null;
            };
        } & {
            userId: string;
            projectId: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            content: string;
        })[];
        likes: {
            userId: string;
            projectId: string;
            createdAt: Date;
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
            projectId: string;
            id: string;
            createdAt: Date;
            safetyWarning: string | null;
            imageUrl: string | null;
            stepNumber: number;
            instruction: string;
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
    toggleSave(req: any, id: string): Promise<{
        saved: boolean;
    }>;
}
