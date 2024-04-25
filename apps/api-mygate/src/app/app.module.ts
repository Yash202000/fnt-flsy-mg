import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DevicesModule } from './devices/devices.module';
import { MyGateCardsModule } from './mygate-cards/mygate-cards.module';
import { MyGateModule } from './mygate/mygate.module';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { MainFluxModule } from './mainflux/mainflux.module';
import { MyGateLogsModule } from './mygate-logs/mygate-logs.module';
import { PrismaClientMygateModule } from '@fnt-flsy/prisma-client-mygate';
import { MyGateLogsService } from './mygate-logs/mygate-logs.service';
import { MyGateService } from './mygate/mygate.service';
import { MainFluxService } from './mainflux/mainflux.service';
import { AuthModule } from './core/auth/auth.module';
import { AuthService } from './core/auth/auth.service';
import { CommunicationModule } from './communication/communication.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    DevicesModule,
    MyGateCardsModule,
    MyGateModule,
    MainFluxModule,
    MyGateLogsModule,
    PrismaClientMygateModule,
    AuthModule,
    CommunicationModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    MyGateLogsService,
    MyGateService,
    MainFluxService,
    AuthService,
  ],
})
export class AppModule {}
