import { Module } from '@nestjs/common';
import { MyGateService } from './mygate.service';
import { PrismaClientMygateModule } from '@fnt-flsy/prisma-client-mygate';
import { MyGateController } from './mygate.controller';
import { MainFluxModule } from '../mainflux/mainflux.module';
import { MainFluxService } from '../mainflux/mainflux.service';
import { AuthModule } from '../core/auth/auth.module';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../core/auth/auth.service';

@Module({
  imports: [PrismaClientMygateModule, MainFluxModule, AuthModule],
  providers: [MyGateService, MainFluxService, AuthService, ConfigService],
  controllers: [MyGateController],
})
export class MyGateModule {}
