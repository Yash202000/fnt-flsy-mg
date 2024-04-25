import { Module } from '@nestjs/common';
import { MyGateLogsController } from './mygate-logs.controller';
import { MyGateLogsService } from './mygate-logs.service';
import { PrismaClientMygateModule } from '@fnt-flsy/prisma-client-mygate';
import { MyGateModule } from '../mygate/mygate.module';
import { MyGateService } from '../mygate/mygate.service';
import { MainFluxModule } from '../mainflux/mainflux.module';
import { MainFluxService } from '../mainflux/mainflux.service';
import { AuthModule } from '../core/auth/auth.module';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../core/auth/auth.service';

@Module({
  imports: [PrismaClientMygateModule, MyGateModule, MainFluxModule, AuthModule],
  controllers: [MyGateLogsController],
  providers: [
    MyGateLogsService,
    MyGateService,
    MainFluxService,
    AuthService,
    ConfigService,
  ],
})
export class MyGateLogsModule {}
