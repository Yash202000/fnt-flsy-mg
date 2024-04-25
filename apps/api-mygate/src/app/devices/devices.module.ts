import { Module } from '@nestjs/common';
import { DevicesController } from './devices.controller';
import { DevicesService } from './devices.service';
import { PrismaClientMygateModule } from '@fnt-flsy/prisma-client-mygate';
import { MainFluxModule } from '../mainflux/mainflux.module';
import { MainFluxService } from '../mainflux/mainflux.service';
import { AuthModule } from '../core/auth/auth.module';
import { AuthService } from '../core/auth/auth.service';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [PrismaClientMygateModule, MainFluxModule, AuthModule],
  controllers: [DevicesController],
  providers: [DevicesService, MainFluxService, AuthService, ConfigService],
})
export class DevicesModule {}
