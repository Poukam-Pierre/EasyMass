import { ClassSerializerInterceptor, Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';

import { AppModule } from './app.module';

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  app.useGlobalPipes(new ValidationPipe());
  // Strips @Exclude()-marked fields (e.g. password) from every response
  // whose payload is an instance of a DTO class using that decorator.
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.enableCors({
    origin: 'http://localhost:4200', // remote url server should be added here to avoid CORS issue
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
