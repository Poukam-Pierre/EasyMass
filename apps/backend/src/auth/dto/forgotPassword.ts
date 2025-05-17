import { BadRequestException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'Email address of the user requesting password reset',
    example: 'easymesse@gmail.com',
  })
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    description: 'New password for the user',
    example: 'newPassword123',
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
  newPassword: string;

  @ApiProperty({
    description: 'Token for password reset',
    example: 'token123',
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}
