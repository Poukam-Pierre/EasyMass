import { Exclude } from 'class-transformer';
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
  @IsNotEmpty()
  parishId: string;
  userId: string;
  name: string;
  adminId: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Exclude()
  password: string;

  phone: string;
  managerName: string;
  createdAt: Date;
  accessToken?: string;
  refreshToken?: string;

  constructor(props: ParishDataDto) {
    Object.assign(this, props);
  }
}

export class AdminDataDto {
  @IsNotEmpty()
  adminId: string;
  userId: string;
  name: string;
  role: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Exclude()
  password: string;

  phone: string;
  createdAt: Date;
  accessToken?: string;
  refreshToken?: string;

  constructor(props: AdminDataDto) {
    Object.assign(this, props);
  }
}
