import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; 
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard'; 
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, 
    forbidNonWhitelisted: true, 
    transform: true, 
  }));
  app.useGlobalGuards(new JwtAuthGuard(app.get(Reflector)));
  app.setGlobalPrefix('api'); 
  app.enableCors({
    origin: process.env.APP_BACKEND || 'http://localhost:3000', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.listen(process.env.APP_BACKEND || 4000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();