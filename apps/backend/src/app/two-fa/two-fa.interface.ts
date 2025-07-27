import { OtpUsage } from '@prisma/client';

export enum TwoFAEnum {
  OTP = 'otp',
}
export interface ITwoFAService<TDATA> {
  request: (userId: string, usage: OtpUsage) => Promise<TDATA> | TDATA;
  verify: (id: string, data: unknown) => Promise<boolean> | boolean;
}
