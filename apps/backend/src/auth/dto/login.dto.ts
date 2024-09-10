import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDataDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;
  
  constructor(props: LoginDataDto) {
     Object.assign(this, props);
  }
}

export class ParishDataDto {
  id: number;
  name: string;
  email: string;
  phone: string;
  city: string;
  region: string;
  diocese: string;
  leadManager: string;
  adminId: number;
  createdAt: Date;
  accessToken?: string;
  refreshToken?: string;
}

export class AdminDataDto {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  createdAt: Date;
  accessToken?: string;
  refreshToken?: string;
}

export class PriestDataDto {
  id?: number;
  firstName: string;
  secondName: string;
  image?: string;
  birthDate: Date;
  phone: string;
  authNumber: string;
  availability: boolean;
  email: string;
  accessToken?: string;
  refreshToken?: string;
}
