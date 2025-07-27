import {
  ApiProperty,
  ApiPropertyOptional,
  OmitType,
  PickType,
} from '@nestjs/swagger';
import { PreferredLanguage, Role } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsJWT,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
  ValidateIf,
} from 'class-validator';
import { OTPPayloadDto } from '../two-fa/two-fa.dto';
import { UnprocessableEntityException } from '@nestjs/common';

function IsRequiredForRoles() {
  return ValidateIf(
    (o) =>
      o.role === Role.PARISH ||
      o.role === Role.PRIEST ||
      o.role === Role.ENGENEER,
  );
}
function IsPasswordStrongEnough() {
  return IsStrongPassword(
    {
      minLength: 4,
      minLowercase: 1,
      minNumbers: 1,
      minSymbols: 1,
      minUppercase: 1,
    },
    {
      message: () => {
        throw new UnprocessableEntityException(
          'Provided password not strong enough',
          {
            cause: new Error(),
            description:
              'Provided password not strong enough. Add at least 4 characters, 1 lowercase, 1 number, 1 symbols, 1 uppercase',
          },
        );
      },
    },
  );
}
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
  @IsEmail({}, { message: 'Please enter a valid email' })
  @Transform(({ value }) => value.trim().toLowerCase())
  @ApiProperty({
    description: 'Valid user email',
  })
  email: string;

  @IsString()
  @IsPasswordStrongEnough()
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
  @IsOptional()
  @IsRequiredForRoles()
  @ApiProperty({
    description: 'user first name',
  })
  first_name: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'user last name',
  })
  last_name: string;

  @IsPhoneNumber()
  @IsOptional()
  @IsRequiredForRoles()
  @ApiProperty({
    description: 'Valid user phone number',
    example: '+237696841451',
  })
  phone_number: string;

  @IsDateString()
  @IsOptional()
  @ValidateIf((o) => o.role === Role.PRIEST)
  @ApiProperty({
    description: ' User date birth',
    example: '27/07/2025',
  })
  @Type(() => Date)
  birthdate: Date;

  @IsEnum(PreferredLanguage, {
    message: `Unsupported prefered language. Supported languages are: ${Object.values(
      PreferredLanguage,
    ).join(', ')}`,
  })
  @IsOptional()
  @ApiProperty({
    enum: PreferredLanguage,
    default: PreferredLanguage.EN_US,
  })
  prefered_language: PreferredLanguage = PreferredLanguage.EN_US;

  @IsString()
  @ValidateIf((o) => o.role === Role.PARISH)
  @IsOptional()
  @ApiProperty({
    description: 'user manager name',
  })
  manager_name: string;

  @IsString()
  @IsOptional()
  @IsRequiredForRoles()
  @ApiProperty({
    description: 'User address',
  })
  address: string;

  @IsEnum(Role, {
    message: `Unsupported user role. Supported roles are: ${Object.values(
      Role,
    ).join(', ')}`,
  })
  @ApiProperty({
    enum: Role,
    description: 'User role',
  })
  role: Role;
}

export class ForgotPasswordDto extends PickType(SignUpDto, ['email']) {}

export class ResetPasswordDto extends OTPPayloadDto {
  @IsPasswordStrongEnough()
  @ApiProperty({
    description: 'Strong password',
    example: 'EasyMess@123',
  })
  new_password: string;
}
