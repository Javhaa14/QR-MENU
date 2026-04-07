import { ValidationPipe, type INestApplication } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module";

let app: INestApplication;

async function bootstrap() {
  app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const port = Number(process.env.PORT) || 3001;
  await app.listen(port);
  return app;
}

// Support for Vercel Serverless
export default async (req: any, res: any) => {
  if (!app) {
    app = await NestFactory.create(AppModule);
    app.enableCors({ origin: true, credentials: true });
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.init();
  }
  const instance = app.getHttpAdapter().getInstance();
  return instance(req, res);
};

// Standalone mode
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  void bootstrap();
}
