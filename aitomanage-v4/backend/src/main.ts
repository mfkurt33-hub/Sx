import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import mongoose from 'mongoose';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Config service
  const configService = app.get(ConfigService);

  // MongoDB connection
  const mongoUri = configService.get<string>('MONGODB_URI') || 'mongodb://localhost:27017/aitomanage';
  await mongoose.connect(mongoUri);
  console.log('✅ MongoDB connected');

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // CORS
  app.enableCors({
    origin: configService.get<string>('FRONTEND_URL') || 'http://localhost:3000',
    credentials: true,
  });

  // API prefix
  app.setGlobalPrefix('api/v1');

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('AiToManage API')
    .setDescription('AI-Powered Social Media Management Platform API')
    .setVersion('4.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management')
    .addTag('organizations', 'Organization management')
    .addTag('accounts', 'Social media accounts')
    .addTag('posts', 'Content posts')
    .addTag('ai', 'AI services')
    .addTag('invoices', 'Invoice management')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // Port
  const port = configService.get<number>('BACKEND_PORT') || 3001;
  await app.listen(port);
  
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/docs`);
}

bootstrap();
