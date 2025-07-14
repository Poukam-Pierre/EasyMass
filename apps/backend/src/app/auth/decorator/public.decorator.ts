import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export enum ROLE {
  ENGENEER = 'ENGENEER',
  ADMIN = 'ADMIN',
}
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
export const Role = (...role: ROLE[]) => SetMetadata('role', role);
