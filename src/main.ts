// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;

  const frontendDevUrl = 'http://localhost:5173';
  const codespacesOriginPattern = /https:\/\/.*\.app\.github\.dev$/;
  const productionFrontendUrl = configService.get<string>('FRONTEND_URL');

  console.log('[CORS Debug] FRONTEND_URL from env:', productionFrontendUrl);

  const allowedOrigins = [
    frontendDevUrl,
    codespacesOriginPattern,
    productionFrontendUrl
  ].filter(Boolean);

  console.log('[CORS Debug] Allowed Origins:', allowedOrigins);

  app.enableCors({
    origin: (origin, callback) => {
      console.log('[CORS Debug] Incoming Origin:', origin);
      let allowed = false;
      if (!origin || allowedOrigins.some(o => {
        if (typeof o === 'string') {
          return o === origin;
        } else if (o instanceof RegExp) {
          return o.test(origin);
        }
        return false;
      })) {
        allowed = true;
      }

      if (allowed) {
        console.log('[CORS Debug] Allowed for origin:', origin);
        callback(null, true);
      } else {
        console.error('[CORS Debug] Blocked for origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();