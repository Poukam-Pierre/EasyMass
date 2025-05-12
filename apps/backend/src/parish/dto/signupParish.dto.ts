import { IsEmail, IsNotEmpty } from 'class-validator';

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
