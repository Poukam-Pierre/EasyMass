import { IsEmail, IsNotEmpty } from 'class-validator';

export class SignUpDataDto {
  firstName: string;
  secondName: string;
  image?: string;
  birthDate: string;
  phone: string;
  authCardImge?: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  availability: boolean;
  authNumber: string;
  password: string;
}

export class SignUpAdminDto {
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  password: string;
  phone: string;
  role: Role;
}

export enum Role {
  ENGENEER = 'ENGENEER',
  ADMIN = 'ADMIN',
}
