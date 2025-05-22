import { ReplicationPeriodEnum } from '@easyMesseLibs/types';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
} from 'class-validator';

export class CreateMassDto {
  @ApiProperty({
    description: "mass's price",
    example: `xaf${2500}`,
  })
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @ApiProperty({
    description: 'Date when the mass will be proceed',
    example: new Date(),
  })
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  processAt: Date;

  @ApiProperty({
    description: 'Given if mass has to be replicate throught the time of not',
    example: false,
  })
  @IsBoolean()
  @IsNotEmpty()
  canReplicate: boolean;

  @ApiProperty({
    description: 'Given period mass might be replicate',
    example: 'YEARLY',
  })
  @IsEnum(ReplicationPeriodEnum, {
    message: 'Provided value does not support',
  })
  period: ReplicationPeriodEnum;
}
