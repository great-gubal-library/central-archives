import { serverConfiguration } from '@app/configuration';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { RppModule } from './api/rpp/rpp.module';
import { AppModule } from './app.module';
import { transformAndValidate } from './common/pipes/validate';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(transformAndValidate);

  if (serverConfiguration.apis.rpp) {
    // Add Swagger for RPP API
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Chaos Archives RPP API')
      .setVersion('1.0')
      .addBearerAuth({
        type: 'apiKey',
        description: 'Access token obtained by /login'
      })
      .build();

    const swaggerDoc = SwaggerModule.createDocument(app, swaggerConfig, {
      include: [ RppModule ],
    });
    SwaggerModule.setup('api/rpp/swagger', app, swaggerDoc);
  }

  await app.listen(serverConfiguration.port);
}
void bootstrap();
