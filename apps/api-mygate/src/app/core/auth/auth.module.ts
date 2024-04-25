import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { PrismaClientMygateModule } from '@fnt-flsy/prisma-client-mygate';
import { AuthGuard } from './auth.guard';

@Module({
  imports: [PrismaClientMygateModule],
  providers: [AuthService, ConfigService, AuthGuard],
  exports: [],
})
export class AuthModule {}
