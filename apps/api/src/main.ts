import "reflect-metadata";
import { Logger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: false });

  app.setGlobalPrefix("api/v1");

  const corsOrigins = (
    process.env.CORS_ORIGINS ?? "http://localhost:3000,http://localhost:3002"
  )
    .split(",")
    .map((o) => o.trim());
  app.enableCors({ origin: corsOrigins, credentials: true });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle("OnGo Brain API")
    .setDescription(
      "Central orchestration API for the OnGo AI Business Operating Platform. " +
        "Every agent action routes through POST /brain/actions and is gated by the approval policy.",
    )
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("api/docs", app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = Number(process.env.API_PORT ?? 3001);
  await app.listen(port);
  Logger.log(
    `OnGo Brain → http://localhost:${port}/api/v1  (Swagger: /api/docs)`,
    "Bootstrap",
  );
}

void bootstrap();
