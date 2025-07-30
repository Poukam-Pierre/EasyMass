import { ApiHideProperty, ApiProperty, PickType } from '@nestjs/swagger';
import { OTP, OtpUsage } from '@prisma/client';
import { Exclude } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNumberString,
  IsString,
  Length,
} from 'class-validator';

export class OTPEntity implements OTP {
  @ApiProperty()
  @IsString()
  otp_id: string;

  @Exclude()
  @ApiHideProperty()
  @IsString()
  code: string;

  @IsEnum(OtpUsage)
  @ApiProperty()
  usage: OtpUsage;

  @ApiProperty()
  @IsBoolean()
  is_verified: boolean;

  @ApiProperty()
  @IsDate()
  expired_at: Date;

  @ApiProperty()
  updated_at: Date;

  @ApiProperty()
  @IsDate()
  created_at: Date;

  @ApiProperty()
  @IsString()
  user_id: string;

  constructor(props: OTPEntity) {
    Object.assign(this, props);
  }
}

export class OTPUsageDto extends PickType(OTPEntity, ['usage']) {}

export class OTPPayloadDto {
  @ApiProperty()
  @IsString()
  otp_id: string;

  @ApiProperty()
  @IsNumberString()
  @Length(5)
  code: string;

  constructor(props: OTPPayloadDto) {
    Object.assign(this, props);
  }
}
