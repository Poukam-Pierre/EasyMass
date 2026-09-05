import { IsNumber, IsOptional, Min } from 'class-validator';

// Currency is intentionally not editable here — changing a band's currency
// after the fact would require re-running the overlap check against a
// completely different set of bands; deleting and recreating is simpler and
// just as fast for an admin managing a handful of bands per currency.
export class UpdateMassPriceBandDto {
  @IsNumber()
  @Min(0)
  @IsOptional()
  minPrice?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  maxPrice?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  amount?: number;
}
