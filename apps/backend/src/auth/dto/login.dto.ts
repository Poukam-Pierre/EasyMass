import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDataDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;
}

export class ParishDataDto {
  id: number;
  name: string;
  email: string;
  token?: string | null;
  phone: string;
  city: string;
  region: string;
  diocese: string;
  leadManager: string;
  createdAt: Date;
}
