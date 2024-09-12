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

export class SignUpParishDto {
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;

  phone: string;
  city: string;
  region: string;
  diocese: string;
  leadManager: string;
  createdByAdmin: {
    connect: {
      id: number;
    };
  };
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
