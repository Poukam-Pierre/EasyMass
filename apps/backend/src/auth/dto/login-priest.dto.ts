import { IsEmail, IsNotEmpty } from 'class-validator';

export class loginDataDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;
}
