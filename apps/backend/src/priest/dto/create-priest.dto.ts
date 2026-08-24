import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

/** No email/password — priest roster entries are parish-managed, not
 * self-service accounts, while priest login is deferred. */
export class CreatePriestDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  secondName: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsString()
  @IsNotEmpty()
  birthDate: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  authNumber: string;

  @IsString()
  @IsOptional()
  authCardImage?: string;

  @IsBoolean()
  @IsOptional()
  available?: boolean;
}
