import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

class CityDto {
  @ApiProperty({
    description: 'The ID of the city',
    example: 'a1e',
  })
  @IsString()
  @IsNotEmpty()
  city_id: string;

  @ApiProperty({
    description: 'The name of the city',
    example: 'New York',
  })
  @IsString()
  @IsNotEmpty()
  city_name: string;
}
/** No password field — the parish chooses its own through the emailed
 * account-setup link (see AccountSetupService), so the admin creating the
 * account never knows it. */
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
  managerName: string;

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
  city: CityDto;
}
