import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { PrismaClientMygateModule } from '@fnt-flsy/prisma-client-mygate';
import { AuthGuard } from './auth.guard';
import { JwtModule, JwtService } from '@nestjs/jwt';

@Module({
  imports: [PrismaClientMygateModule,JwtModule.register({})],
  providers: [AuthService, ConfigService, JwtService, AuthGuard],
  exports: [],
})
export class AuthModule {}
