import { IsNumber, IsOptional, Min } from 'class-validator';

export class UpdatePlatformSettingsDto {
  @IsNumber()
  @Min(0)
  @IsOptional()
  platformFeePercentage?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  platformFeeFixedAmount?: number;
}
