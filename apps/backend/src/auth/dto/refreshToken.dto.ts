import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}

export class NewTokens {
  @IsNotEmpty()
  accessToken: string;
  refreshToken: string;
}
