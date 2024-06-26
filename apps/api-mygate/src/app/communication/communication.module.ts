import { Module } from '@nestjs/common';
import { CommunicationController } from './communication.controller';
import { CommunicationService } from './communication.service';
import { PrismaClientMygateModule } from '@fnt-flsy/prisma-client-mygate';
import { MainFluxService } from '../mainflux/mainflux.service';
import { MyGateService } from '../mygate/mygate.service';
import { AuthService } from '../core/auth/auth.service';
import { ConfigService } from '@nestjs/config';
import { AuthModule } from '../core/auth/auth.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [PrismaClientMygateModule],
  controllers: [CommunicationController],
  providers: [
    CommunicationService,
    MainFluxService,
    MyGateService,
    AuthService,
    ConfigService,
    JwtService,
  ],
})
export class CommunicationModule {}
