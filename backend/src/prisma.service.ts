import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { MockDb } from './mock-db';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);
  private mockDb = new MockDb();
  public isMock = false;

  constructor() {
    super();
    return new Proxy(this, {
      get: (target, prop, receiver) => {
        if (target.isMock) {
          if (prop in target.mockDb) {
            return (target.mockDb as any)[prop];
          }
          if (typeof prop === 'string' && prop.startsWith('$')) {
            return (target.mockDb as any)[prop].bind(target.mockDb);
          }
        }
        return Reflect.get(target, prop, receiver);
      }
    });
  }

  async onModuleInit() {
    try {
      const dbUrl = process.env.DATABASE_URL;
      if (!dbUrl || dbUrl.includes('placeholder')) {
        throw new Error('No DATABASE_URL configured');
      }
      await this.$connect();
      this.logger.log('Successfully connected to the database.');
    } catch (error) {
      this.isMock = true;
      this.logger.warn(
        'Database connection failed. Operating in Mock In-Memory Database Mode for demo/preview purposes.',
      );
    }
  }
}
