import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma.service';
export declare class BillingService {
    private configService;
    private prisma;
    private stripe;
    constructor(configService: ConfigService, prisma: PrismaService);
    createCheckoutSession(userId: string): Promise<{
        url: any;
    }>;
    handleWebhook(signature: string, rawBody: Buffer): Promise<{
        received: boolean;
    }>;
}
