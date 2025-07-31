import { ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import {
  IsEmail,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';
import { SignUpDto } from '../../app/auth/auth.dto';

export class CreateParishDto extends SignUpDto {
  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional({
    type: Number,
    description: 'The balance of the admin',
  })
  balance: number | null = 0;
}

export class UpdateParishDto extends PickType(CreateParishDto, ['balance']) {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'The ID of the parish',
    example: 'a1e',
  })
  user_id: string;

  @IsString()
  @IsOptional()
  @Expose({ name: 'name' })
  @ApiPropertyOptional({
    description: 'user first name',
  })
  first_name: string;

  @IsPhoneNumber()
  @IsOptional()
  @Expose({ name: 'contact' })
  @ApiPropertyOptional({
    description: 'Valid user phone number',
    example: '+237696841451',
  })
  phone_number: string;

  @IsString()
  @IsOptional()
  @Expose({ name: 'leadName' })
  @ApiPropertyOptional({
    description: 'user manager name',
  })
  manager_name: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'User address',
  })
  address: string;

  @IsEmail({}, { message: 'Please enter a valid email' })
  @Transform(({ value }) => value.trim().toLowerCase())
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Valid user email',
  })
  email: string;
}

export class ParishDto extends UpdateParishDto {
  statistics?: Record<string, object>;

  constructor(props: ParishDto) {
    super(props);
    Object.assign(this, props);
  }
}
