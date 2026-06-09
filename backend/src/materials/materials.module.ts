import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MaterialsController } from './materials.controller';
import { AiModule } from '../ai/ai.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [ConfigModule, AiModule, AuthModule],
  controllers: [MaterialsController],
})
export class MaterialsModule {}
