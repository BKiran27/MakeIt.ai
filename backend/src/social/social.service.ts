import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class SocialService {
  constructor(private prisma: PrismaService) {}

  async toggleLike(userId: string, projectId: string) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');

    const existing = await this.prisma.like.findUnique({
      where: { userId_projectId: { userId, projectId } },
    });

    if (existing) {
      await this.prisma.like.delete({
        where: { userId_projectId: { userId, projectId } },
      });
      return false; // unliked
    } else {
      await this.prisma.like.create({
        data: { userId, projectId },
      });
      return true; // liked
    }
  }

  async addComment(userId: string, projectId: string, content: string) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');

    return this.prisma.comment.create({
      data: {
        userId,
        projectId,
        content,
      },
      include: {
        user: { select: { name: true, avatarUrl: true } },
      },
    });
  }

  async deleteComment(userId: string, commentId: string) {
    const comment = await this.prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) throw new NotFoundException('Comment not found');

    if (comment.userId !== userId) {
      throw new ForbiddenException('You are not allowed to delete this comment');
    }

    await this.prisma.comment.delete({ where: { id: commentId } });
    return { success: true };
  }
}
