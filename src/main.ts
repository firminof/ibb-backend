import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as bodyParser from 'body-parser';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

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
  SwaggerModule.setup('/', app, swaggerDocument);

  console.log(swaggerDocument);

  await app.listen(process.env.PORT || 80, () => {
    console.log(`Listening on port ${process.env.PORT || 80}`);
  });
}

bootstrap();
