import { ClassSerializerInterceptor, Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from './app.module';

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // The API is only reachable through Caddy (one hop) — trust its
  // X-Forwarded-For so req.ip is the real client, not Caddy's container IP.
  // Without this, every @RateLimited route shares one bucket for everyone.
  app.set('trust proxy', 1);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  app.useGlobalPipes(new ValidationPipe());
  // Strips @Exclude()-marked fields (e.g. password) from every response
  // whose payload is an instance of a DTO class using that decorator.
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  // CORS_ORIGINS is a comma-separated list (e.g. production domains); falls
  // back to the local dev ports for easy-messe/admin-ui/parish when unset.
  const corsOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim())
    : ['http://localhost:4200', 'http://localhost:4300', 'http://localhost:4400'];
  app.enableCors({
    origin: corsOrigins,
    methods: 'GET, POST, PATCH, DELETE',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Easy Messe API')
    .setDescription(
      'The Easy Messe API is a RESTful API for managing church masses and related data.'
    )
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
