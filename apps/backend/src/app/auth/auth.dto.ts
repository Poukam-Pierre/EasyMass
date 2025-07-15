import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { IsJWT, IsString } from 'class-validator';

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

  @ApiProperty({ type: 'Bearer' })
  token_type = 'Bearer' as const;

  constructor(props: AccessTokenResponse) {
    super(props);
    Object.assign(this, props);
  }
}
