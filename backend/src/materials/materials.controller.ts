import { Controller, Post, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../auth/auth.guard';
import { AiService } from '../ai/ai.service';

@Controller('materials')
export class MaterialsController {
  constructor(private aiService: AiService) {}

  @Post('detect')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async detectMaterials(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      return { materials: [] };
    }
    const materials = await this.aiService.detectMaterials(file.buffer, file.mimetype);
    return { materials };
  }
}
