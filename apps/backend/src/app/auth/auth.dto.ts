import {
  ApiProperty,
  ApiPropertyOptional,
  OmitType,
  PickType,
} from '@nestjs/swagger';
import { PreferredLanguage, Role } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsJWT,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class AuthTokensDto {
  @IsJWT()
  @IsString()
  @ApiProperty()
  access_token: string;

  @IsJWT()
  @IsString()
  @ApiProperty()
  refresh_token: string;

  @ApiProperty({ type: Number, description: 'Issuance date in milliseconds' })
  issued_at: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'One time password identifier for unverified accounts',
  })
  otp_id?: string;

  constructor(props: AuthTokensDto) {
    Object.assign(this, props);
  }
}

export class AccessTokenResponse extends OmitType(AuthTokensDto, [
  'refresh_token',
]) {
  @ApiProperty({ description: 'token duration in milliseconds' })
  expires_in: number;

  @ApiProperty({ description: 'Bearer' })
  token_type = 'Bearer' as const;

  constructor(props: AccessTokenResponse) {
    super(props);
    Object.assign(this, props);
  }
}

export class LoginDataDto {
  @IsEmail()
  @Transform(({ value }) => value.trim().toLowerCase())
  @ApiProperty({
    description: 'Valid user email',
  })
  email: string;

  @IsString()
  @IsStrongPassword()
  @ApiProperty({
    description: 'Strong password',
  })
  password: string;

  constructor(props: LoginDataDto) {
    Object.assign(this, props);
  }
}

export class SignUpDto extends LoginDataDto {
  @IsString()
  @ApiProperty({
    description: 'user first name',
  })
  first_name: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'user last name',
  })
  last_name?: string;

  @IsPhoneNumber()
  @ApiProperty({
    description: 'Valid user phone number',
  })
  phone_number: string;

  @IsDateString()
  @IsOptional()
  @ApiProperty({
    description: ' User date birth',
  })
  birthdate?: Date;

  @IsEnum(PreferredLanguage)
  @IsOptional()
  @ApiProperty({
    enum: PreferredLanguage,
    default: PreferredLanguage.EN_US,
  })
  prefered_language: PreferredLanguage = PreferredLanguage.EN_US;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'user manager name',
  })
  manager_name?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'User address',
  })
  address: string;

  @IsEnum(Role)
  @ApiProperty({
    enum: Role,
    description: 'User role',
  })
  role: Role;
}

export class ForgotPasswordDto extends PickType(SignUpDto, ['email']) {}
