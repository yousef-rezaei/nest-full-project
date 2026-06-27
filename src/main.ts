import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import passport from 'passport';
import session from 'express-session';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
// i18n CookieResolver reads the "lang" cookie
import cookieParser = require('cookie-parser');

import { I18nValidationPipe } from 'nestjs-i18n';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // enable cookies for the i18n CookieResolver (lang)
  app.use(cookieParser());

  app.useGlobalPipes(
    new I18nValidationPipe({
      whitelist: true,
    }),
  );

  app.use(
    session({
      secret: config.get<string>('SESSION_SECRET', 'change-me'),
      resave: false,
      saveUninitialized: false,
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());
  const swaggerConfig = new DocumentBuilder()
    .setTitle('My Products Site')
    .setDescription('REST API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);
  await app.listen(config.get<number>('PORT', 3000));
}
bootstrap();
