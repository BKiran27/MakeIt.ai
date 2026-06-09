import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AiService } from '../ai/ai.service';
import { Difficulty } from '@prisma/client';

@Injectable()
export class ProjectsService {
  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
  ) {}

  async generateProjectOptions(materials: string[], difficulty: string, category: string) {
    return this.aiService.generateProjects(materials, difficulty, category);
  }

  async generateProjectDetails(
    authorId: string,
    title: string,
    description: string,
    difficulty: string,
    category: string,
    materials: string[],
  ) {
    // 1. Generate tools, safety warnings, and detailed instructions via OpenAI
    const stepsData = await this.aiService.generateProjectSteps(title, materials);
    
    // Convert difficulty string to Prisma enum
    let diffEnum: Difficulty = Difficulty.EASY;
    if (difficulty.toUpperCase() === 'MEDIUM') diffEnum = Difficulty.MEDIUM;
    if (difficulty.toUpperCase() === 'HARD') diffEnum = Difficulty.HARD;

    // 2. Generate embedding for project description + title to support vector search
    const embedding = await this.aiService.generateEmbedding(`${title} ${description} ${materials.join(', ')}`);

    // 3. Save Project and its relational data into Postgres
    const project = await this.prisma.project.create({
      data: {
        title,
        description,
        difficulty: diffEnum,
        timeEstimate: '2 hours', // defaulted or parsed
        costEstimate: '$5 - $20', // defaulted or parsed
        authorId,
        steps: {
          create: stepsData.steps.map((s: any) => ({
            stepNumber: s.stepNumber,
            instruction: s.instruction,
            safetyWarning: s.safetyWarning || null,
          })),
        },
      },
      include: {
        steps: true,
        author: {
          select: { name: true, avatarUrl: true },
        },
      },
    });

    // 4. Save embedding using a raw SQL query (Prisma doesn't support vector updates natively easily)
    if (embedding && embedding.length > 0) {
      const embeddingString = `[${embedding.join(',')}]`;
      await this.prisma.$executeRawUnsafe(
        `UPDATE "Project" SET "embedding" = $1::vector WHERE "id" = $2`,
        embeddingString,
        project.id,
      );
    }

    // 5. Connect/Create materials relations
    for (const matName of materials) {
      const dbMaterial = await this.prisma.material.upsert({
        where: { name: matName.toLowerCase() },
        update: {},
        create: { name: matName.toLowerCase() },
      });

      await this.prisma.projectMaterial.create({
        data: {
          projectId: project.id,
          materialId: dbMaterial.id,
        },
      }).catch(() => {}); // ignore duplicate entries
    }

    // 6. Connect/Create tools relations
    for (const toolName of (stepsData.requiredTools || [])) {
      const dbTool = await this.prisma.tool.upsert({
        where: { name: toolName.toLowerCase() },
        update: {},
        create: { name: toolName.toLowerCase() },
      });

      await this.prisma.projectTool.create({
        data: {
          projectId: project.id,
          toolId: dbTool.id,
        },
      }).catch(() => {});
    }

    return this.prisma.project.findUnique({
      where: { id: project.id },
      include: {
        steps: { orderBy: { stepNumber: 'asc' } },
        materials: { include: { material: true } },
        tools: { include: { tool: true } },
        author: { select: { name: true, avatarUrl: true } },
      },
    });
  }

  async visualizeProject(projectId: string) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');

    if (project.imageUrl) return project.imageUrl;

    const imageUrl = await this.aiService.generateProjectImage(project.title, project.description);
    
    if (imageUrl) {
      await this.prisma.project.update({
        where: { id: projectId },
        data: { imageUrl },
      });
    }

    return imageUrl;
  }

  async getProjectById(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        steps: { orderBy: { stepNumber: 'asc' } },
        materials: { include: { material: true } },
        tools: { include: { tool: true } },
        author: { select: { id: true, name: true, avatarUrl: true } },
        comments: {
          include: { user: { select: { name: true, avatarUrl: true } } },
          orderBy: { createdAt: 'desc' },
        },
        likes: true,
      },
    });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async searchProjects(query?: string, category?: string, difficulty?: string) {
    // If a search query is provided, perform semantic vector similarity search
    if (query) {
      const embedding = await this.aiService.generateEmbedding(query);
      const embeddingString = `[${embedding.join(',')}]`;
      
      // Raw query for cosine distance using <=> operator of pgvector
      const rawProjects: any[] = await this.prisma.$queryRawUnsafe(
        `SELECT id, title, description, difficulty, "timeEstimate", "costEstimate", "imageUrl", "authorId"
         FROM "Project"
         ORDER BY "embedding" <=> $1::vector
         LIMIT 10`,
        embeddingString,
      );

      // Populate author details for raw projects
      const populatedProjects = [];
      for (const p of rawProjects) {
        const fullProj = await this.prisma.project.findUnique({
          where: { id: p.id },
          include: {
            author: { select: { name: true, avatarUrl: true } },
            materials: { include: { material: true } },
          },
        });
        populatedProjects.push(fullProj);
      }
      return populatedProjects;
    }

    // Default filters if no search query
    const where: any = {};
    if (difficulty) {
      where.difficulty = difficulty.toUpperCase() as Difficulty;
    }

    return this.prisma.project.findMany({
      where,
      include: {
        author: { select: { name: true, avatarUrl: true } },
        materials: { include: { material: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  async toggleSaveProject(userId: string, projectId: string) {
    const existing = await this.prisma.savedProject.findUnique({
      where: { userId_projectId: { userId, projectId } },
    });

    if (existing) {
      await this.prisma.savedProject.delete({
        where: { userId_projectId: { userId, projectId } },
      });
      return false;
    } else {
      await this.prisma.savedProject.create({
        data: { userId, projectId },
      });
      return true;
    }
  }

  async getSavedProjects(userId: string) {
    const saves = await this.prisma.savedProject.findMany({
      where: { userId },
      include: {
        project: {
          include: {
            author: { select: { name: true, avatarUrl: true } },
            materials: { include: { material: true } },
          },
        },
      },
    });
    return saves.map((s) => s.project);
  }
}
