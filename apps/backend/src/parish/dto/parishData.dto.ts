import { BadRequestException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
} from 'class-validator';

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
  receiverId?: string;
  accessToken?: string;
  refreshToken?: string;

  constructor(props: ParishDataDto) {
    Object.assign(this, props);
  }
}

export class ParishDataCreation {
  @ApiProperty({
    description: 'The name of the parish',
    example: "St. Mary's Church",
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The phone number of the lead parish',
    example: '1234567890',
  })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    description: 'Name of the lead parish manager',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  manager_name: string;

  @ApiProperty({
    description: 'The email of the lead parish',
    example: 'easymess@gmail.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'The password of the account',
    example: 'password123',
  })
  @IsStrongPassword(
    {
      minLength: 4,
      minLowercase: 1,
      minNumbers: 1,
      minSymbols: 1,
      minUppercase: 1,
    },
    {
      message: () => {
        throw new BadRequestException(
          'Password does not meet security requirements.',
          {
            cause: new Error(),
            description:
              'Provided password not strong enough. Add at least 4 characters, 1 lowercase, 1 number, 1 symbols, 1 uppercase',
          }
        );
      },
    }
  )
  password: string;
}
