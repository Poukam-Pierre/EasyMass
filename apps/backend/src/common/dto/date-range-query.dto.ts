import { IsDateString, IsOptional } from 'class-validator';
import { PaginationQueryDto } from './pagination-query.dto';

/** Paginated list filtered to a `createdAt` range — both bounds optional,
 * either end open means unbounded on that side. */
export class DateRangeQueryDto extends PaginationQueryDto {
  @IsDateString()
  @IsOptional()
  from?: string;

  @IsDateString()
  @IsOptional()
  to?: string;
}
