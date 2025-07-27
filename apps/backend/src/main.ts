import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import { NextFunction, Request, Response } from 'express';
import path from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: {
      origin:
        process.env.NODE_ENV === 'production'
          ? // TODO: Replace with your production URL
            'https://your-production-url.com'
          : /^http:\/\/localhost(:\d+)?$/, // Allow localhost for development
      credentials: true
    },
    rawBody: true // Enable raw body parsing
  });

  app.use(cookieParser());
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.enableShutdownHooks();

  // Global configuration
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.url == '/') {
      return res.redirect('/api');
    }

    next();
  });

  app.useStaticAssets(path.join(__dirname, './assets'));
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // Swagger configuration
  {
    const config = new DocumentBuilder()
      .setTitle('Easy Messe API')
      .setDescription(
        'The Easy Messe API is a RESTful API for managing church masses and related data.'
      )
      .setVersion('1.0')
      .addBearerAuth()
      .addCookieAuth('refresh_token')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document, {
      customSiteTitle: 'Easy Mess APIs docs'
    });
  }

  const port = process.env.PORT || 5000;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix} (${process.env.NODE_ENV})`
  );
}

global.XMLHttpRequest = require('xhr2');

bootstrap();
