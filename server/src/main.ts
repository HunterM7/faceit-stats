import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppConfigService } from './config/app-config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(AppConfigService);
  config.validateRequired();

  app.enableCors({
    origin: config.corsOrigin,
  });

  await app.listen(config.port);
  console.log(`[api] http://localhost:${config.port}`);
}

bootstrap().catch((error: unknown) => {
  console.error('[fatal]', (error as Error).message);
  process.exitCode = 1;
});
