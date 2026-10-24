import { IsNotEmpty, IsString } from 'class-validator';
import { IsAccountPassword } from '../../common/account-password';

export class CompleteAccountSetupDto {
  /** The raw token from the emailed link's `?token=` query parameter. */
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsAccountPassword()
  password: string;
}
