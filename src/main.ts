import {NestFactory, Reflector} from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import {ClassSerializerInterceptor, Logger, ValidationPipe} from '@nestjs/common';
import * as bodyParser from 'body-parser';
import * as dotenv from 'dotenv';
import * as process from "process";

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  const port = process.env.PORT || 3001;
  const appPrefix = 'v1';
  const swaggerPrefix = 'api';

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const swaggerDocumentBuilder = new DocumentBuilder()
      .setTitle('IGREJA BATISTA DO BROOKLIN')
      .setVersion('1.0')
      .addBearerAuth(
          {
            description: 'Please enter token in following format: Bearer <JWT>',
            name: 'Authorization',
            scheme: 'Bearer',
            type: 'http',
            in: 'Header',
          },
          'access-token',
      )
      .build();

  app.enableCors();

  app.use(bodyParser.urlencoded({ limit: '300mb', extended: true }));
  app.use(bodyParser.json({ limit: '300mb' }));

  const swaggerDocument = SwaggerModule.createDocument(
      app,
      swaggerDocumentBuilder,
  );
  SwaggerModule.setup('api', app, swaggerDocument);

  // console.log(swaggerDocument);

  await app.listen( port, () => {
      Logger.log(`🚀 Application is running on: http://localhost:${port}/${appPrefix}`);
      Logger.log(`🚀 Swagger is running on: http://localhost:${port}/${swaggerPrefix}`);
  });
}

bootstrap();
