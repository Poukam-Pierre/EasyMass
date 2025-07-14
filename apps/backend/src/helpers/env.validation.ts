import { plainToInstance } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsFQDN,
  IsNumber,
  IsPort,
  IsString,
  IsStrongPassword,
  validateSync,
} from 'class-validator';

enum Environment {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  TEST = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;
  @IsPort()
  PORT: string;

  @IsNumber()
  SALT_ROUNDS: number;

  @IsString()
  DATABASE_URL: string;

  @IsStrongPassword()
  JWT_SECRET: string;

  // @IsFQDN()
  // SMTP_HOST: string;

  // @IsPort()
  // SMTP_PORT: string;

  // @IsString()
  // APP_EMAIL_PASS: string;

  // @IsEmail({ allow_display_name: true })
  // APP_EMAIL: string;

  @IsString()
  REDIS_HOST: string;

  @IsPort()
  REDIS_PORT: string;
}
export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
