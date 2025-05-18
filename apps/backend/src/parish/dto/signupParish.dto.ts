import { BadRequestException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CityDto {
  @ApiProperty({
    description: 'The ID of the city',
    example: 'a1e',
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  city_id: string;

  @ApiProperty({
    description: 'The name of the city',
    example: 'New York',
  })
  @IsString()
  @IsNotEmpty()
  city_name: string;
}
export class SignUpParishDto {
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
    description: 'The city of the parish',
    example: { city_id: 'a1e', city_name: 'New York' },
  })
  @Type(() => CityDto)
  city: CityDto;
}
