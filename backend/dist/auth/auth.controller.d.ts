import { PrismaService } from '../prisma.service';
export declare class AuthController {
    private prisma;
    constructor(prisma: PrismaService);
    syncUser(req: any, body: {
        name?: string;
        avatarUrl?: string;
    }): Promise<{
        id: string;
        email: string;
        name: string | null;
        avatarUrl: string | null;
        role: import("@prisma/client").$Enums.Role;
        isPremium: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
