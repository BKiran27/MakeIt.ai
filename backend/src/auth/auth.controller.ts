import { Controller, Post, UseGuards, Req, Body } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { PrismaService } from '../prisma.service';

@Controller('auth')
export class AuthController {
  constructor(private prisma: PrismaService) {}

  @Post('sync')
  @UseGuards(AuthGuard)
  async syncUser(@Req() req: any, @Body() body: { name?: string; avatarUrl?: string }) {
    const user = req.user;
    
    // Upsert user in Postgres database based on Supabase UUID
    const dbUser = await this.prisma.user.upsert({
      where: { id: user.id },
      update: {
        email: user.email,
        name: body.name || undefined,
        avatarUrl: body.avatarUrl || undefined,
      },
      create: {
        id: user.id,
        email: user.email,
        name: body.name || null,
        avatarUrl: body.avatarUrl || null,
        profile: {
          create: {
            bio: '',
          },
        },
      },
    });

    return dbUser;
  }
}
