// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BigIntTransformInterceptor } from './common/interceptors/bigint-transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;

  const frontendDevUrl = 'http://localhost:5173';
  const codespacesOriginPattern = /^https:\/\/.*-5173\.app\.github\.dev$/;
  const productionFrontendUrl = configService.get<string>('FRONTEND_URL');

  const allowedOrigins = [
    frontendDevUrl,
    codespacesOriginPattern,
    productionFrontendUrl,
  ].filter(Boolean);

  console.log('[Manual CORS] Allowed Origins:', allowedOrigins.map(o => o.toString()));

  app.use((req, res, next) => {
    const requestOrigin = req.headers.origin;
    let originToAllow = '';

    if (requestOrigin && allowedOrigins.some(o => typeof o === 'string' ? o === requestOrigin : o.test(requestOrigin))) {
      originToAllow = requestOrigin;
    }

    if (originToAllow) {
      res.header('Access-Control-Allow-Origin', originToAllow);
      res.header('Access-Control-Allow-Credentials', 'true');
    } else if (requestOrigin) {
      console.warn(`[Manual CORS] Origin ${requestOrigin} is not in allowedOrigins.`);
    }

    if (req.method === 'OPTIONS') {
      console.log('[Manual OPTIONS] Handling preflight for origin:', requestOrigin);
      res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
      res.header('Access-Control-Allow-Private-Network', 'true');
      return res.sendStatus(204);
    }

    next();
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));
  app.useGlobalInterceptors(new BigIntTransformInterceptor());

  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();