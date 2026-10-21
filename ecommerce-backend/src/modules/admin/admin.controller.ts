import { Controller, Get, Patch, Delete, Param, Body } from '@nestjs/common';
import { PrismaService } from 'src/infra/database/prisma.service';

@Controller('admin')
export class AdminController {
  constructor(private prisma: PrismaService) {}

  @Get('users')
  async getAllUsers() {
    const now = new Date();
    const rows = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        sessions: {
          where: { expiresAt: { gt: now } },
          take: 1,
          select: { id: true },
        },
      },
    });
    return rows.map(({ sessions, ...user }) => ({
      ...user,
      hasActiveSession: sessions.length > 0,
    }));
  }

  @Patch('users/:id/role')
  async changeRole(@Param('id') id: string, @Body() body: { role: string }) {
    return await this.prisma.user.update({
      where: { id },
      data: { role: body.role },
    });
  }

  @Patch('users/:id/toggle-block')
  async toggleBlock(@Param('id') id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return await this.prisma.user.update({
      where: { id },
      data: { isBlocked: !user?.isBlocked },
    });
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') id: string) {
    return await this.prisma.user.delete({ where: { id } });
  }
}
