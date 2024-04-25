import { Module } from '@nestjs/common';
import { MainFluxService } from './mainflux.service';

@Module({
  providers: [MainFluxService],
})
export class MainFluxModule {}
