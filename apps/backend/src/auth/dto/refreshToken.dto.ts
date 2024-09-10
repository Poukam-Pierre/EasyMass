import { IsEmail, IsNotEmpty } from 'class-validator';

export class RefreshToken {
  @IsNotEmpty()
  id: number;
  refreshToken: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class NewTokens {
  @IsNotEmpty()
  accessToken: string;
  refreshToken: string;
}
