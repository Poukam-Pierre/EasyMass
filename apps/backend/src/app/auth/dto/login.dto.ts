import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class LoginDataDto {
  @IsEmail()
  @Transform(({ value }) => value.trim().toLowerCase())
  @ApiProperty({
    description: 'Valid user email',
  })
  email: string;

  @IsString()
  @IsStrongPassword()
  @ApiProperty({
    description: 'Strong password',
  })
  password: string;

  constructor(props: LoginDataDto) {
    Object.assign(this, props);
  }
}

export class ParishDataDto {
  @IsNotEmpty()
  id: number;
  name: string;
  adminId: number;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  phone: string;
  manager_name: string;
  createdAt: Date;
  balance: number;
  accessToken?: string;
  refreshToken?: string;

  constructor(props: ParishDataDto) {
    Object.assign(this, props);
  }
}

export class AdminDataDto {
  @IsNotEmpty()
  id: number;
  name: string;
  role: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  phone: string;
  createdAt: Date;
  accessToken?: string;
  refreshToken?: string;

  constructor(props: AdminDataDto) {
    Object.assign(this, props);
  }
}

export class PriestDataDto {
  id?: number;

  @IsNotEmpty()
  firstName: string;
  secondName: string;
  authNumber: string;
  availability: boolean;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  image?: string;
  birthDate: string;
  phone: string;
  balance: number;
  accessToken?: string;
  refreshToken?: string;

  constructor(props: PriestDataDto) {
    Object.assign(this, props);
  }
}

export class LogoutDataDto {
  @ApiProperty({
    description: 'Refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
