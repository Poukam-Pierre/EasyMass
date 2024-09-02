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
  phone: string;
  city: string;
  region: string;
  diocese: string;
  leadManager: string;
  adminId: number;
  createdAt: Date;
  balance: number;
  accessToken?: string;
  refreshToken?: string;

  constructor(props: ParishDataDto) {
    Object.assign(this, props);
  }
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

  constructor(props: AdminDataDto) {
    Object.assign(this, props);
  }
}

export class PriestDataDto {
  id?: number;
  firstName: string;
  secondName: string;
  image?: string;
  birthDate: string;
  phone: string;
  authNumber: string;
  availability: boolean;
  email: string;
  balance: number;
  accessToken?: string;
  refreshToken?: string;

  constructor(props: PriestDataDto) {
    Object.assign(this, props);
  }
}
