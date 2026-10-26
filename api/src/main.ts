import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.enableCors({
    origin: config.get<string>('FRONTEND_URL', 'http://localhost:5173'),
  });
  const swaggerConfig = new DocumentBuilder()
    .setTitle("Who Doesn't Know? API")
    .setDescription("'Backend for the Who Doesn\'t Know? party game'")
    .setVersion('1.0')
    .addTag('games')
    .addTag('gameplay')
    .addTag('tips')
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, swaggerDocument);
  await app.listen(config.get<number>('PORT', 3000));
}
bootstrap();
