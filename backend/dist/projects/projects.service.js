"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const ai_service_1 = require("../ai/ai.service");
const client_1 = require("@prisma/client");
let ProjectsService = class ProjectsService {
    prisma;
    aiService;
    constructor(prisma, aiService) {
        this.prisma = prisma;
        this.aiService = aiService;
    }
    async generateProjectOptions(materials, difficulty, category) {
        return this.aiService.generateProjects(materials, difficulty, category);
    }
    async generateProjectDetails(authorId, title, description, difficulty, category, materials) {
        const stepsData = await this.aiService.generateProjectSteps(title, materials);
        let diffEnum = client_1.Difficulty.EASY;
        if (difficulty.toUpperCase() === 'MEDIUM')
            diffEnum = client_1.Difficulty.MEDIUM;
        if (difficulty.toUpperCase() === 'HARD')
            diffEnum = client_1.Difficulty.HARD;
        const embedding = await this.aiService.generateEmbedding(`${title} ${description} ${materials.join(', ')}`);
        const project = await this.prisma.project.create({
            data: {
                title,
                description,
                difficulty: diffEnum,
                timeEstimate: '2 hours',
                costEstimate: '$5 - $20',
                authorId,
                steps: {
                    create: stepsData.steps.map((s) => ({
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
        if (embedding && embedding.length > 0) {
            const embeddingString = `[${embedding.join(',')}]`;
            await this.prisma.$executeRawUnsafe(`UPDATE "Project" SET "embedding" = $1::vector WHERE "id" = $2`, embeddingString, project.id);
        }
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
            }).catch(() => { });
        }
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
            }).catch(() => { });
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
    async visualizeProject(projectId) {
        const project = await this.prisma.project.findUnique({ where: { id: projectId } });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        if (project.imageUrl)
            return project.imageUrl;
        const imageUrl = await this.aiService.generateProjectImage(project.title, project.description);
        if (imageUrl) {
            await this.prisma.project.update({
                where: { id: projectId },
                data: { imageUrl },
            });
        }
        return imageUrl;
    }
    async getProjectById(projectId) {
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
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        return project;
    }
    async searchProjects(query, category, difficulty) {
        if (query) {
            const embedding = await this.aiService.generateEmbedding(query);
            const embeddingString = `[${embedding.join(',')}]`;
            const rawProjects = await this.prisma.$queryRawUnsafe(`SELECT id, title, description, difficulty, "timeEstimate", "costEstimate", "imageUrl", "authorId"
         FROM "Project"
         ORDER BY "embedding" <=> $1::vector
         LIMIT 10`, embeddingString);
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
        const where = {};
        if (difficulty) {
            where.difficulty = difficulty.toUpperCase();
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
    async toggleSaveProject(userId, projectId) {
        const existing = await this.prisma.savedProject.findUnique({
            where: { userId_projectId: { userId, projectId } },
        });
        if (existing) {
            await this.prisma.savedProject.delete({
                where: { userId_projectId: { userId, projectId } },
            });
            return false;
        }
        else {
            await this.prisma.savedProject.create({
                data: { userId, projectId },
            });
            return true;
        }
    }
    async getSavedProjects(userId) {
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
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ai_service_1.AiService])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map