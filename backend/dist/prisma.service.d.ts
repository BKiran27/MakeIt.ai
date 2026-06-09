import { OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
export declare class PrismaService extends PrismaClient implements OnModuleInit {
    private readonly logger;
    private mockDb;
    isMock: boolean;
    constructor();
    onModuleInit(): Promise<void>;
}
