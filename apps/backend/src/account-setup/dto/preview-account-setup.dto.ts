import { IsNotEmpty, IsString } from 'class-validator';

export class PreviewAccountSetupDto {
  /** The raw token from the emailed link's `?token=` query parameter. */
  @IsString()
  @IsNotEmpty()
  token: string;
}
