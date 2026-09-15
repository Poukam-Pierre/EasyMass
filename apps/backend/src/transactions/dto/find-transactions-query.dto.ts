import { TransactionType } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { DateRangeQueryDto } from '../../common/dto/date-range-query.dto';

export class FindTransactionsQueryDto extends DateRangeQueryDto {
  @IsString()
  parishId: string;

  @IsEnum(TransactionType)
  @IsOptional()
  transactionType?: TransactionType;
}
