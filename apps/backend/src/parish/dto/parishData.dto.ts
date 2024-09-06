import { IsEmail, IsNotEmpty } from 'class-validator';

export class ParishDataDto {
  @IsNotEmpty()
  id: number;
  name: string;
  adminId: number;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  phone: string;
  city: string;
  region: string;
  diocese: string;
  leadManager: string;
  createdAt: Date;
  balance: number;
  accessToken?: string;
  refreshToken?: string;

  constructor(props: ParishDataDto) {
    Object.assign(this, props);
  }
}
