import { SocialService } from './social.service';
export declare class SocialController {
    private socialService;
    constructor(socialService: SocialService);
    toggleLike(req: any, id: string): Promise<{
        liked: boolean;
    }>;
    addComment(req: any, id: string, body: {
        content: string;
    }): Promise<{
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
    }>;
    deleteComment(req: any, id: string): Promise<{
        success: boolean;
    }>;
}
