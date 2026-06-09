import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { PrismaService } from '../prisma.service';

@Module({
  imports: [ConfigModule],
  controllers: [AuthController],
  providers: [AuthGuard, PrismaService],
  exports: [AuthGuard],
})
export class AuthModule {}
