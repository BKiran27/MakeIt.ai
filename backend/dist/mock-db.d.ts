export declare class MockDb {
    private users;
    private profiles;
    private projects;
    private materials;
    private projectMaterials;
    private tools;
    private projectTools;
    private likes;
    private comments;
    private savedProjects;
    private subscriptions;
    constructor();
    get user(): {
        findUnique: (args: any) => Promise<any>;
        upsert: (args: any) => Promise<any>;
        update: (args: any) => Promise<any>;
    };
    get profile(): {
        findUnique: (args: any) => Promise<any>;
        create: (args: any) => Promise<any>;
    };
    get project(): {
        create: (args: any) => Promise<{
            id: string;
            title: any;
            description: any;
            difficulty: any;
            timeEstimate: any;
            costEstimate: any;
            imageUrl: any;
            authorId: any;
            isPremiumOnly: any;
            createdAt: Date;
            updatedAt: Date;
            steps: any;
        }>;
        update: (args: any) => Promise<any>;
        findUnique: (args: any) => Promise<any>;
        findMany: (args: any) => Promise<any[]>;
    };
    get material(): {
        upsert: (args: any) => Promise<any>;
    };
    get projectMaterial(): {
        create: (args: any) => Promise<{
            projectId: any;
            materialId: any;
        }>;
    };
    get tool(): {
        upsert: (args: any) => Promise<any>;
    };
    get projectTool(): {
        create: (args: any) => Promise<{
            projectId: any;
            toolId: any;
        }>;
    };
    get savedProject(): {
        findUnique: (args: any) => Promise<any>;
        delete: (args: any) => Promise<{
            userId: any;
            projectId: any;
        }>;
        create: (args: any) => Promise<{
            userId: any;
            projectId: any;
            createdAt: Date;
        }>;
        findMany: (args: any) => Promise<({
            project: any;
        } | null)[]>;
    };
    get like(): {
        findUnique: (args: any) => Promise<any>;
        delete: (args: any) => Promise<{
            userId: any;
            projectId: any;
        }>;
        create: (args: any) => Promise<{
            userId: any;
            projectId: any;
            createdAt: Date;
        }>;
    };
    get comment(): {
        create: (args: any) => Promise<{
            user: any;
            id: string;
            userId: any;
            projectId: any;
            content: any;
            createdAt: Date;
            updatedAt: Date;
        }>;
        delete: (args: any) => Promise<{
            id: any;
        }>;
    };
    get subscription(): {
        upsert: (args: any) => Promise<any>;
        findUnique: (args: any) => Promise<any>;
        update: (args: any) => Promise<any>;
    };
    $executeRawUnsafe(query: string, ...params: any[]): Promise<number>;
    $queryRawUnsafe(query: string, ...params: any[]): Promise<{
        id: any;
        title: any;
        description: any;
        difficulty: any;
        timeEstimate: any;
        costEstimate: any;
        imageUrl: any;
        authorId: any;
    }[]>;
}
