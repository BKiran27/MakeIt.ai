import { PrismaService } from '../prisma.service';
export declare class SocialService {
    private prisma;
    constructor(prisma: PrismaService);
    toggleLike(userId: string, projectId: string): Promise<boolean>;
    addComment(userId: string, projectId: string, content: string): Promise<{
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
    }>;
    deleteComment(userId: string, commentId: string): Promise<{
        success: boolean;
    }>;
}
