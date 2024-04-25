import { Controller, UseGuards } from '@nestjs/common';
import { AuthGuard } from './core/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller()
export class AppController {}
