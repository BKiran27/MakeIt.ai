import { Controller, Post, Get, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('projects')
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Post('generate')
  @UseGuards(AuthGuard)
  async generateOptions(
    @Body() body: { materials: string[]; difficulty: string; category: string },
  ) {
    const options = await this.projectsService.generateProjectOptions(
      body.materials || [],
      body.difficulty || 'Easy',
      body.category || 'Surprise Me',
    );
    return { projects: options };
  }

  @Post('generate/steps')
  @UseGuards(AuthGuard)
  async generateDetails(
    @Req() req: any,
    @Body()
    body: {
      title: string;
      description: string;
      difficulty: string;
      category: string;
      materials: string[];
    },
  ) {
    const project = await this.projectsService.generateProjectDetails(
      req.user.id,
      body.title,
      body.description,
      body.difficulty,
      body.category,
      body.materials,
    );
    return project;
  }

  @Post(':id/visualize')
  @UseGuards(AuthGuard)
  async visualize(@Param('id') id: string) {
    const imageUrl = await this.projectsService.visualizeProject(id);
    return { imageUrl };
  }

  @Get('saved')
  @UseGuards(AuthGuard)
  async getSaved(@Req() req: any) {
    const projects = await this.projectsService.getSavedProjects(req.user.id);
    return { projects };
  }

  @Get()
  async search(
    @Query('query') query?: string,
    @Query('category') category?: string,
    @Query('difficulty') difficulty?: string,
  ) {
    const projects = await this.projectsService.searchProjects(query, category, difficulty);
    return { projects };
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const project = await this.projectsService.getProjectById(id);
    return project;
  }

  @Post(':id/save')
  @UseGuards(AuthGuard)
  async toggleSave(@Req() req: any, @Param('id') id: string) {
    const saved = await this.projectsService.toggleSaveProject(req.user.id, id);
    return { saved };
  }
}
