import { IsEmail, IsNotEmpty, IsStrongPassword } from 'class-validator';

export class SignUpDataDto {
  firstName: string;
  secondName: string;
  image?: string;
  birthDate: Date;
  phone: string;
  authNumber: string;
  authCardImge?: string;
  availability: boolean;
  email: string;
  password: string;
}

export class SignUpParish {
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsStrongPassword()
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
