import { serverConfiguration } from '@app/configuration';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { transformAndValidate } from './common/pipes/validate';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(transformAndValidate);
  await app.listen(serverConfiguration.port);
}
bootstrap();
