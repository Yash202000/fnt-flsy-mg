import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app/app.module';
import { PORT } from './app/core/consts/env.consts';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const port = PORT || 3000;

  const config = new DocumentBuilder()
    .setTitle('FountLab Flux MyGate API')
    .setDescription('FountLab Flux MyGate API')
    .setVersion('1.0')
    .addTag('mygate')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  app.useStaticAssets(join(__dirname, '..','..','..','apps','api-mygate','src','assets', 'public'));
  app.setBaseViewsDir(join(__dirname, '..','..','..','apps','api-mygate','src','assets', 'views'));
  app.setViewEngine('hbs');

  await app.listen(port);
  Logger.log(`🚀 Application is running on: http://localhost:${port}`);
}

bootstrap();
