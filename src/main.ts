import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as path from 'path';
import { json } from 'express';
import { NestExpressApplication } from '@nestjs/platform-express';
import { setupSwagger } from './common/swagger/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(json({ limit: '100mb' }));
  app.useGlobalPipes(new ValidationPipe());
  const uploadsPath =
    process.env.NODE_ENV === 'production'
      ? path.join(__dirname, 'uploads') // dist/uploads
      : path.join(process.cwd(), 'uploads'); // корень/uploads

  app.useStaticAssets(uploadsPath, {
    prefix: '/uploads',
  });

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, Authorization',
    credentials: true,
  });

  if (process.env.NODE_ENV !== 'production') {
    setupSwagger(app);
  }

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
