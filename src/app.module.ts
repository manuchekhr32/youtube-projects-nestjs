import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { EnvVars } from './shared/enum/env';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        [EnvVars.PORT]: Joi.number(),
        [EnvVars.SWAGGER]: Joi.bool(),
        [EnvVars.CORS]: Joi.string(),
        // Postgres
        [EnvVars.DB_USER]: Joi.string(),
        [EnvVars.DB_PASSWORD]: Joi.string(),
        [EnvVars.DB_NAME]: Joi.string(),
        [EnvVars.DB_HOST]: Joi.string(),
        [EnvVars.DB_PORT]: Joi.number(),
      }),
      validationOptions: {
        allowUnknown: true,
        abortEarly: true,
      },
    }),
  ],
})
export class AppModule {}
