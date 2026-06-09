import { Controller, Post, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { SocialService } from './social.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller()
export class SocialController {
  constructor(private socialService: SocialService) {}

  @Post('projects/:id/like')
  @UseGuards(AuthGuard)
  async toggleLike(@Req() req: any, @Param('id') id: string) {
    const liked = await this.socialService.toggleLike(req.user.id, id);
    return { liked };
  }

  @Post('projects/:id/comments')
  @UseGuards(AuthGuard)
  async addComment(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { content: string },
  ) {
    return this.socialService.addComment(req.user.id, id, body.content);
  }

  @Delete('comments/:id')
  @UseGuards(AuthGuard)
  async deleteComment(@Req() req: any, @Param('id') id: string) {
    return this.socialService.deleteComment(req.user.id, id);
  }
}
