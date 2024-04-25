import { Module } from '@nestjs/common';
import { MyGateCardsController } from './mygate-cards.controller';
import { MyGateCardsService } from './mygate-cards.service';
import { PrismaClientMygateModule } from '@fnt-flsy/prisma-client-mygate';
import { MyGateModule } from '../mygate/mygate.module';
import { AuthModule } from '../core/auth/auth.module';
import { AuthService } from '../core/auth/auth.service';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [PrismaClientMygateModule, MyGateModule, AuthModule],
  controllers: [MyGateCardsController],
  providers: [MyGateCardsService, AuthService, ConfigService],
})
export class MyGateCardsModule {}
