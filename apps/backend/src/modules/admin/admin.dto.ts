import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';
import { SignUpDto } from '../../app/auth/auth.dto';

export class CreateAdminDto extends SignUpDto {
  @IsNumber()
  @IsOptional()
  @ApiProperty({ type: Number, description: 'The balance of the admin' })
  balance = 0;
}

export class AdminProfileDto extends PickType(SignUpDto, [
  'first_name',
  'email',
]) {
  constructor(props: AdminProfileDto) {
    super(props);
    Object.assign(this, props);
  }
}
